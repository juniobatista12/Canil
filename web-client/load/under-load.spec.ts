import { test, expect } from '@playwright/test'
import { clickNavLink } from '../e2e/helpers/navigation'

const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@localhost'
const password = process.env.E2E_ADMIN_PASSWORD ?? 'Admin@123!'

test('login and list users under load', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText(/bem-vindo/i)).toBeVisible({ timeout: 60_000 })

  await clickNavLink(page, 'Usuários')
  await expect(page.getByRole('heading', { name: /usuários/i })).toBeVisible({ timeout: 60_000 })
})
