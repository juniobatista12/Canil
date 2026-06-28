import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'
import { clickNavLink } from './helpers/navigation'
import { guidPath } from './helpers/routes'

test.describe('users', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await clickNavLink(page, 'Usuários')
  })

  test('list users and register new user', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /usuários/i })).toBeVisible()

    await page.getByRole('link', { name: /registrar usuário/i }).click()
    await expect(page).toHaveURL(/\/users\/register$/)
    await expect(page.getByRole('heading', { name: /registrar usuário/i })).toBeVisible()

    const newEmail = `e2e-${Date.now()}@localhost`
    await page.getByLabel('E-mail').fill(newEmail)
    await page.getByLabel('Senha').fill('UserPass1!')
    await expect(page.getByText('E-mail inválido')).not.toBeVisible()

    const [registerResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/auth/register') && r.request().method() === 'POST',
      ),
      page.locator('form').getByRole('button', { name: /^Salvar$/i }).click(),
    ])
    expect(
      registerResponse.ok(),
      `register failed: ${registerResponse.status()} ${await registerResponse.text()}`,
    ).toBeTruthy()

    await expect(page).toHaveURL(guidPath('users'), { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: /detalhe do usuário/i })).toBeVisible()
    await expect(page.locator('main').getByText(newEmail)).toBeVisible({ timeout: 15_000 })
  })
})
