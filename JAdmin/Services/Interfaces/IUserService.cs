using JAdmin.Common;
using JAdmin.Dtos.Common;
using JAdmin.Dtos.Users;

namespace JAdmin.Services.Interfaces;

public interface IUserService
{
    Task<PagedResult<UserListItemDto>> GetAllAsync(PaginationQuery query, CancellationToken cancellationToken = default);
}
