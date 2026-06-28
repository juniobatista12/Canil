import { expect, type Page } from '@playwright/test'
import { authenticator } from 'otplib'

export const e2eEmail = process.env.E2E_SUPERADMIN_EMAIL ?? 'superadmin@localhost'
export const e2ePassword = process.env.E2E_SUPERADMIN_PASSWORD ?? 'SuperAdmin@123!'
export const e2eTenantSlug = process.env.SEED_TENANT_SLUG ?? 'system'

export async function loginAsSuperAdmin(
  page: Page,
  options?: { totpSecret?: string },
): Promise<void> {
  await page.goto('/login')
  await page.getByLabel(/tenant/i).fill(e2eTenantSlug)
  await page.getByLabel('E-mail').fill(e2eEmail)
  await page.getByLabel('Senha').fill(e2ePassword)
  await page.getByRole('button', { name: 'Entrar' }).click()

  const twoFactor = page.getByLabel(/código.*2fa/i)
  const needs2FA = await twoFactor
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false)

  if (needs2FA) {
    const secret = options?.totpSecret ?? process.env.E2E_2FA_SECRET
    if (!secret) {
      throw new Error('Login requires 2FA but no totpSecret or E2E_2FA_SECRET was provided')
    }
    await twoFactor.fill(authenticator.generate(secret))
    await page.getByRole('button', { name: 'Entrar' }).click()
  }

  await expect(page.getByText(/bem-vindo/i)).toBeVisible({ timeout: 15_000 })
}

export async function disableTwoFactorOnProfile(
  page: Page,
  options: { totpSecret: string; password?: string },
): Promise<void> {
  await page.goto('/profile')
  await page.getByRole('button', { name: /desativar 2fa/i }).click()
  await page.locator('#disable-password').fill(options.password ?? e2ePassword)
  await page.locator('#disable-code').fill(authenticator.generate(options.totpSecret))
  await page.getByRole('button', { name: 'Confirmar' }).click()
  await page.getByRole('button', { name: /configurar 2fa/i }).waitFor({ state: 'visible', timeout: 15_000 })
}
