using FluentValidation;
using JAdmin.Common;
using JAdmin.Config;
using JAdmin.Dtos.Auth;
using JAdmin.Dtos.Tenants;
using Microsoft.Extensions.Options;

namespace JAdmin.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
        RuleFor(x => x.TenantSlug).NotEmpty();
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password)
            .MinimumLength(6)
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"\d").WithMessage("Password must contain at least one digit.")
            .Matches(@"[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
        RuleForEach(x => x.Roles).Must(r => Roles.All.Contains(r))
            .When(x => x.Roles.Count > 0);
    }
}

public class CreateTenantRequestValidator : AbstractValidator<CreateTenantRequest>
{
    public CreateTenantRequestValidator(IOptions<SeedSettings> seedOptions)
    {
        var systemSlug = seedOptions.Value.TenantSlug;

        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug)
            .NotEmpty()
            .MaximumLength(50)
            .Matches(@"^[a-z0-9-]{2,50}$")
            .WithMessage("Slug must be lowercase alphanumeric with hyphens, 2-50 characters.")
            .Must(slug => !string.Equals(slug, systemSlug, StringComparison.OrdinalIgnoreCase))
            .WithMessage("Slug is reserved for the system tenant.");
    }
}

public class UpdateTenantRequestValidator : AbstractValidator<UpdateTenantRequest>
{
    public UpdateTenantRequestValidator()
    {
        RuleFor(x => x.Name).MaximumLength(200).When(x => x.Name is not null);
    }
}

public class PaginationQueryValidator : AbstractValidator<Dtos.Common.PaginationQuery>
{
    public PaginationQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}

public class AddRoleRequestValidator : AbstractValidator<Dtos.Users.AddRoleRequest>
{
    public AddRoleRequestValidator()
    {
        RuleFor(x => x.Role).NotEmpty().Must(r => Roles.All.Contains(r));
    }
}

public class EnableTwoFactorRequestValidator : AbstractValidator<EnableTwoFactorRequest>
{
    public EnableTwoFactorRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().Length(6);
    }
}

public class DisableTwoFactorRequestValidator : AbstractValidator<DisableTwoFactorRequest>
{
    public DisableTwoFactorRequestValidator()
    {
        RuleFor(x => x.Password).NotEmpty();
        RuleFor(x => x.Code).NotEmpty().Length(6);
    }
}
