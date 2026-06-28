using JAdmin.Common;
using JAdmin.Dtos.Common;
using JAdmin.Dtos.Tenants;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JAdmin.Controllers;

[ApiController]
[Route("api/tenants")]
[Authorize(Roles = Roles.SuperAdmin)]
public class TenantsController(ITenantManagementService tenantService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery query, CancellationToken cancellationToken)
    {
        var result = await tenantService.GetAllAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await tenantService.GetByIdAsync(id, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTenantRequest request, CancellationToken cancellationToken)
    {
        var result = await tenantService.CreateAsync(request, cancellationToken);
        if (!result.Success)
            return result.ToActionResult(this);

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTenantRequest request, CancellationToken cancellationToken)
    {
        var result = await tenantService.UpdateAsync(id, request, cancellationToken);
        return result.ToActionResult(this);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var result = await tenantService.DeactivateAsync(id, cancellationToken);
        return result.ToActionResult(this);
    }
}
