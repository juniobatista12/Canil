import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('auth', () => {
  test('login, dashboard visible, logout', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.getByRole('heading', { name: /painel|dashboard/i })).toBeVisible()

    await page.getByRole('button', { name: /conta|admin/i }).click()
    await page.getByRole('menuitem', { name: 'Sair' }).click()
    await expect(page).toHaveURL(/\/login/)
  })
})
