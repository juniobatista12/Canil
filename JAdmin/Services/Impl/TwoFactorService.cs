using System.Text;
using System.Text.Encodings.Web;
using JAdmin.Common;
using JAdmin.Config;
using JAdmin.Dtos.Auth;
using JAdmin.Entities;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using QRCoder;

namespace JAdmin.Services.Impl;

public class TwoFactorService(
    UserManager<ApplicationUser> userManager,
    IOptions<TwoFactorSettings> twoFactorOptions,
    IRefreshTokenService refreshTokenService) : ITwoFactorService
{
    private readonly TwoFactorSettings _settings = twoFactorOptions.Value;

    public async Task<TwoFactorSetupResponse> GenerateSetupAsync(ApplicationUser user, CancellationToken cancellationToken = default)
    {
        await userManager.ResetAuthenticatorKeyAsync(user);
        var key = await userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(key))
            throw new InvalidOperationException("Failed to generate authenticator key.");

        var email = user.Email ?? user.UserName ?? user.Id;
        var issuer = UrlEncoder.Default.Encode(_settings.Issuer);
        var encodedEmail = UrlEncoder.Default.Encode(email);
        var uri = $"otpauth://totp/{issuer}:{encodedEmail}?secret={key}&issuer={issuer}&digits=6";

        using var qrGenerator = new QRCodeGenerator();
        using var qrData = qrGenerator.CreateQrCode(uri, QRCodeGenerator.ECCLevel.Q);
        var qrCode = new PngByteQRCode(qrData);
        var png = qrCode.GetGraphic(20);
        var base64 = Convert.ToBase64String(png);

        return new TwoFactorSetupResponse
        {
            SharedKey = FormatKey(key),
            QrCodeBase64 = $"data:image/png;base64,{base64}",
            AuthenticatorUri = uri
        };
    }

    public async Task<ServiceResult> EnableAsync(ApplicationUser user, string code, CancellationToken cancellationToken = default)
    {
        var valid = await userManager.VerifyTwoFactorTokenAsync(
            user,
            TokenOptions.DefaultAuthenticatorProvider,
            code);

        if (!valid)
            return ServiceResult.Fail("Invalid two-factor code", StatusCodes.Status400BadRequest);

        await userManager.SetTwoFactorEnabledAsync(user, true);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DisableAsync(ApplicationUser user, string password, string code, CancellationToken cancellationToken = default)
    {
        if (!await userManager.CheckPasswordAsync(user, password))
            return ServiceResult.Fail("Invalid password", StatusCodes.Status400BadRequest);

        if (!await ValidateCodeAsync(user, code, cancellationToken))
            return ServiceResult.Fail("Invalid two-factor code", StatusCodes.Status400BadRequest);

        await userManager.SetTwoFactorEnabledAsync(user, false);
        await userManager.ResetAuthenticatorKeyAsync(user);
        await refreshTokenService.RevokeAllForUserAsync(user.Id, cancellationToken);
        return ServiceResult.Ok();
    }

    public Task<bool> ValidateCodeAsync(ApplicationUser user, string code, CancellationToken cancellationToken = default) =>
        userManager.VerifyTwoFactorTokenAsync(user, TokenOptions.DefaultAuthenticatorProvider, code);

    public Task<bool> IsEnabledAsync(ApplicationUser user, CancellationToken cancellationToken = default) =>
        userManager.GetTwoFactorEnabledAsync(user);

    private static string FormatKey(string key)
    {
        var sb = new StringBuilder();
        for (var i = 0; i < key.Length; i++)
        {
            sb.Append(key[i]);
            if ((i + 1) % 4 == 0 && i < key.Length - 1)
                sb.Append(' ');
        }
        return sb.ToString();
    }
}
