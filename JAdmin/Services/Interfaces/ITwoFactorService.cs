using JAdmin.Common;
using JAdmin.Dtos.Auth;
using JAdmin.Entities;

namespace JAdmin.Services.Interfaces;

public interface ITwoFactorService
{
    Task<TwoFactorSetupResponse> GenerateSetupAsync(ApplicationUser user, CancellationToken cancellationToken = default);
    Task<ServiceResult> EnableAsync(ApplicationUser user, string code, CancellationToken cancellationToken = default);
    Task<ServiceResult> DisableAsync(ApplicationUser user, string password, string code, CancellationToken cancellationToken = default);
    Task<bool> ValidateCodeAsync(ApplicationUser user, string code, CancellationToken cancellationToken = default);
    Task<bool> IsEnabledAsync(ApplicationUser user, CancellationToken cancellationToken = default);
}
