import { expect, test } from '@playwright/test'

test('landing page introduces the human-solvable setter with an empty grid', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Sudokapelago' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Human-solvable Sudoku setter' }),
  ).toBeVisible()
  await expect(
    page.getByText('Choose a difficulty, then generate a puzzle.'),
  ).toBeVisible()
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
  await expect(firstCell).toHaveCSS('background-color', 'rgb(219, 234, 254)')

  await secondCell.click()
  await expect(firstCell).toHaveAttribute('aria-selected', 'false')
  await expect(secondCell).toHaveAttribute('aria-selected', 'true')
  await expect(secondCell).toHaveCSS('background-color', 'rgb(219, 234, 254)')

  await page.keyboard.press('5')
  await expect(firstCell).toHaveText('')
  await expect(secondCell).toHaveText('5')
  await expect(secondCell).toHaveAccessibleName('Cell row 1 column 2 value 5')
})

test('arrow and WASD keys move selection around the grid', async ({ page }) => {
  await page.goto('/')

  const grid = page.getByRole('grid', { name: 'Sudoku grid' })
  const cells = grid.getByRole('gridcell')
  const startCell = cells.nth(40)

  await startCell.click()
  await expect(startCell).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('ArrowRight')
  const rightCell = cells.nth(41)
  await expect(rightCell).toHaveAttribute('aria-selected', 'true')
  await expect(startCell).toHaveAttribute('aria-selected', 'false')

  await page.keyboard.press('ArrowDown')
  const downCell = cells.nth(50)
  await expect(downCell).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('a')
  const leftCell = cells.nth(49)
  await expect(leftCell).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('w')
  await expect(startCell).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('5')
  await expect(startCell).toHaveText('5')
  await expect(rightCell).toHaveText('')
})

test('generates a playable puzzle with locked givens at the selected difficulty', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByText('Hard', { exact: true }).click()
  await page.getByRole('button', { name: 'Generate hard puzzle' }).click()

  await expect(page.getByRole('status')).toContainText(
    /hard puzzle · \d+ clues · 81 cells tested/,
  )

  const grid = page.getByRole('grid', { name: 'Sudoku grid' })
  const givenCells = grid.locator('[role="gridcell"][aria-readonly="true"]')
  const editableCells = grid.locator('[role="gridcell"][aria-readonly="false"]')
  await expect(givenCells.first()).toBeVisible()
  await expect(editableCells.first()).toBeVisible()

  const givenValue = await givenCells.first().textContent()
  await givenCells.first().press('9')
  await expect(givenCells.first()).toHaveText(givenValue ?? '')

  await editableCells.first().press('9')
  await expect(editableCells.first()).toHaveText('9')
  await editableCells.first().press('Backspace')
  await expect(editableCells.first()).toHaveText('')
})

test('debug solve logs human technique steps to the console', async ({ page }) => {
  const consoleMessages: string[] = []
  page.on('console', (message) => {
    consoleMessages.push(message.text())
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Generate easy puzzle' }).click()
  await page.getByRole('button', { name: 'Debug solve with easy techniques' }).click()

  await expect.poll(() =>
    consoleMessages.some((message) => message.includes('[Sudokapelago] Human solve')),
  ).toBe(true)
  await expect.poll(() =>
    consoleMessages.some((message) => /Step 1: (Cross Hatch|Hidden Single|Naked Single):/.test(message)),
  ).toBe(true)
})

test('supports standard and corner/center pencil marks with independent styles', async ({
  page,
}) => {
  await page.goto('/')

  const grid = page.getByRole('grid', { name: 'Sudoku grid' })
  const firstCell = grid.getByRole('gridcell').first()

  await page.getByText('Pencil', { exact: true }).click()
  await expect(page.getByText('Pencil mark style')).toBeVisible()

  await firstCell.click()
  await page.keyboard.press('1')
  await page.keyboard.press('9')
  await expect(firstCell.locator('[data-digit="1"]')).toHaveText('1')
  await expect(firstCell.locator('[data-digit="9"]')).toHaveText('9')
  await expect(firstCell).toHaveAccessibleName(
    'Empty cell row 1 column 1 with standard pencil marks 1 9',
  )
  const standardInset = await firstCell
    .locator('.sudoku-grid__standard-marks')
    .evaluate((element) => getComputedStyle(element).inset)
  expect(standardInset.split(/\s+/).every((value) => Number.parseFloat(value) >= 4.8)).toBe(
    true,
  )

  await page.getByText('Corner/Center', { exact: true }).click()
  await expect(page.getByText('Corner or center')).toBeVisible()
  await expect(firstCell.locator('[data-digit="1"]')).toHaveCount(0)
  await expect(firstCell.locator('[data-corner-slot="top-left"]')).toHaveCount(0)

  await firstCell.click()
  await page.keyboard.press('1')
  await page.keyboard.press('5')
  await page.keyboard.press('3')
  await expect(firstCell.locator('[data-corner-slot="top-left"]')).toHaveText('1')
  await expect(firstCell.locator('[data-corner-slot="top-right"]')).toHaveText('3')
  await expect(firstCell.locator('[data-corner-slot="bottom-left"]')).toHaveText(
    '5',
  )

  await page.getByText('Center', { exact: true }).click()
  await firstCell.click()
  await page.keyboard.press('2')
  await page.keyboard.press('9')
  await expect(firstCell.locator('.sudoku-grid__center-marks')).toHaveText('2 9')
  await expect(firstCell.locator('[data-corner-slot="top-left"]')).toHaveText('1')

  await page.getByText('Standard', { exact: true }).click()
  await expect(firstCell.locator('[data-digit="1"]')).toHaveText('1')
  await expect(firstCell.locator('[data-digit="9"]')).toHaveText('9')
  await expect(firstCell.locator('[data-corner-slot="top-left"]')).toHaveCount(0)

  await page.getByText('Number', { exact: true }).click()
  await firstCell.click()
  await page.keyboard.press('8')
  await expect(firstCell).toHaveText('8')
  await page.keyboard.press('8')
  await expect(firstCell.locator('[data-digit="1"]')).toHaveText('1')
  await expect(firstCell.locator('[data-digit="9"]')).toHaveText('9')
})
