namespace JAdmin.Dtos.Users;

public class UserRolesResponse
{
    public string UserId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public IReadOnlyList<string> Roles { get; set; } = [];
}
