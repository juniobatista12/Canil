namespace JAdmin.Dtos.Tenants;

public class CreateTenantRequest
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
}
