import { describe, expect, it } from '@jest/globals'
import { toQrCodeDataUrl } from '@/lib/twoFactor'

describe('twoFactor', () => {
  it('prefixes raw base64 with data url', () => {
    expect(toQrCodeDataUrl('abc123')).toBe('data:image/png;base64,abc123')
    expect(toQrCodeDataUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
  })
})
