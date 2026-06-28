namespace JAdmin.Dtos.Tenants;

public class TenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsSystemTenant { get; set; }
    public DateTime CreatedAt { get; set; }
}
