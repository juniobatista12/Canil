using JAdmin.Common;
using JAdmin.Config;
using JAdmin.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace JAdmin.Data;

public class DbInitializer(
    AppDbContext db,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IOptions<SeedSettings> seedOptions,
    ILogger<DbInitializer> logger)
{
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        await db.Database.MigrateAsync(cancellationToken);

        var seed = seedOptions.Value;
        if (!seed.Enabled)
            return;

        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Slug == seed.TenantSlug, cancellationToken);
        if (tenant is null)
        {
            tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = seed.TenantName,
                Slug = seed.TenantSlug,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            db.Tenants.Add(tenant);
            await db.SaveChangesAsync(cancellationToken);
            logger.LogInformation("Created system tenant {Slug}", seed.TenantSlug);
        }

        foreach (var role in seed.Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        await EnsureUserAsync(
            tenant,
            seed.SuperAdminEmail,
            seed.SuperAdminPassword,
            seed.SuperAdminRoles,
            cancellationToken);
    }

    private async Task EnsureUserAsync(
        Tenant tenant,
        string email,
        string password,
        IEnumerable<string> roles,
        CancellationToken cancellationToken)
    {
        var user = await userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.TenantId == tenant.Id && u.Email == email, cancellationToken);

        if (user is not null)
            return;

        user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            TenantId = tenant.Id
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create seed user {email}: {errors}");
        }

        await userManager.AddToRolesAsync(user, roles);
        logger.LogInformation("Created seed user {Email}", email);
    }
}
