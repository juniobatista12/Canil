namespace JAdmin.Config;

public class TwoFactorSettings
{
    public const string SectionName = "TwoFactor";

    public string Issuer { get; set; } = "JAdmin";
}
