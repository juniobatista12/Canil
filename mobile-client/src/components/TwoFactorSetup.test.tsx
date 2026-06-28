import { describe, expect, it, jest } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import { Linking } from 'react-native'
import { TwoFactorSetup } from '@/components/TwoFactorSetup'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('TwoFactorSetup', () => {
  it('opens authenticator uri', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)

    await renderWithProviders(
      <TwoFactorSetup
        setup={{
          sharedKey: 'KEY',
          qrCodeBase64: 'abc',
          authenticatorUri: 'otpauth://totp/JAdmin',
        }}
        code=""
        onCodeChange={jest.fn()}
      />,
    )

    fireEvent.press(screen.getByRole('button', { name: /autenticador/i }))
    expect(openURL).toHaveBeenCalledWith('otpauth://totp/JAdmin')
    openURL.mockRestore()
  })
})
