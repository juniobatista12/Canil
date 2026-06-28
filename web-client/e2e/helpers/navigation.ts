import type { Page } from '@playwright/test'

/** Sidebar link — avoids strict-mode clash with dashboard quick links in `<main>`. */
export async function clickNavLink(page: Page, name: string | RegExp): Promise<void> {
  await page.getByRole('navigation').getByRole('link', { name }).click()
}

export async function goToProfile(page: Page): Promise<void> {
  await page.goto('/profile')
}
