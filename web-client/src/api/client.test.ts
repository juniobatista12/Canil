import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, resetSessionExpired, setApiHandlers } from '@/api/client'

describe('api client', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    resetSessionExpired()
    setApiHandlers({})
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('retries after successful refresh on 401', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 't' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))

    const result = await api<{ ok: boolean }>('/api/users')
    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('triggers session expired when refresh fails', async () => {
    const onSessionExpired = vi.fn()
    setApiHandlers({ onSessionExpired })

    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(api('/api/users')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
    expect(onSessionExpired).toHaveBeenCalledOnce()
  })

  it('does not refresh on login 401', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      api('/api/auth/login', { method: 'POST', body: '{}' }),
    ).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
