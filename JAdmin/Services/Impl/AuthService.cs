using JAdmin.Common;
using JAdmin.Dtos.Auth;
using JAdmin.Entities;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JAdmin.Services.Impl;

public class AuthService(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    IRefreshTokenService refreshTokenService,
    ITwoFactorService twoFactorService) : IAuthService
{
    public async Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            if (user is not null)
                await userManager.AccessFailedAsync(user);
            return ServiceResult<AuthResponse>.Fail("Invalid credentials", StatusCodes.Status401Unauthorized);
        }

        if (await userManager.IsLockedOutAsync(user))
            return ServiceResult<AuthResponse>.Fail("Account locked out", StatusCodes.Status401Unauthorized);

        await userManager.ResetAccessFailedCountAsync(user);

        if (await twoFactorService.IsEnabledAsync(user, cancellationToken))
        {
            if (string.IsNullOrWhiteSpace(request.TwoFactorCode))
                return ServiceResult<AuthResponse>.Fail("Two-factor code required", StatusCodes.Status401Unauthorized, requiresTwoFactor: true);

            if (!await twoFactorService.ValidateCodeAsync(user, request.TwoFactorCode, cancellationToken))
                return ServiceResult<AuthResponse>.Fail("Invalid two-factor code", StatusCodes.Status401Unauthorized);
        }

        return ServiceResult<AuthResponse>.Ok(await IssueTokensAsync(user, cancellationToken));
    }

    public async Task<ServiceResult<UserInfoDto>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var roles = request.Roles.Count == 0 ? [Roles.User] : request.Roles.Distinct().ToList();
        var roleValidation = ValidateAssignableRoles(roles);
        if (roleValidation is not null)
            return ServiceResult<UserInfoDto>.Fail(roleValidation, roleValidation.Contains("Forbidden") ? StatusCodes.Status403Forbidden : StatusCodes.Status400BadRequest);

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true
        };

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            return ServiceResult<UserInfoDto>.Fail(errors, StatusCodes.Status400BadRequest);
        }

        await userManager.AddToRolesAsync(user, roles);
        return ServiceResult<UserInfoDto>.Ok(await MapUserInfoAsync(user, cancellationToken));
    }

    public async Task<ServiceResult<AuthResponse>> RefreshAsync(string? refreshToken, CancellationToken cancellationToken = default)
    {
        return await refreshTokenService.ValidateAndRotateAsync(
            refreshToken ?? string.Empty,
            async userId => await BuildAuthResponseFromUserIdAsync(userId, cancellationToken),
            cancellationToken);
    }

    public Task<ServiceResult> LogoutAsync(string? refreshToken, CancellationToken cancellationToken = default)
    {
        return refreshTokenService.RevokeAsync(refreshToken, cancellationToken)
            .ContinueWith(_ => ServiceResult.Ok(), cancellationToken);
    }

    public async Task<ServiceResult<UserInfoDto>> GetCurrentUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByIdAsync(userId);

        if (user is null)
            return ServiceResult<UserInfoDto>.Fail("User not found", StatusCodes.Status404NotFound);

        return ServiceResult<UserInfoDto>.Ok(await MapUserInfoAsync(user, cancellationToken));
    }

    private static string? ValidateAssignableRoles(List<string> roles)
    {
        if (roles.Any(r => !Roles.AdminAssignable.Contains(r)))
            return "Forbidden: cannot assign one or more roles";

        return null;
    }

    private async Task<AuthResponse> IssueTokensAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var roles = (await userManager.GetRolesAsync(user)).ToList();
        var (token, expiresAt) = tokenService.GenerateAccessToken(user, roles);
        var (refreshPlain, refreshExpires) = await refreshTokenService.CreateAsync(user.Id, cancellationToken);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshPlain,
            ExpiresAt = expiresAt,
            RefreshExpiresAt = refreshExpires,
            User = await MapUserInfoAsync(user, cancellationToken)
        };
    }

    private async Task<AuthResponse?> BuildAuthResponseFromUserIdAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(userId);

        if (user is null)
            return null;

        var roles = (await userManager.GetRolesAsync(user)).ToList();
        var (token, expiresAt) = tokenService.GenerateAccessToken(user, roles);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = string.Empty,
            ExpiresAt = expiresAt,
            RefreshExpiresAt = DateTime.UtcNow,
            User = await MapUserInfoAsync(user, cancellationToken)
        };
    }

    private async Task<UserInfoDto> MapUserInfoAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var roles = await userManager.GetRolesAsync(user);
        var twoFactor = await twoFactorService.IsEnabledAsync(user, cancellationToken);

        return new UserInfoDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            Roles = roles.ToList(),
            TwoFactorEnabled = twoFactor
        };
    }
}
