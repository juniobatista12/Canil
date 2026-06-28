export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  errors?: Record<string, string[]>
  extensions?: {
    requiresTwoFactor?: boolean
  }
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface PaginationQuery {
  page?: number
  pageSize?: number
  tenantId?: string
}
