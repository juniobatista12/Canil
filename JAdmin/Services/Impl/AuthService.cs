using JAdmin.Common;
using JAdmin.Config;
using JAdmin.Data;
using JAdmin.Dtos.Auth;
using JAdmin.Entities;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace JAdmin.Services.Impl;

public class AuthService(
    AppDbContext db,
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    IRefreshTokenService refreshTokenService,
    ITwoFactorService twoFactorService,
    ITenantManagementService tenantManagementService,
    ITenantContext tenantContext,
    IOptions<SeedSettings> seedOptions) : IAuthService
{
    private readonly SeedSettings _seed = seedOptions.Value;

    public async Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Slug == request.TenantSlug, cancellationToken);
        if (tenant is null)
            return ServiceResult<AuthResponse>.Fail("Invalid credentials", StatusCodes.Status401Unauthorized);

        if (!tenant.IsActive)
            return ServiceResult<AuthResponse>.Fail("Tenant is inactive", StatusCodes.Status401Unauthorized);

        var user = await userManager.Users
            .IgnoreQueryFilters()
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.TenantId == tenant.Id && u.NormalizedEmail == userManager.NormalizeEmail(request.Email), cancellationToken);

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
        var isSuperAdmin = tenantContext.IsSuperAdmin;

        if (!tenantContext.IsAuthenticated)
            return ServiceResult<UserInfoDto>.Fail("Unauthorized", StatusCodes.Status401Unauthorized);

        var targetTenantId = ResolveTargetTenantId(request, isSuperAdmin);
        if (targetTenantId is null)
            return ServiceResult<UserInfoDto>.Fail("Invalid tenant", StatusCodes.Status400BadRequest);

        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == targetTenantId, cancellationToken);
        if (tenant is null)
            return ServiceResult<UserInfoDto>.Fail("Invalid tenant", StatusCodes.Status400BadRequest);

        if (!tenant.IsActive)
            return ServiceResult<UserInfoDto>.Fail("Tenant is inactive", StatusCodes.Status400BadRequest);

        var roles = request.Roles.Count == 0 ? [Roles.User] : request.Roles.Distinct().ToList();
        var roleValidation = ValidateAssignableRoles(roles, isSuperAdmin, tenant);
        if (roleValidation is not null)
            return ServiceResult<UserInfoDto>.Fail(roleValidation, roleValidation.Contains("Forbidden") ? StatusCodes.Status403Forbidden : StatusCodes.Status400BadRequest);

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            TenantId = tenant.Id
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
        var user = await userManager.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null)
            return ServiceResult<UserInfoDto>.Fail("User not found", StatusCodes.Status404NotFound);

        return ServiceResult<UserInfoDto>.Ok(await MapUserInfoAsync(user, cancellationToken));
    }

    private Guid? ResolveTargetTenantId(RegisterRequest request, bool isSuperAdmin)
    {
        if (isSuperAdmin && request.TenantId.HasValue)
            return request.TenantId;

        return tenantContext.TenantId;
    }

    private string? ValidateAssignableRoles(List<string> roles, bool isSuperAdmin, Tenant tenant)
    {
        var allowed = isSuperAdmin ? Roles.SuperAdminAssignable : [Roles.User];

        if (roles.Any(r => !allowed.Contains(r)))
            return "Forbidden: cannot assign one or more roles";

        if (roles.Contains(Roles.SuperAdmin) && !tenantManagementService.IsSystemTenant(tenant))
            return "Forbidden: SuperAdmin role can only be assigned in the system tenant";

        return null;
    }

    private async Task<AuthResponse> IssueTokensAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var roles = (await userManager.GetRolesAsync(user)).ToList();
        var (token, expiresAt) = tokenService.GenerateAccessToken(user, roles, user.TenantId);
        var (refreshPlain, refreshExpires) = await refreshTokenService.CreateAsync(user.Id, user.TenantId, cancellationToken);

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
        var user = await userManager.Users
            .IgnoreQueryFilters()
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null || !user.Tenant.IsActive)
            return null;

        var roles = (await userManager.GetRolesAsync(user)).ToList();
        var (token, expiresAt) = tokenService.GenerateAccessToken(user, roles, user.TenantId);

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
        await db.Entry(user).Reference(u => u.Tenant).LoadAsync(cancellationToken);
        var roles = await userManager.GetRolesAsync(user);
        var twoFactor = await twoFactorService.IsEnabledAsync(user, cancellationToken);

        return new UserInfoDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            TenantId = user.TenantId,
            TenantName = user.Tenant.Name,
            Roles = roles.ToList(),
            TwoFactorEnabled = twoFactor
        };
    }
}
