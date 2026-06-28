import { test, expect } from '@playwright/test'
import { authenticator } from 'otplib'
import { disableTwoFactorOnProfile, loginAsAdmin } from './helpers/auth'
import { goToProfile } from './helpers/navigation'
import { resetAdminTwoFactor } from './helpers/reset-2fa'

test.describe('profile 2FA', () => {
  test.describe.configure({ timeout: 60_000 })

  test.beforeEach(() => {
    resetAdminTwoFactor()
  })

  test.afterEach(async ({ page }) => {
    resetAdminTwoFactor()
    await page.context().clearCookies()
  })

  test('setup and enable 2FA using TOTP from setup response', async ({ page }) => {
    await loginAsAdmin(page)
    await goToProfile(page)

    await page.getByRole('button', { name: /configurar 2fa/i }).click()
    await expect(page.getByAltText(/qr code/i)).toBeVisible({ timeout: 15_000 })

    const sharedKey = (await page.locator('p.font-mono').textContent()) ?? ''
    const secret = sharedKey.replace(/\s/g, '')
    const code = authenticator.generate(secret)

    await page.locator('#totp-code').fill(code)
    await page.getByRole('button', { name: /ativar 2fa/i }).click()
    await page.getByRole('button', { name: 'Confirmar' }).click()
    await page.getByRole('button', { name: /desativar 2fa/i }).waitFor({ state: 'visible', timeout: 15_000 })

    await disableTwoFactorOnProfile(page, { totpSecret: secret })
  })
})
