namespace JAdmin.Common;

public static class Roles
{
    public const string Admin = "Admin";
    public const string User = "User";
    public const string SuperAdmin = "SuperAdmin";

    public static readonly string[] All = [Admin, User, SuperAdmin];
    public static readonly string[] AdminAssignable = [User, Admin];
    public static readonly string[] SuperAdminAssignable = [User, Admin, SuperAdmin];
}
