namespace JAdmin.Dtos.Auth;

public class TwoFactorSetupResponse
{
    public string SharedKey { get; set; } = string.Empty;
    public string QrCodeBase64 { get; set; } = string.Empty;
    public string AuthenticatorUri { get; set; } = string.Empty;
}
