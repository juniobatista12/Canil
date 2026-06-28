using JAdmin.Dtos.Auth;
using JAdmin.Entities;

namespace JAdmin.Services.Interfaces;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) GenerateAccessToken(ApplicationUser user, IReadOnlyList<string> roles, Guid tenantId);
}
