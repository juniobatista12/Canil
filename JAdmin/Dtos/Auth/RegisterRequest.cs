namespace JAdmin.Dtos.Auth;

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = [];
    public Guid? TenantId { get; set; }
}
