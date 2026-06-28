using JAdmin.Common;
using JAdmin.Dtos.Auth;
using JAdmin.Dtos.Users;

namespace JAdmin.Services.Interfaces;

public interface IUserRoleService
{
    Task<ServiceResult<UserRolesResponse>> GetRolesAsync(string userId, CancellationToken cancellationToken = default);
    Task<ServiceResult> AddRoleAsync(string userId, string role, CancellationToken cancellationToken = default);
    Task<ServiceResult> RemoveRoleAsync(string userId, string role, CancellationToken cancellationToken = default);
    Task<ServiceResult<UserInfoDto>> MoveToSystemTenantAsync(string userId, CancellationToken cancellationToken = default);
}
