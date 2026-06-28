using JAdmin.Services.Interfaces;

namespace JAdmin.Services.Impl;

public class TenantContext : ITenantContext
{
    public Guid? TenantId { get; private set; }
    public bool IsSuperAdmin { get; private set; }
    public bool BypassTenantFilter => IsSuperAdmin;
    public string? UserId { get; private set; }
    public bool IsAuthenticated => UserId is not null;

    public void SetContext(Guid? tenantId, bool isSuperAdmin, string? userId)
    {
        TenantId = tenantId;
        IsSuperAdmin = isSuperAdmin;
        UserId = userId;
    }
}
