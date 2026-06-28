using JAdmin.Common;
using JAdmin.Config;
using JAdmin.Data;
using JAdmin.Dtos.Common;
using JAdmin.Dtos.Tenants;
using JAdmin.Entities;
using JAdmin.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace JAdmin.Services.Impl;

public class TenantManagementService(
    AppDbContext db,
    UserManager<ApplicationUser> userManager,
    IRefreshTokenService refreshTokenService,
    IOptions<SeedSettings> seedOptions) : ITenantManagementService
{
    private readonly SeedSettings _seed = seedOptions.Value;

    public async Task<PagedResult<TenantDto>> GetAllAsync(PaginationQuery query, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var tenantsQuery = db.Tenants.AsQueryable();
        var total = await tenantsQuery.CountAsync(cancellationToken);
        var items = await tenantsQuery
            .OrderBy(t => t.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<TenantDto>
        {
            Items = items.Select(MapDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = total
        };
    }

    public async Task<ServiceResult<TenantDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var tenant = await db.Tenants.FindAsync([id], cancellationToken);
        if (tenant is null)
            return ServiceResult<TenantDto>.Fail("Tenant not found", StatusCodes.Status404NotFound);

        return ServiceResult<TenantDto>.Ok(MapDto(tenant));
    }

    public async Task<ServiceResult<TenantDto>> CreateAsync(CreateTenantRequest request, CancellationToken cancellationToken = default)
    {
        if (IsReservedSlug(request.Slug))
            return ServiceResult<TenantDto>.Fail("Slug is reserved for the system tenant", StatusCodes.Status409Conflict);

        if (await db.Tenants.AnyAsync(t => t.Slug == request.Slug, cancellationToken))
            return ServiceResult<TenantDto>.Fail("Slug already exists", StatusCodes.Status409Conflict);

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = request.Slug,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        db.Tenants.Add(tenant);
        await db.SaveChangesAsync(cancellationToken);
        return ServiceResult<TenantDto>.Ok(MapDto(tenant));
    }

    public async Task<ServiceResult<TenantDto>> UpdateAsync(Guid id, UpdateTenantRequest request, CancellationToken cancellationToken = default)
    {
        var tenant = await db.Tenants.FindAsync([id], cancellationToken);
        if (tenant is null)
            return ServiceResult<TenantDto>.Fail("Tenant not found", StatusCodes.Status404NotFound);

        if (!string.IsNullOrWhiteSpace(request.Name))
            tenant.Name = request.Name;

        if (request.IsActive.HasValue)
        {
            if (IsSystemTenant(tenant))
                return ServiceResult<TenantDto>.Fail("Cannot change active status of system tenant", StatusCodes.Status409Conflict);

            tenant.IsActive = request.IsActive.Value;
        }

        await db.SaveChangesAsync(cancellationToken);
        return ServiceResult<TenantDto>.Ok(MapDto(tenant));
    }

    public async Task<ServiceResult> DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var tenant = await db.Tenants.FindAsync([id], cancellationToken);
        if (tenant is null)
            return ServiceResult.Fail("Tenant not found", StatusCodes.Status404NotFound);

        if (IsSystemTenant(tenant))
            return ServiceResult.Fail("System tenant cannot be deactivated", StatusCodes.Status409Conflict);

        tenant.IsActive = false;
        await db.SaveChangesAsync(cancellationToken);

        var userIds = await userManager.Users
            .IgnoreQueryFilters()
            .Where(u => u.TenantId == tenant.Id)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        foreach (var userId in userIds)
            await refreshTokenService.RevokeAllForUserAsync(userId, cancellationToken);

        return ServiceResult.Ok();
    }

    public Task<Tenant?> GetSystemTenantAsync(CancellationToken cancellationToken = default) =>
        db.Tenants.FirstOrDefaultAsync(t => t.Slug == _seed.TenantSlug, cancellationToken);

    public bool IsSystemTenant(Tenant tenant) =>
        string.Equals(tenant.Slug, _seed.TenantSlug, StringComparison.OrdinalIgnoreCase);

    private bool IsReservedSlug(string slug) =>
        string.Equals(slug, _seed.TenantSlug, StringComparison.OrdinalIgnoreCase);

    private TenantDto MapDto(Tenant tenant) => new()
    {
        Id = tenant.Id,
        Name = tenant.Name,
        Slug = tenant.Slug,
        IsActive = tenant.IsActive,
        IsSystemTenant = IsSystemTenant(tenant),
        CreatedAt = tenant.CreatedAt
    };
}
