using JAdmin.Common;
using JAdmin.Dtos.Auth;

namespace JAdmin.Services.Interfaces;

public interface IRefreshTokenService
{
    Task<(string PlainToken, DateTime ExpiresAt)> CreateAsync(string userId, CancellationToken cancellationToken = default);
    Task<ServiceResult<AuthResponse>> ValidateAndRotateAsync(string plainToken, Func<string, Task<AuthResponse?>> buildAuthResponse, CancellationToken cancellationToken = default);
    Task RevokeAsync(string? plainToken, CancellationToken cancellationToken = default);
    Task RevokeAllForUserAsync(string userId, CancellationToken cancellationToken = default);
}
