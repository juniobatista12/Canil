namespace JAdmin.Dtos.Users;

public class UserListItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public IReadOnlyList<string> Roles { get; set; } = [];
    public bool TwoFactorEnabled { get; set; }
}
