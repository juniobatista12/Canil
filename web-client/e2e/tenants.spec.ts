import { test, expect } from '@playwright/test'
import { loginAsSuperAdmin } from './helpers/auth'
import { clickNavLink } from './helpers/navigation'
import { guidPath } from './helpers/routes'

test.describe('tenants', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page)
    await clickNavLink(page, 'Tenants')
  })

  test('create tenant and edit name', async ({ page }) => {
    const slug = `e2e-${Date.now()}`.slice(0, 20)

    await page.getByRole('link', { name: /novo tenant/i }).click()
    await page.getByLabel(/^nome$/i).fill('E2E Tenant')
    await page.getByLabel(/^slug$/i).fill(slug)
    await page.getByRole('button', { name: /salvar/i }).click()

    await expect(page).toHaveURL(guidPath('tenants'), { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: /editar tenant/i })).toBeVisible()

    await page.getByLabel(/^nome$/i).fill('E2E Tenant Updated')
    await page.getByRole('button', { name: /salvar/i }).click()
    await expect(page.getByText('E2E Tenant Updated')).toBeVisible({ timeout: 15_000 })
  })
})
