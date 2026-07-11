import { expect, test } from '@playwright/test'

test('landing page introduces Sudokapelago with an empty Sudoku grid', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Sudokapelago' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Empty Sudoku board' })).toBeVisible()
  await expect(page.getByText('archipelago.js client initialized')).toBeVisible()

  const grid = page.getByRole('grid', { name: 'Empty Sudoku grid' })
  const cells = grid.getByRole('gridcell')

  await expect(grid).toBeVisible()
  await expect(cells).toHaveCount(81)
  await expect(cells.first()).toHaveAccessibleName('Empty cell row 1 column 1')
  await expect(cells.last()).toHaveAccessibleName('Empty cell row 9 column 9')
  await expect(cells).toHaveText(Array.from({ length: 81 }, () => ''))
})
