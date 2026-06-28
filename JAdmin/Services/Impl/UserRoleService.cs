using JAdmin.Common;
using JAdmin.Dtos.Users;
using JAdmin.Entities;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JAdmin.Services.Impl;

public class UserRoleService(
    UserManager<ApplicationUser> userManager,
    IRefreshTokenService refreshTokenService) : IUserRoleService
{
    public async Task<ServiceResult<UserRolesResponse>> GetRolesAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(userId, cancellationToken);
        if (user is null)
            return ServiceResult<UserRolesResponse>.Fail("User not found", StatusCodes.Status404NotFound);

        var roles = await userManager.GetRolesAsync(user);
        return ServiceResult<UserRolesResponse>.Ok(new UserRolesResponse
        {
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            Roles = roles.ToList()
        });
    }

    public async Task<ServiceResult> AddRoleAsync(string userId, string role, CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(userId, cancellationToken);
        if (user is null)
            return ServiceResult.Fail("User not found", StatusCodes.Status404NotFound);

        var validation = ValidateRoleChange(role, isAdd: true);
        if (validation is not null)
            return ServiceResult.Fail(validation, validation.StartsWith("Forbidden") ? StatusCodes.Status403Forbidden : StatusCodes.Status409Conflict);

        var current = await userManager.GetRolesAsync(user);
        if (current.Contains(role))
            return ServiceResult.Fail("Role already assigned", StatusCodes.Status409Conflict);

        await userManager.AddToRoleAsync(user, role);
        await refreshTokenService.RevokeAllForUserAsync(user.Id, cancellationToken);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> RemoveRoleAsync(string userId, string role, CancellationToken cancellationToken = default)
    {
        var user = await FindUserAsync(userId, cancellationToken);
        if (user is null)
            return ServiceResult.Fail("User not found", StatusCodes.Status404NotFound);

        var roles = await userManager.GetRolesAsync(user);
        if (!roles.Contains(role))
            return ServiceResult.Fail("Role not found", StatusCodes.Status404NotFound);

        var validation = ValidateRoleChange(role, isAdd: false);
        if (validation is not null)
            return ServiceResult.Fail(validation, validation.StartsWith("Forbidden") ? StatusCodes.Status403Forbidden : StatusCodes.Status409Conflict);

        if (role == Roles.Admin)
        {
            var adminCount = await CountAdminsAsync(cancellationToken);
            if (adminCount <= 1 && roles.Contains(Roles.Admin))
                return ServiceResult.Fail("Cannot remove the last Admin", StatusCodes.Status409Conflict);
        }

        await userManager.RemoveFromRoleAsync(user, role);
        await refreshTokenService.RevokeAllForUserAsync(user.Id, cancellationToken);
        return ServiceResult.Ok();
    }

    private async Task<ApplicationUser?> FindUserAsync(string userId, CancellationToken cancellationToken)
    {
        return await userManager.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    private static string? ValidateRoleChange(string role, bool isAdd)
    {
        if (!Roles.AdminAssignable.Contains(role))
            return "Forbidden: cannot manage this role";

        if (!Roles.All.Contains(role))
            return "Invalid role";

        return null;
    }

    private async Task<int> CountAdminsAsync(CancellationToken cancellationToken)
    {
        var users = await userManager.Users.ToListAsync(cancellationToken);

        var count = 0;
        foreach (var u in users)
        {
            if (await userManager.IsInRoleAsync(u, Roles.Admin))
                count++;
        }
        return count;
    }
}
