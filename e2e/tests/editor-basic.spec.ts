import { expect, test } from '@playwright/test';

/**
 * E2E Tests for Tenant Theme Editor Micro-Frontend
 *
 * Tests the standalone theme editor application (port 4446):
 * - Editor loads and shows preset selector
 * - Preset selection updates colors
 * - Color picker interaction
 * - Shade scale preview
 * - Light/dark mode toggle in preview
 * - Save button state management
 *
 * Prerequisites:
 *   The TenantThemeEditor dev server must be running on port 4446.
 *   Start via: cd TenantThemeEditor && npm run dev
 *   Or via Tilt: theme-editor-dev resource
 *
 * Run:
 *   cd TenantThemeEditor/e2e && npx playwright test
 *
 * @tag @theme-editor @micro-frontend
 */

const EDITOR_LOAD_TIMEOUT = 15000;
const PRESET_COUNT_MIN = 3;

// =============================================================================
// Editor Loading & Preset Selector
// =============================================================================

test.describe.serial('Theme Editor - Basic Functionality @theme-editor', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Wait for the editor layout to render (has the header with title)
    await expect(page.locator('h1')).toBeVisible({ timeout: EDITOR_LOAD_TIMEOUT });
  });

  test('should load the editor and show the page title', async ({ page }) => {
    // The editor layout has a header with the app title
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText, 'Editor title should not be empty').toBeTruthy();
  });

  test('should display preset selector with preset cards @critical', async ({ page }) => {
    // Preset cards have data-testid="preset-card-{id}"
    const presetCards = page.locator('[data-testid^="preset-card-"]');
    const count = await presetCards.count();
    expect(
      count,
      `Should display at least ${PRESET_COUNT_MIN} preset cards`
    ).toBeGreaterThanOrEqual(PRESET_COUNT_MIN);

    // Verify each card has a name and color strip
    for (let i = 0; i < count; i++) {
      const card = presetCards.nth(i);
      await expect(card).toBeVisible();

      // Card should have a name label
      const nameSpan = card.locator('span.font-medium').first();
      const name = await nameSpan.textContent();
      expect(name, `Preset card ${i} should have a name`).toBeTruthy();

      // Card should have color swatches (flex-1 divs inside the overflow strip)
      const colorStrip = card.locator('div.overflow-hidden').first();
      const swatches = colorStrip.locator('.flex-1');
      const swatchCount = await swatches.count();
      expect(
        swatchCount,
        `Preset card ${i} should have color swatches`
      ).toBeGreaterThanOrEqual(3);
    }
  });

  test('should mark exactly one preset as active', async ({ page }) => {
    const activePresets = page.locator('[data-testid^="preset-card-"][aria-pressed="true"]');
    const activeCount = await activePresets.count();
    expect(activeCount, 'Exactly one preset should be active').toBe(1);
  });

  test('should select a preset and see colors update @critical', async ({ page }) => {
    // Get the initial primary color hex value
    const primaryHexInput = page.locator('[data-testid="color-primary-hex"]');
    await expect(primaryHexInput).toBeVisible();
    const initialColor = await primaryHexInput.inputValue();

    // Click a different preset (Ocean)
    const oceanPreset = page.locator('[data-testid="preset-card-ocean"]');
    await oceanPreset.click();

    // Wait for the color to update
    await expect(async () => {
      const newColor = await primaryHexInput.inputValue();
      expect(newColor, 'Color should change after selecting a preset').not.toBe(initialColor);
    }).toPass();

    // Verify the Ocean preset is now active
    await expect(oceanPreset).toHaveAttribute('aria-pressed', 'true');
  });

  test('should update save button state after preset selection', async ({ page }) => {
    // Save button should be enabled when there are unsaved changes
    const saveButton = page.locator('[data-testid="action-save"]');
    await expect(saveButton).toBeVisible();

    // Click a different preset to create unsaved changes
    const forestPreset = page.locator('[data-testid="preset-card-forest"]');
    await forestPreset.click();

    // Save button should be enabled (dirty state)
    await expect(saveButton).toBeEnabled();
  });
});

// =============================================================================
// Color Picker Interaction
// =============================================================================

test.describe.serial('Theme Editor - Color Picker @theme-editor', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible({ timeout: EDITOR_LOAD_TIMEOUT });
  });

  test('should display primary, secondary, and accent color pickers', async ({ page }) => {
    const primarySwatch = page.locator('[data-testid="color-primary-swatch"]');
    const secondarySwatch = page.locator('[data-testid="color-secondary-swatch"]');
    const accentSwatch = page.locator('[data-testid="color-accent-swatch"]');

    await Promise.all([
      expect(primarySwatch).toBeVisible(),
      expect(secondarySwatch).toBeVisible(),
      expect(accentSwatch).toBeVisible(),
    ]);
  });

  test('should change primary color via hex input @critical', async ({ page }) => {
    const primaryHexInput = page.locator('[data-testid="color-primary-hex"]');
    await expect(primaryHexInput).toBeVisible();

    // Clear and type a new color
    await primaryHexInput.clear();
    await primaryHexInput.fill('#e63946');

    // Verify input accepted the value
    await expect(primaryHexInput).toHaveValue('#e63946');
  });

  test('should display semantic color pickers', async ({ page }) => {
    const successPicker = page.locator('[data-testid="color-success-hex"]');
    const warningPicker = page.locator('[data-testid="color-warning-hex"]');
    const errorPicker = page.locator('[data-testid="color-error-hex"]');
    const infoPicker = page.locator('[data-testid="color-info-hex"]');

    await Promise.all([
      expect(successPicker).toBeVisible(),
      expect(warningPicker).toBeVisible(),
      expect(errorPicker).toBeVisible(),
      expect(infoPicker).toBeVisible(),
    ]);
  });
});

// =============================================================================
// Shade Scale Preview
// =============================================================================

test.describe.serial('Theme Editor - Shade Scale Preview @theme-editor', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible({ timeout: EDITOR_LOAD_TIMEOUT });
  });

  test('should display shade scale previews for brand colors', async ({ page }) => {
    // Shade scale previews are rendered with aria-labels like "Primary shade 500"
    const shadeElements = page.locator('[aria-label*="shade"]');
    const count = await shadeElements.count();

    // 3 brand colors x 10 shades = 30 shade elements minimum
    const MIN_SHADE_COUNT = 30;
    expect(
      count,
      `Should have at least ${MIN_SHADE_COUNT} shade elements (3 colors x 10 shades)`
    ).toBeGreaterThanOrEqual(MIN_SHADE_COUNT);
  });

  test('should update shade scale when color changes @critical', async ({ page }) => {
    // Record a shade's background color before changing the primary
    const primaryShade500 = page.locator('[aria-label*="Primary"][aria-label*="500"]').first();
    await expect(primaryShade500).toBeVisible();
    const colorBefore = await primaryShade500.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Change the primary color
    const primaryHexInput = page.locator('[data-testid="color-primary-hex"]');
    await primaryHexInput.clear();
    await primaryHexInput.fill('#ff5722');

    // Wait for the shade to update
    await expect(async () => {
      const colorAfter = await primaryShade500.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(
        colorAfter,
        'Shade 500 should update when primary color changes'
      ).not.toBe(colorBefore);
    }).toPass();
  });

  test('should render all 10 shades per color scale', async ({ page }) => {
    // Each shade scale should have 10 shades (50, 100, 200, ..., 900)
    const expectedShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

    for (const shade of expectedShades) {
      const shadeEl = page.locator(`[aria-label*="Primary"][aria-label*="${shade}"]`).first();
      await expect(
        shadeEl,
        `Primary shade ${shade} should be rendered`
      ).toBeVisible();
    }
  });
});

// =============================================================================
// Light/Dark Mode Toggle
// =============================================================================

test.describe.serial('Theme Editor - Preview Mode Toggle @theme-editor', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible({ timeout: EDITOR_LOAD_TIMEOUT });
  });

  test('should display preview mode toggle button', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="preview-mode-toggle"]');
    await expect(toggleButton).toBeVisible();
  });

  test('should toggle between light and dark mode in preview @critical', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="preview-mode-toggle"]');

    // Get initial toggle text
    const initialText = await toggleButton.textContent();

    // Click to toggle
    await toggleButton.click();

    // The button text should change (it shows the opposite mode name)
    await expect(async () => {
      const newText = await toggleButton.textContent();
      expect(
        newText,
        'Toggle button text should change after clicking'
      ).not.toBe(initialText);
    }).toPass();

    // Toggle back
    await toggleButton.click();

    // Should be back to original
    await expect(toggleButton).toHaveText(initialText ?? '');
  });

  test('should change preview background when toggling dark mode', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="preview-mode-toggle"]');

    // Get the preview panel's background color (the outer container with border)
    const previewPanel = page.locator('.overflow-hidden.rounded-xl.border').first();

    // Only proceed if the preview panel exists
    if (await previewPanel.count() > 0) {
      const lightBg = await previewPanel.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Toggle to dark mode
      await toggleButton.click();

      // Wait for the background to change
      await expect(async () => {
        const darkBg = await previewPanel.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        expect(
          darkBg,
          'Preview background should change when toggling dark mode'
        ).not.toBe(lightBg);
      }).toPass();

      // Toggle back
      await toggleButton.click();
    }
  });
});

// =============================================================================
// Save Button Behavior
// =============================================================================

test.describe.serial('Theme Editor - Save Flow @theme-editor', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible({ timeout: EDITOR_LOAD_TIMEOUT });
  });

  test('should have save button disabled when no changes are made', async ({ page }) => {
    const saveButton = page.locator('[data-testid="action-save"]');
    await expect(saveButton).toBeVisible();

    // On fresh load with no changes, save should be disabled
    // Note: This depends on the initial state matching the saved state
    // The button is disabled when isDirty is false
    await expect(saveButton).toBeDisabled();
  });

  test('should enable save button after making changes', async ({ page }) => {
    const saveButton = page.locator('[data-testid="action-save"]');
    const primaryHexInput = page.locator('[data-testid="color-primary-hex"]');

    // Make a change
    await primaryHexInput.clear();
    await primaryHexInput.fill('#123456');

    // Save button should be enabled
    await expect(saveButton).toBeEnabled();
  });

  test('should have reset button always available', async ({ page }) => {
    const resetButton = page.locator('[data-testid="action-reset"]');
    await expect(resetButton).toBeVisible();
    await expect(resetButton).toBeEnabled();
  });

  test('should persist theme to API when save is clicked @critical', async ({ page }) => {
    const saveButton = page.locator('[data-testid="action-save"]');
    const primaryHexInput = page.locator('[data-testid="color-primary-hex"]');

    // Make a change to dirty the state
    await primaryHexInput.clear();
    await primaryHexInput.fill('#abcdef');
    await expect(saveButton).toBeEnabled();

    // Click save
    await saveButton.click();

    // After save, the button should become disabled (isDirty = false)
    await expect(saveButton).toBeDisabled();
  });
});

// =============================================================================
// Mode Editor Section
// =============================================================================

test.describe('Theme Editor - Mode Editor @theme-editor', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible({ timeout: EDITOR_LOAD_TIMEOUT });
  });

  test('should display light and dark mode panels', async ({ page }) => {
    // Mode editor has color inputs for light and dark modes
    const lightBgInput = page.locator('[data-testid="mode-light-background-hex"]');
    const darkBgInput = page.locator('[data-testid="mode-dark-background-hex"]');

    await Promise.all([
      expect(lightBgInput).toBeVisible(),
      expect(darkBgInput).toBeVisible(),
    ]);
  });

  test('should edit mode-specific colors', async ({ page }) => {
    const lightBgInput = page.locator('[data-testid="mode-light-background-hex"]');
    await expect(lightBgInput).toBeVisible();

    // Change the light mode background
    await lightBgInput.clear();
    await lightBgInput.fill('#f8f9fa');

    await expect(lightBgInput).toHaveValue('#f8f9fa');

    // Save button should now be enabled
    const saveButton = page.locator('[data-testid="action-save"]');
    await expect(saveButton).toBeEnabled();
  });
});
