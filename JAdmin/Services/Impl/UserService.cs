using JAdmin.Common;
using JAdmin.Dtos.Common;
using JAdmin.Dtos.Users;
using JAdmin.Entities;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JAdmin.Services.Impl;

public class UserService(UserManager<ApplicationUser> userManager) : IUserService
{
    public async Task<PagedResult<UserListItemDto>> GetAllAsync(PaginationQuery query, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var usersQuery = userManager.Users.AsQueryable();

        var total = await usersQuery.CountAsync(cancellationToken);
        var users = await usersQuery
            .OrderBy(u => u.Email)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = new List<UserListItemDto>();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            items.Add(new UserListItemDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                Roles = roles.ToList(),
                TwoFactorEnabled = await userManager.GetTwoFactorEnabledAsync(user)
            });
        }

        return new PagedResult<UserListItemDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = total
        };
    }
}
