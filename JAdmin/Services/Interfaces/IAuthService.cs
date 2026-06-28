using JAdmin.Common;
using JAdmin.Dtos.Auth;

namespace JAdmin.Services.Interfaces;

public interface IAuthService
{
    Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResult<UserInfoDto>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResult<AuthResponse>> RefreshAsync(string? refreshToken, CancellationToken cancellationToken = default);
    Task<ServiceResult> LogoutAsync(string? refreshToken, CancellationToken cancellationToken = default);
    Task<ServiceResult<UserInfoDto>> GetCurrentUserAsync(string userId, CancellationToken cancellationToken = default);
}
