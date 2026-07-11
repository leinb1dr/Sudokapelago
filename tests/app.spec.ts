import { expect, test } from '@playwright/test'

test('landing page introduces Sudokapelago and responds to greeting action', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Sudokapelago' })).toBeVisible()
  await expect(page.getByText('archipelago.js client initialized')).toBeVisible()

  await page.getByRole('button', { name: 'Say hello' }).click()

  await expect(page.getByText('Welcome to Sudokapelago!')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Puzzle awaits...' })).toBeVisible()
})
