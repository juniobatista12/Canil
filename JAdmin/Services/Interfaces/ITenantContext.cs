namespace JAdmin.Services.Interfaces;

public interface ITenantContext
{
    Guid? TenantId { get; }
    bool IsSuperAdmin { get; }
    bool BypassTenantFilter { get; }
    string? UserId { get; }
    bool IsAuthenticated { get; }

    void SetContext(Guid? tenantId, bool isSuperAdmin, string? userId);
}
