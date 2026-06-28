using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using JAdmin.Common;
using JAdmin.Config;
using JAdmin.Dtos.Auth;
using JAdmin.Services.Interfaces;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace JAdmin.Services.Impl;

public class RefreshTokenService(
    IConnectionMultiplexer redis,
    IOptions<JwtSettings> jwtOptions) : IRefreshTokenService
{
    private readonly IDatabase _db = redis.GetDatabase();
    private readonly JwtSettings _settings = jwtOptions.Value;

    private const string RefreshKeyPrefix = "jadmin:refresh:";
    private const string UserIndexPrefix = "jadmin:user-refresh:";

    // Atomically read and delete refresh token key (prevents concurrent replay).
    private const string RotateScript = """
        local val = redis.call('GET', KEYS[1])
        if not val then return nil end
        redis.call('DEL', KEYS[1])
        return val
        """;

    private static string HashToken(string plainToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(plainToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    public async Task<(string PlainToken, DateTime ExpiresAt)> CreateAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var plainToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var expiresAt = DateTime.UtcNow.AddDays(_settings.RefreshExpirationDays);
        var ttl = TimeSpan.FromDays(_settings.RefreshExpirationDays);
        var hash = HashToken(plainToken);
        var payload = JsonSerializer.Serialize(new RefreshPayload(userId));

        await _db.StringSetAsync(RefreshKeyPrefix + hash, payload, ttl);
        await _db.SetAddAsync(UserIndexPrefix + userId, hash);
        await _db.KeyExpireAsync(UserIndexPrefix + userId, ttl);

        return (plainToken, expiresAt);
    }

    public async Task<ServiceResult<AuthResponse>> ValidateAndRotateAsync(
        string plainToken,
        Func<string, Task<AuthResponse?>> buildAuthResponse,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(plainToken))
            return ServiceResult<AuthResponse>.Fail("Refresh token required", StatusCodes.Status401Unauthorized);

        var hash = HashToken(plainToken);
        var key = RefreshKeyPrefix + hash;

        var payloadJson = (RedisValue)await _db.ScriptEvaluateAsync(
            RotateScript,
            [key]);

        if (payloadJson.IsNullOrEmpty)
            return ServiceResult<AuthResponse>.Fail("Invalid refresh token", StatusCodes.Status401Unauthorized);

        var payload = JsonSerializer.Deserialize<RefreshPayload>(payloadJson.ToString());
        if (payload is null)
            return ServiceResult<AuthResponse>.Fail("Invalid refresh token", StatusCodes.Status401Unauthorized);

        await _db.SetRemoveAsync(UserIndexPrefix + payload.UserId, hash);

        var authResponse = await buildAuthResponse(payload.UserId);
        if (authResponse is null)
            return ServiceResult<AuthResponse>.Fail("Invalid refresh token", StatusCodes.Status401Unauthorized);

        var (newPlain, newExpires) = await CreateAsync(payload.UserId, cancellationToken);
        authResponse.RefreshToken = newPlain;
        authResponse.RefreshExpiresAt = newExpires;

        return ServiceResult<AuthResponse>.Ok(authResponse);
    }

    public async Task RevokeAsync(string? plainToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(plainToken))
            return;

        var hash = HashToken(plainToken);
        var key = RefreshKeyPrefix + hash;
        var payloadJson = await _db.StringGetAsync(key);
        await _db.KeyDeleteAsync(key);

        if (!payloadJson.IsNullOrEmpty)
        {
            var payload = JsonSerializer.Deserialize<RefreshPayload>(payloadJson.ToString());
            if (payload is not null)
                await _db.SetRemoveAsync(UserIndexPrefix + payload.UserId, hash);
        }
    }

    public async Task RevokeAllForUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var indexKey = UserIndexPrefix + userId;
        var hashes = await _db.SetMembersAsync(indexKey);

        foreach (var hash in hashes)
        {
            if (!hash.IsNullOrEmpty)
                await _db.KeyDeleteAsync(RefreshKeyPrefix + hash.ToString());
        }

        await _db.KeyDeleteAsync(indexKey);
    }

    private sealed record RefreshPayload(string UserId);
}
