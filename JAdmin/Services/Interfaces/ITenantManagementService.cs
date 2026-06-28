using JAdmin.Common;
using JAdmin.Dtos.Common;
using JAdmin.Dtos.Tenants;
using JAdmin.Entities;

namespace JAdmin.Services.Interfaces;

public interface ITenantManagementService
{
    Task<PagedResult<TenantDto>> GetAllAsync(PaginationQuery query, CancellationToken cancellationToken = default);
    Task<ServiceResult<TenantDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ServiceResult<TenantDto>> CreateAsync(CreateTenantRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResult<TenantDto>> UpdateAsync(Guid id, UpdateTenantRequest request, CancellationToken cancellationToken = default);
    Task<ServiceResult> DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Tenant?> GetSystemTenantAsync(CancellationToken cancellationToken = default);
    bool IsSystemTenant(Tenant tenant);
}
