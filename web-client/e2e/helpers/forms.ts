import type { Page } from '@playwright/test'

/** Base UI Select — do not use page.getByRole('combobox').first() (email inputs expose combobox in Chromium). */
export async function pickSelectByIndex(page: Page, index: number, optionName: string | RegExp): Promise<void> {
  await page.locator('[data-slot="select-trigger"]').nth(index).click()
  await page.locator('[data-slot="select-item"]').filter({ hasText: optionName }).click()
}

export async function pickSelectByLabel(page: Page, label: string | RegExp, optionName: string | RegExp): Promise<void> {
  const section = page.locator('div.space-y-2').filter({
    has: page.locator('[data-slot="label"]').filter({ hasText: label }),
  })
  await section.locator('[data-slot="select-trigger"]').click()
  const option = page.locator('[data-slot="select-item"]').filter({ hasText: optionName })
  await option.waitFor({ state: 'visible', timeout: 10_000 })
  await option.click()
}
