import { test, expect } from '@playwright/test'
import { clickNavLink } from '../e2e/helpers/navigation'

const email = process.env.E2E_SUPERADMIN_EMAIL ?? 'superadmin@localhost'
const password = process.env.E2E_SUPERADMIN_PASSWORD ?? 'SuperAdmin@123!'
const tenantSlug = process.env.SEED_TENANT_SLUG ?? 'system'

test('login and list users under load', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/tenant/i).fill(tenantSlug)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText(/bem-vindo/i)).toBeVisible({ timeout: 60_000 })

  await clickNavLink(page, 'Usuários')
  await expect(page.getByRole('heading', { name: /usuários/i })).toBeVisible({ timeout: 60_000 })
})
