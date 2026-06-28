using System.Security.Claims;
using JAdmin.Common;
using JAdmin.Dtos.Auth;
using JAdmin.Entities;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace JAdmin.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    IAuthService authService,
    ITwoFactorService twoFactorService,
    UserManager<ApplicationUser> userManager,
    IWebHostEnvironment environment) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        if (!result.Success)
            return result.ToActionResult(this);

        SetAuthCookies(result.Data!);
        return Ok(result.Data);
    }

    [HttpPost("register")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.RegisterAsync(request, cancellationToken);
        if (!result.Success)
            return result.ToActionResult(this);

        return CreatedAtAction(nameof(Me), new { }, result.Data);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest? request, CancellationToken cancellationToken)
    {
        var refreshToken = request?.RefreshToken ?? Request.Cookies["refresh_token"];
        var result = await authService.RefreshAsync(refreshToken, cancellationToken);
        if (!result.Success)
            return result.ToActionResult(this);

        SetAuthCookies(result.Data!);
        return Ok(result.Data);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest? request, CancellationToken cancellationToken)
    {
        var refreshToken = request?.RefreshToken ?? Request.Cookies["refresh_token"];
        await authService.LogoutAsync(refreshToken, cancellationToken);
        RemoveAuthCookies();
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await authService.GetCurrentUserAsync(userId, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpPost("2fa/setup")]
    [Authorize]
    public async Task<IActionResult> SetupTwoFactor(CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserEntityAsync(cancellationToken);
        if (user is null) return NotFound();
        return Ok(await twoFactorService.GenerateSetupAsync(user, cancellationToken));
    }

    [HttpPost("2fa/enable")]
    [Authorize]
    public async Task<IActionResult> EnableTwoFactor([FromBody] EnableTwoFactorRequest request, CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserEntityAsync(cancellationToken);
        if (user is null) return NotFound();
        var result = await twoFactorService.EnableAsync(user, request.Code, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpPost("2fa/disable")]
    [Authorize]
    public async Task<IActionResult> DisableTwoFactor([FromBody] DisableTwoFactorRequest request, CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserEntityAsync(cancellationToken);
        if (user is null) return NotFound();
        var result = await twoFactorService.DisableAsync(user, request.Password, request.Code, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpGet("2fa/status")]
    [Authorize]
    public async Task<IActionResult> TwoFactorStatus(CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserEntityAsync(cancellationToken);
        if (user is null) return NotFound();
        return Ok(new TwoFactorStatusResponse
        {
            TwoFactorEnabled = await twoFactorService.IsEnabledAsync(user, cancellationToken)
        });
    }

    private async Task<ApplicationUser?> GetCurrentUserEntityAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userId is null ? null : await userManager.FindByIdAsync(userId);
    }

    private void SetAuthCookies(AuthResponse response)
    {
        var secure = !environment.IsDevelopment();
        var sameSite = environment.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.Strict;

        Response.Cookies.Append("access_token", response.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = sameSite,
            Expires = response.ExpiresAt
        });

        Response.Cookies.Append("refresh_token", response.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = sameSite,
            Expires = response.RefreshExpiresAt
        });
    }

    private void RemoveAuthCookies()
    {
        Response.Cookies.Delete("access_token");
        Response.Cookies.Delete("refresh_token");
    }
}
