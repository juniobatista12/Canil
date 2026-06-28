import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TwoFactorSetup } from '@/components/TwoFactorSetup'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('TwoFactorSetup', () => {
  it('renders QR code and manual key', () => {
    renderWithProviders(
      <TwoFactorSetup
        setup={{
          sharedKey: 'ABCD EFGH',
          qrCodeBase64: 'data:image/png;base64,abc',
          authenticatorUri: 'otpauth://totp/JAdmin',
        }}
        code=""
        onCodeChange={() => undefined}
      />,
    )

    expect(screen.getByAltText(/qr code/i)).toBeInTheDocument()
    expect(screen.getByText('ABCD EFGH')).toBeInTheDocument()
  })

  it('calls onCodeChange when typing TOTP', async () => {
    const user = userEvent.setup()
    const onCodeChange = vi.fn()

    renderWithProviders(
      <TwoFactorSetup
        setup={{
          sharedKey: 'KEY',
          qrCodeBase64: 'data:image/png;base64,abc',
          authenticatorUri: 'otpauth://totp/JAdmin',
        }}
        code=""
        onCodeChange={onCodeChange}
      />,
    )

    await user.type(screen.getByLabelText(/código/i), '123456')
    expect(onCodeChange).toHaveBeenCalled()
  })
})
