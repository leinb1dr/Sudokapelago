import { expect, test } from '@playwright/test'

test('landing page introduces Sudokapelago with an empty Sudoku grid', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Sudokapelago' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Empty Sudoku board' })).toBeVisible()
  await expect(page.getByText('archipelago.js client initialized')).toBeVisible()

  const grid = page.getByRole('grid', { name: 'Sudoku grid' })
  const cells = grid.getByRole('gridcell')

  await expect(grid).toBeVisible()
  await expect(cells).toHaveCount(81)
  await expect(cells.first()).toHaveAccessibleName('Empty cell row 1 column 1')
  await expect(cells.last()).toHaveAccessibleName('Empty cell row 9 column 9')
  await expect(cells).toHaveText(Array.from({ length: 81 }, () => ''))

  const gridFrameBorderTopWidth = await grid.evaluate((element) =>
    getComputedStyle(element, '::after').borderTopWidth,
  )

  expect(gridFrameBorderTopWidth).toBe('4px')
  await expect(cells.nth(2)).toHaveCSS('border-right-width', '3px')
  await expect(cells.nth(5)).toHaveCSS('border-right-width', '3px')
  await expect(cells.nth(8)).toHaveCSS('border-right-width', '0px')
  await expect(cells.nth(18)).toHaveCSS('border-bottom-width', '3px')
  await expect(cells.nth(45)).toHaveCSS('border-bottom-width', '3px')
  await expect(cells.nth(72)).toHaveCSS('border-bottom-width', '0px')
})

test('grid cells accept only digits 1 through 9 from the keyboard', async ({ page }) => {
  await page.goto('/')

  const grid = page.getByRole('grid', { name: 'Sudoku grid' })
  const firstCell = grid.getByRole('gridcell').first()

  await firstCell.press('5')
  await expect(firstCell).toHaveText('5')
  await expect(firstCell).toHaveAccessibleName('Cell row 1 column 1 value 5')

  await firstCell.press('0')
  await expect(firstCell).toHaveText('5')
  await expect(firstCell).toHaveAccessibleName('Cell row 1 column 1 value 5')

  await firstCell.press('9')
  await expect(firstCell).toHaveText('9')
  await expect(firstCell).toHaveAccessibleName('Cell row 1 column 1 value 9')
})

test('clicking a grid cell immediately shows it as selected', async ({ page }) => {
  await page.goto('/')

  const grid = page.getByRole('grid', { name: 'Sudoku grid' })
  const cells = grid.getByRole('gridcell')
  const firstCell = cells.first()
  const secondCell = cells.nth(1)

  await firstCell.click()
  await expect(firstCell).toHaveAttribute('aria-selected', 'true')
  await expect(firstCell).toHaveCSS('background-color', 'rgb(238, 246, 255)')
  await expect(firstCell).toHaveCSS('box-shadow', /rgb\(100, 108, 255\)/)

  await secondCell.click()
  await expect(firstCell).toHaveAttribute('aria-selected', 'false')
  await expect(secondCell).toHaveAttribute('aria-selected', 'true')
  await expect(secondCell).toHaveCSS('background-color', 'rgb(238, 246, 255)')
})
