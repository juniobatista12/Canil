namespace JAdmin.Config;

public class SeedSettings
{
    public const string SectionName = "Seed";

    public bool Enabled { get; set; } = true;
    public string AdminEmail { get; set; } = "admin@localhost";
    public string AdminPassword { get; set; } = "Admin@123!";
    public string[] Roles { get; set; } = [Common.Roles.Admin, Common.Roles.User];
    public string[] AdminRoles { get; set; } = [Common.Roles.Admin];
}
