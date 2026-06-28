using System.Security.Claims;
using JAdmin.Common;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JAdmin.Multitenancy;

public class MultitenancyMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tenantClaim = context.User.FindFirstValue("tenant_id");
            Guid? tenantId = Guid.TryParse(tenantClaim, out var parsed) ? parsed : null;
            var isSuperAdmin = context.User.IsInRole(Roles.SuperAdmin);

            if (tenantId is null && !isSuperAdmin)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new ProblemDetails
                {
                    Title = "Forbidden",
                    Status = StatusCodes.Status403Forbidden,
                    Detail = "Tenant context is required."
                });
                return;
            }

            tenantContext.SetContext(tenantId, isSuperAdmin, userId);
        }

        await next(context);
    }
}

public static class MultitenancyMiddlewareExtensions
{
    public static IApplicationBuilder UseMultitenancy(this IApplicationBuilder app) =>
        app.UseMiddleware<MultitenancyMiddleware>();
}
