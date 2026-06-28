namespace JAdmin.Config;

public class SeedSettings
{
    public const string SectionName = "Seed";

    public bool Enabled { get; set; } = true;
    public string TenantName { get; set; } = "System";
    public string TenantSlug { get; set; } = "system";
    public string SuperAdminEmail { get; set; } = "superadmin@localhost";
    public string SuperAdminPassword { get; set; } = "SuperAdmin@123!";
    public string[] Roles { get; set; } = [Common.Roles.Admin, Common.Roles.User, Common.Roles.SuperAdmin];
    public string[] SuperAdminRoles { get; set; } = [Common.Roles.SuperAdmin];
}
