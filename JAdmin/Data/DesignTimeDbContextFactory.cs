using JAdmin.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace JAdmin.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=jadmin;Username=postgres;Password=changeme");

        return new AppDbContext(optionsBuilder.Options, new DesignTimeTenantContext());
    }

    private sealed class DesignTimeTenantContext : Services.Interfaces.ITenantContext
    {
        public Guid? TenantId => null;
        public bool IsSuperAdmin => true;
        public bool BypassTenantFilter => true;
        public string? UserId => null;
        public bool IsAuthenticated => false;
        public void SetContext(Guid? tenantId, bool isSuperAdmin, string? userId) { }
    }
}
