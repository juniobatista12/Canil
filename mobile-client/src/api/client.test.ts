import { api, resetSessionExpired, setApiHandlers } from '@/api/client'
import * as tokenStorage from '@/storage/tokenStorage'

jest.mock('@/storage/tokenStorage', () => ({
  getAccessToken: jest.fn().mockResolvedValue('access-token'),
  getRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
  setTokens: jest.fn().mockResolvedValue(undefined),
  clearTokens: jest.fn().mockResolvedValue(undefined),
}))

describe('api client', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    global.fetch = fetchMock
    resetSessionExpired()
    setApiHandlers({})
    fetchMock.mockReset()
    jest.clearAllMocks()
  })

  it('retries after successful refresh on 401', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'new-token', refreshToken: 'new-refresh' }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))

    const result = await api<{ ok: boolean }>('/api/users')
    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(tokenStorage.setTokens).toHaveBeenCalledWith('new-token', 'new-refresh')
  })

  it('triggers session expired when refresh fails', async () => {
    const onSessionExpired = jest.fn()
    setApiHandlers({ onSessionExpired })

    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(api('/api/users')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' })
    expect(onSessionExpired).toHaveBeenCalled()
  })

  it('does not refresh on login 401', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(api('/api/auth/login', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      status: 401,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
