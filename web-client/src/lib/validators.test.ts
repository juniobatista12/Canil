import { describe, expect, it } from 'vitest'
import {
  disableTwoFactorSchema,
  loginSchema,
  passwordSchema,
  registerSchema,
  tenantCreateSchema,
  tenantUpdateSchema,
  totpCodeSchema,
} from '@/lib/validators'

describe('validators', () => {
  it('validates login schema', () => {
    expect(
      loginSchema.safeParse({
        tenantSlug: 'system',
        email: 'user@test.com',
        password: 'secret',
      }).success,
    ).toBe(true)
  })

  it('validates register email', () => {
    expect(registerSchema.safeParse({
      email: 'invalid',
      password: 'Abc123!',
      role: 'User',
    }).success).toBe(false)

    expect(registerSchema.safeParse({
      email: 'user@test.com',
      password: 'Abc123!',
      role: 'User',
    }).success).toBe(true)

    expect(registerSchema.safeParse({
      email: 'user@localhost',
      password: 'Abc123!',
      role: 'User',
    }).success).toBe(true)
  })

  it('validates tenant slug', () => {
    expect(tenantCreateSchema.safeParse({ name: 'Acme', slug: 'acme-corp' }).success).toBe(true)
    expect(tenantCreateSchema.safeParse({ name: 'Acme', slug: 'INVALID' }).success).toBe(false)
  })

  it('validates totp code length', () => {
    expect(totpCodeSchema.safeParse('123456').success).toBe(true)
    expect(totpCodeSchema.safeParse('12345').success).toBe(false)
  })

  it('validates password schema', () => {
    expect(passwordSchema.safeParse('weak').success).toBe(false)
    expect(passwordSchema.safeParse('Abc123!').success).toBe(true)
  })

  it('validates tenant update schema', () => {
    expect(tenantUpdateSchema.safeParse({ name: 'Acme', isActive: true }).success).toBe(true)
    expect(tenantUpdateSchema.safeParse({ name: '', isActive: true }).success).toBe(false)
  })

  it('validates disable 2FA schema', () => {
    expect(disableTwoFactorSchema.safeParse({ password: 'Abc123!', code: '123456' }).success).toBe(true)
    expect(disableTwoFactorSchema.safeParse({ password: '', code: '123456' }).success).toBe(false)
  })
})
