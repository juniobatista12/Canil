using JAdmin.Common;
using JAdmin.Dtos.Common;
using JAdmin.Dtos.Users;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JAdmin.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
public class UsersController(IUserService userService, IUserRoleService userRoleService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery query, CancellationToken cancellationToken)
    {
        var result = await userService.GetAllAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}/roles")]
    public async Task<IActionResult> GetRoles(string id, CancellationToken cancellationToken)
    {
        var result = await userRoleService.GetRolesAsync(id, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpPost("{id}/roles")]
    public async Task<IActionResult> AddRole(string id, [FromBody] AddRoleRequest request, CancellationToken cancellationToken)
    {
        var result = await userRoleService.AddRoleAsync(id, request.Role, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpDelete("{id}/roles/{roleName}")]
    public async Task<IActionResult> RemoveRole(string id, string roleName, CancellationToken cancellationToken)
    {
        var result = await userRoleService.RemoveRoleAsync(id, roleName, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpPost("{id}/move-to-system-tenant")]
    [Authorize(Roles = Roles.SuperAdmin)]
    public async Task<IActionResult> MoveToSystemTenant(string id, CancellationToken cancellationToken)
    {
        var result = await userRoleService.MoveToSystemTenantAsync(id, cancellationToken);
        return result.ToActionResult(this);
    }
}
