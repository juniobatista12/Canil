import { describe, expect, it } from 'vitest'
import { publishAuthLogout, sanitizeRedirect, subscribeAuthLogout } from '@/lib/auth'

describe('sanitizeRedirect', () => {
  it('accepts internal paths', () => {
    expect(sanitizeRedirect('/users')).toBe('/users')
    expect(sanitizeRedirect('/users/abc')).toBe('/users/abc')
  })

  it('rejects external urls and login', () => {
    expect(sanitizeRedirect('https://evil.com')).toBeNull()
    expect(sanitizeRedirect('//evil.com')).toBeNull()
    expect(sanitizeRedirect('/login')).toBeNull()
    expect(sanitizeRedirect(null)).toBeNull()
  })
})

describe('auth broadcast', () => {
  it('publishes and receives logout via BroadcastChannel', () => {
    const onLogout = vi.fn()
    const unsubscribe = subscribeAuthLogout(onLogout)
    publishAuthLogout()
    expect(onLogout).toHaveBeenCalled()
    unsubscribe()
  })
})
