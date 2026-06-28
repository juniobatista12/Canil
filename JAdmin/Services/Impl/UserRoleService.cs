using JAdmin.Common;
using JAdmin.Dtos.Auth;
using JAdmin.Dtos.Users;
using JAdmin.Entities;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JAdmin.Services.Impl;

public class UserRoleService(
    UserManager<ApplicationUser> userManager,
    ITenantContext tenantContext,
    ITenantManagementService tenantManagementService,
    IRefreshTokenService refreshTokenService) : IUserRoleService
{
    public async Task<ServiceResult<UserRolesResponse>> GetRolesAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await FindAccessibleUserAsync(userId, cancellationToken);
        if (user is null)
            return ServiceResult<UserRolesResponse>.Fail("User not found", StatusCodes.Status404NotFound);

        var roles = await userManager.GetRolesAsync(user);
        return ServiceResult<UserRolesResponse>.Ok(new UserRolesResponse
        {
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            TenantId = user.TenantId,
            Roles = roles.ToList()
        });
    }

    public async Task<ServiceResult> AddRoleAsync(string userId, string role, CancellationToken cancellationToken = default)
    {
        var user = await FindAccessibleUserAsync(userId, cancellationToken);
        if (user is null)
            return ServiceResult.Fail("User not found", StatusCodes.Status404NotFound);

        var validation = await ValidateRoleChangeAsync(user, role, isAdd: true, cancellationToken);
        if (validation is not null)
            return ServiceResult.Fail(validation, validation.StartsWith("Forbidden") ? StatusCodes.Status403Forbidden : StatusCodes.Status409Conflict);

        await userManager.AddToRoleAsync(user, role);
        await refreshTokenService.RevokeAllForUserAsync(user.Id, cancellationToken);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> RemoveRoleAsync(string userId, string role, CancellationToken cancellationToken = default)
    {
        var user = await FindAccessibleUserAsync(userId, cancellationToken);
        if (user is null)
            return ServiceResult.Fail("User not found", StatusCodes.Status404NotFound);

        var roles = await userManager.GetRolesAsync(user);
        if (!roles.Contains(role))
            return ServiceResult.Fail("Role not found", StatusCodes.Status404NotFound);

        var validation = await ValidateRoleChangeAsync(user, role, isAdd: false, cancellationToken);
        if (validation is not null)
            return ServiceResult.Fail(validation, validation.StartsWith("Forbidden") ? StatusCodes.Status403Forbidden : StatusCodes.Status409Conflict);

        if (role == Roles.Admin)
        {
            var adminCount = await CountAdminsInTenantAsync(user.TenantId, cancellationToken);
            if (adminCount <= 1 && roles.Contains(Roles.Admin))
                return ServiceResult.Fail("Cannot remove the last Admin of the tenant", StatusCodes.Status409Conflict);
        }

        await userManager.RemoveFromRoleAsync(user, role);
        await refreshTokenService.RevokeAllForUserAsync(user.Id, cancellationToken);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult<UserInfoDto>> MoveToSystemTenantAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (!tenantContext.IsSuperAdmin)
            return ServiceResult<UserInfoDto>.Fail("Forbidden", StatusCodes.Status403Forbidden);

        var user = await userManager.Users
            .IgnoreQueryFilters()
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null)
            return ServiceResult<UserInfoDto>.Fail("User not found", StatusCodes.Status404NotFound);

        var roles = await userManager.GetRolesAsync(user);
        if (roles.Contains(Roles.SuperAdmin))
            return ServiceResult<UserInfoDto>.Fail("SuperAdmin users cannot change tenant", StatusCodes.Status409Conflict);

        var systemTenant = await tenantManagementService.GetSystemTenantAsync(cancellationToken);
        if (systemTenant is null)
            return ServiceResult<UserInfoDto>.Fail("System tenant not found", StatusCodes.Status500InternalServerError);

        if (user.TenantId == systemTenant.Id)
            return ServiceResult<UserInfoDto>.Fail("User is already in the system tenant", StatusCodes.Status409Conflict);

        user.TenantId = systemTenant.Id;
        await userManager.UpdateAsync(user);
        await refreshTokenService.RevokeAllForUserAsync(user.Id, cancellationToken);

        return ServiceResult<UserInfoDto>.Ok(new UserInfoDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            TenantId = systemTenant.Id,
            TenantName = systemTenant.Name,
            Roles = roles.ToList(),
            TwoFactorEnabled = await userManager.GetTwoFactorEnabledAsync(user)
        });
    }

    private async Task<ApplicationUser?> FindAccessibleUserAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await userManager.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null)
            return null;

        if (!tenantContext.IsSuperAdmin && user.TenantId != tenantContext.TenantId)
            return null;

        return user;
    }

    private async Task<string?> ValidateRoleChangeAsync(ApplicationUser user, string role, bool isAdd, CancellationToken cancellationToken)
    {
        if (!tenantContext.IsSuperAdmin)
        {
            if (role == Roles.SuperAdmin)
                return "Forbidden: cannot manage SuperAdmin role";

            if (!Roles.AdminAssignable.Contains(role))
                return "Forbidden: cannot manage this role";
        }
        else if (!Roles.All.Contains(role))
        {
            return "Invalid role";
        }

        if (isAdd && role == Roles.SuperAdmin && !await IsUserInSystemTenantAsync(user, cancellationToken))
            return "Forbidden: SuperAdmin role can only be assigned in the system tenant";

        if (isAdd)
        {
            var current = await userManager.GetRolesAsync(user);
            if (current.Contains(role))
                return "Role already assigned";
        }

        return null;
    }

    private async Task<bool> IsUserInSystemTenantAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var systemTenant = await tenantManagementService.GetSystemTenantAsync(cancellationToken);
        return systemTenant is not null && user.TenantId == systemTenant.Id;
    }

    private async Task<int> CountAdminsInTenantAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var users = await userManager.Users
            .Where(u => u.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        var count = 0;
        foreach (var u in users)
        {
            if (await userManager.IsInRoleAsync(u, Roles.Admin))
                count++;
        }
        return count;
    }
}
