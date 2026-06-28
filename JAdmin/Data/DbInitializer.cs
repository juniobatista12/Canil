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

        foreach (var role in seed.Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        await EnsureUserAsync(
            seed.AdminEmail,
            seed.AdminPassword,
            seed.AdminRoles,
            cancellationToken);
    }

    private async Task EnsureUserAsync(
        string email,
        string password,
        IEnumerable<string> roles,
        CancellationToken cancellationToken)
    {
        var user = await userManager.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is not null)
            return;

        user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
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
