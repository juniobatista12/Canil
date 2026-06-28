namespace JAdmin.Dtos.Auth;

public class DisableTwoFactorRequest
{
    public string Password { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
