using Microsoft.AspNetCore.Identity;

namespace JAdmin.Entities;

public class ApplicationUser : IdentityUser
{
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
}
