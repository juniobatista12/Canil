import { describe, expect, it } from 'vitest'
import { toQrCodeDataUrl } from '@/lib/twoFactor'

describe('toQrCodeDataUrl', () => {
  it('returns data URL unchanged when already prefixed', () => {
    const dataUrl = 'data:image/png;base64,abc'
    expect(toQrCodeDataUrl(dataUrl)).toBe(dataUrl)
  })

  it('prefixes raw base64', () => {
    expect(toQrCodeDataUrl('iVBOR')).toBe('data:image/png;base64,iVBOR')
  })

  it('returns empty string for empty input', () => {
    expect(toQrCodeDataUrl('')).toBe('')
    expect(toQrCodeDataUrl('   ')).toBe('')
  })
})
