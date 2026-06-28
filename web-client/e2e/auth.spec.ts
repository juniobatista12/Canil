import { test, expect } from '@playwright/test'
import { loginAsSuperAdmin } from './helpers/auth'

test.describe('auth', () => {
  test('login, dashboard visible, logout', async ({ page }) => {
    await loginAsSuperAdmin(page)
    await expect(page.getByRole('heading', { name: /painel|dashboard/i })).toBeVisible()

    await page.getByRole('button', { name: /conta|superadmin/i }).click()
    await page.getByRole('menuitem', { name: 'Sair' }).click()
    await expect(page).toHaveURL(/\/login/)
  })
})
