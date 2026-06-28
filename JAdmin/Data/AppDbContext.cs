using JAdmin.Entities;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace JAdmin.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    private readonly ITenantContext _tenantContext;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantContext tenantContext) : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Tenant>(entity =>
        {
            entity.HasIndex(t => t.Slug).IsUnique();
            entity.Property(t => t.Name).HasMaxLength(200);
            entity.Property(t => t.Slug).HasMaxLength(50);
        });

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.HasIndex(u => new { u.TenantId, u.NormalizedEmail }).IsUnique();
            entity.HasOne(u => u.Tenant)
                .WithMany(t => t.Users)
                .HasForeignKey(u => u.TenantId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasQueryFilter(u =>
                _tenantContext.BypassTenantFilter || u.TenantId == _tenantContext.TenantId);
        });
    }
}
