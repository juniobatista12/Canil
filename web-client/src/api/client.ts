import type { ProblemDetails } from '@/types/api'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number
  code?: string
  problem?: ProblemDetails

  constructor(status: number, code?: string, problem?: ProblemDetails) {
    super(code ?? problem?.detail ?? `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.problem = problem
  }
}

export class TwoFactorRequiredError extends ApiError {
  constructor(problem?: ProblemDetails) {
    super(401, 'REQUIRES_TWO_FACTOR', problem)
    this.name = 'TwoFactorRequiredError'
  }
}

let isRefreshing = false
let sessionExpired = false
const refreshQueue: Array<{ resolve: () => void; reject: (error: Error) => void }> = []

type ApiHandlers = {
  onSessionExpired?: () => void
  onForbidden?: (message: string) => void
  onConflict?: (message: string) => void
}

let handlers: ApiHandlers = {}

export function setApiHandlers(next: ApiHandlers): void {
  handlers = { ...handlers, ...next }
}

export function resetSessionExpired(): void {
  sessionExpired = false
}

export async function parseApiError(res: Response): Promise<string> {
  try {
    const problem = (await res.json()) as ProblemDetails
    if (problem.detail) return problem.detail
    if (problem.errors) {
      const firstKey = Object.keys(problem.errors)[0]
      const firstError = firstKey ? problem.errors[firstKey]?.[0] : undefined
      if (firstError) return firstError
    }
    return problem.title ?? `HTTP ${res.status}`
  } catch {
    return `HTTP ${res.status}`
  }
}

async function parseProblemDetails(res: Response): Promise<ProblemDetails | undefined> {
  try {
    return (await res.clone().json()) as ProblemDetails
  } catch {
    return undefined
  }
}

function isAuthExempt(path: string): boolean {
  return path.endsWith('/api/auth/login') || path.endsWith('/api/auth/refresh')
}

async function waitForRefresh(): Promise<void> {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject })
  })
}

async function handleUnauthorized(path: string, options: RequestInit): Promise<Response> {
  if (isAuthExempt(path)) {
    throw new ApiError(401, 'UNAUTHORIZED')
  }

  if (sessionExpired) {
    throw new ApiError(401, 'SESSION_EXPIRED')
  }

  if (isRefreshing) {
    await waitForRefresh()
    return rawFetch(path, options)
  }

  isRefreshing = true
  try {
    const refreshRes = await rawFetch('/api/auth/refresh', { method: 'POST' })
    if (refreshRes.ok) {
      refreshQueue.forEach(({ resolve }) => resolve())
      refreshQueue.length = 0
      return rawFetch(path, options)
    }

    sessionExpired = true
    const refreshError = new ApiError(401, 'SESSION_EXPIRED')
    refreshQueue.forEach(({ reject }) => reject(refreshError))
    refreshQueue.length = 0

    await rawFetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
    handlers.onSessionExpired?.()
    throw refreshError
  } finally {
    isRefreshing = false
  }
}

async function rawFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  })
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res = await rawFetch(path, options)

  if (res.status === 401 && !isAuthExempt(path)) {
    res = await handleUnauthorized(path, options)
  }

  if (res.status === 401 && path.endsWith('/api/auth/login')) {
    const problem = await parseProblemDetails(res)
    const requiresTwoFactor =
      problem?.extensions?.requiresTwoFactor === true ||
      (problem as ProblemDetails & { requiresTwoFactor?: boolean })?.requiresTwoFactor === true
    if (requiresTwoFactor) {
      throw new TwoFactorRequiredError(problem)
    }
  }

  if (res.ok) {
    if (res.status === 204) return undefined as T
    const text = await res.text()
    return text ? (JSON.parse(text) as T) : (undefined as T)
  }

  const problem = await parseProblemDetails(res)
  const message = problem?.detail ?? (await parseApiError(res))

  if (res.status === 403) {
    handlers.onForbidden?.(message)
    throw new ApiError(403, 'FORBIDDEN', problem)
  }

  if (res.status === 409) {
    handlers.onConflict?.(message)
    throw new ApiError(409, 'CONFLICT', problem)
  }

  throw new ApiError(res.status, undefined, problem)
}

export async function apiRaw(path: string, options: RequestInit = {}): Promise<Response> {
  let res = await rawFetch(path, options)
  if (res.status === 401 && !isAuthExempt(path)) {
    res = await handleUnauthorized(path, options)
  }
  return res
}
