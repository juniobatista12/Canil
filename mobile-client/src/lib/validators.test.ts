import {
  loginSchema,
  registerSchema,
  tenantCreateSchema,
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
    expect(
      registerSchema.safeParse({
        email: 'invalid',
        password: 'Abc123!',
        role: 'User',
      }).success,
    ).toBe(false)

    expect(
      registerSchema.safeParse({
        email: 'user@test.com',
        password: 'Abc123!',
        role: 'User',
      }).success,
    ).toBe(true)
  })

  it('validates tenant slug', () => {
    expect(tenantCreateSchema.safeParse({ name: 'Acme', slug: 'acme-corp' }).success).toBe(true)
    expect(tenantCreateSchema.safeParse({ name: 'Acme', slug: 'INVALID' }).success).toBe(false)
  })

  it('validates totp code length', () => {
    expect(totpCodeSchema.safeParse('123456').success).toBe(true)
    expect(totpCodeSchema.safeParse('12345').success).toBe(false)
  })
})
