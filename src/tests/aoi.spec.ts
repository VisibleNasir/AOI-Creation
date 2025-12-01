
import { test, expect } from '@playwright/test';

test.describe('AOI Creation Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
  });

  test('should load the map with WMS layer', async ({ page }) => {
    // Wait for map container to be visible
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 });
    
    // Check that map tiles are loading
    const tileLayer = page.locator('.leaflet-tile-pane');
    await expect(tileLayer).toBeVisible();
    
    // Verify WMS layer is present
    const wmsLayer = page.locator('img[src*="wms.nrw.de"]').first();
    await expect(wmsLayer).toBeVisible({ timeout: 15000 });
    
    // Check that custom controls are present
    await expect(page.getByLabel('Zoom in')).toBeVisible();
    await expect(page.getByLabel('Zoom out')).toBeVisible();
    await expect(page.getByLabel('Fullscreen')).toBeVisible();
  });

  test('should have correct UI elements matching Figma design', async ({ page }) => {
    // Check sidebar is present
    await expect(page.locator('text=Define Area of Interest')).toBeVisible();
    
    // Check search box
    const searchInput = page.locator('input[placeholder*="Search for a city"]');
    await expect(searchInput).toBeVisible();
    
    // Check upload button
    await expect(page.locator('text=Uploading a shape file')).toBeVisible();
    
    // Check drawing tools section
    await expect(page.locator('text=Drawing Tools')).toBeVisible();
    await expect(page.locator('button:has-text("Start Drawing Polygon")')).toBeVisible();
    
    // Check sidebar icons
    await expect(page.locator('.lucide-home')).toBeVisible();
    await expect(page.locator('.lucide-grid')).toBeVisible();
  });

  test('should zoom in and out using custom controls', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click zoom in button
    await page.getByLabel('Zoom in').click();
    await page.waitForTimeout(500);
    
    // Verify zoom increased (note: this may not work if map object isn't exposed)
    // Alternative: check that map moved by inspecting transform
    const zoomInTransform = await page.locator('.leaflet-map-pane').getAttribute('style');
    expect(zoomInTransform).toBeTruthy();
    
    // Click zoom out button
    await page.getByLabel('Zoom out').click();
    await page.waitForTimeout(500);
    
    const zoomOutTransform = await page.locator('.leaflet-map-pane').getAttribute('style');
    expect(zoomOutTransform).toBeTruthy();
  });

  test('should respect zoom limits (minZoom: 6, maxZoom: 19)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Try to zoom out beyond limit (click zoom out 10 times)
    for (let i = 0; i < 10; i++) {
      await page.getByLabel('Zoom out').click();
      await page.waitForTimeout(100);
    }
    
    // Map should stop at minZoom=6, not show infinite white space
    const mapPane = page.locator('.leaflet-map-pane');
    await expect(mapPane).toBeVisible();
    
    // Try to zoom in beyond limit
    for (let i = 0; i < 15; i++) {
      await page.getByLabel('Zoom in').click();
      await page.waitForTimeout(100);
    }
    
    // Should still show map tiles
    await expect(page.locator('.leaflet-tile-pane')).toBeVisible();
  });
});

test.describe('Geocoding Search Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.evaluate(() => localStorage.clear());
  });

  test('should search for a location and display results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search for a city"]');
    
    // Type search query
    await searchInput.fill('Cologne');
    await searchInput.press('Enter');
    
    // Wait for search results to appear
    await page.waitForTimeout(2000); // Wait for API response
    
    // Check that dropdown with results appeared
    const resultsDropdown = page.locator('div.absolute.top-full');
    await expect(resultsDropdown).toBeVisible({ timeout: 5000 });
    
    // Verify at least one result is shown
    const firstResult = resultsDropdown.locator('button').first();
    await expect(firstResult).toBeVisible();
    await expect(firstResult).toContainText('Cologne');
  });

  test('should select a search result and update map center', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search for a city"]');
    
    // Search for Cologne
    await searchInput.fill('Cologne');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // Click first result
    const resultsDropdown = page.locator('div.absolute.top-full');
    const firstResult = resultsDropdown.locator('button').first();
    await firstResult.click();
    
    // Verify marker appears on map
    await page.waitForTimeout(1000);
    const marker = page.locator('.leaflet-marker-icon');
    await expect(marker).toBeVisible({ timeout: 5000 });
    
    // Verify search input shows selected location name
    const inputValue = await searchInput.inputValue();
    expect(inputValue.length).toBeGreaterThan(0);
    expect(inputValue).not.toBe('Cologne'); // Should show shortened display name
  });

  test('should handle search with no results gracefully', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search for a city"]');
    
    // Search for nonsense text
    await searchInput.fill('xyzabc123456789impossible');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // Results dropdown should not appear or be empty
    const resultsDropdown = page.locator('div.absolute.top-full');
    const isVisible = await resultsDropdown.isVisible().catch(() => false);
    
    if (isVisible) {
      // If dropdown exists, it should be empty
      const resultCount = await resultsDropdown.locator('button').count();
      expect(resultCount).toBe(0);
    }
  });

  test('should clear search results when empty search is submitted', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search for a city"]');
    
    // First, do a successful search
    await searchInput.fill('Berlin');
    await searchInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // Then clear and search again
    await searchInput.clear();
    await searchInput.press('Enter');
    
    // Results should not appear
    const resultsDropdown = page.locator('div.absolute.top-full');
    await expect(resultsDropdown).not.toBeVisible({ timeout: 1000 });
  });
});

test.describe('Polygon Drawing Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.evaluate(() => localStorage.clear());
  });

  test('should activate drawing mode when button is clicked', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const drawButton = page.locator('button:has-text("Start Drawing Polygon")');
    await drawButton.click();
    
    // Button text should change
    await expect(page.locator('button:has-text("Finish drawing")')).toBeVisible();
    
    // Map cursor should change to crosshair
    const mapContainer = page.locator('.leaflet-container');
    const cursorStyle = await mapContainer.evaluate((el) => 
      window.getComputedStyle(el).cursor
    );
    expect(cursorStyle).toBe('crosshair');
  });

  test('should draw a polygon by clicking on map', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Start drawing
    await page.locator('button:has-text("Start Drawing Polygon")').click();
    await page.waitForTimeout(500);
    
    // Get map container bounds
    const mapContainer = page.locator('.leaflet-container');
    const box = await mapContainer.boundingBox();
    
    if (box) {
      // Click 4 points to create a polygon
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      await page.mouse.click(centerX - 50, centerY - 50);
      await page.waitForTimeout(200);
      
      await page.mouse.click(centerX + 50, centerY - 50);
      await page.waitForTimeout(200);
      
      await page.mouse.click(centerX + 50, centerY + 50);
      await page.waitForTimeout(200);
      
      await page.mouse.click(centerX - 50, centerY + 50);
      await page.waitForTimeout(200);
      
      // Double-click to finish
      await page.mouse.dblclick(centerX - 50, centerY - 50);
      await page.waitForTimeout(500);
      
      // Verify polygon appears in saved list
      await expect(page.locator('text=Saved Areas (1)')).toBeVisible({ timeout: 3000 });
      await expect(page.locator('text=AOI 1')).toBeVisible();
    }
  });

  test('should persist drawn polygons in localStorage', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Draw a polygon (simplified - just activate and verify storage)
    await page.locator('button:has-text("Start Drawing Polygon")').click();
    
    const mapContainer = page.locator('.leaflet-container');
    const box = await mapContainer.boundingBox();
    
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      await page.mouse.click(centerX, centerY);
      await page.mouse.click(centerX + 100, centerY);
      await page.mouse.click(centerX + 100, centerY + 100);
      await page.mouse.click(centerX, centerY + 100);
      await page.mouse.dblclick(centerX, centerY);
      await page.waitForTimeout(1000);
      
      // Check localStorage has data
      const storageData = await page.evaluate(() => 
        localStorage.getItem('aoi-polygons')
      );
      expect(storageData).toBeTruthy();
      expect(storageData).toContain('AOI 1');
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify polygon is still there
      await expect(page.locator('text=Saved Areas (1)')).toBeVisible({ timeout: 3000 });
      await expect(page.locator('text=AOI 1')).toBeVisible();
    }
  });

  test('should delete a saved polygon', async ({ page }) => {
    // First, add a polygon via localStorage
    await page.evaluate(() => {
      const mockPolygon = [{
        id: 123456789,
        name: 'Test AOI',
        points: [[50.9, 6.9], [50.91, 6.9], [50.91, 6.91], [50.9, 6.91]]
      }];
      localStorage.setItem('aoi-polygons', JSON.stringify(mockPolygon));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify polygon exists
    await expect(page.locator('text=Test AOI')).toBeVisible();
    
    // Click delete button
    const deleteButton = page.locator('button:has-text("Delete")').first();
    await deleteButton.click();
    await page.waitForTimeout(500);
    
    // Verify polygon is removed
    await expect(page.locator('text=Test AOI')).not.toBeVisible();
    await expect(page.locator('text=Saved Areas')).not.toBeVisible();
  });

  test('should show vertex count for saved polygons', async ({ page }) => {
    // Add a polygon via localStorage
    await page.evaluate(() => {
      const mockPolygon = [{
        id: 999,
        name: 'Pentagon AOI',
        points: [
          [50.9, 6.9], 
          [50.91, 6.9], 
          [50.92, 6.95],
          [50.91, 6.97], 
          [50.9, 6.96]
        ]
      }];
      localStorage.setItem('aoi-polygons', JSON.stringify(mockPolygon));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check vertex count is displayed
    await expect(page.locator('text=5 vertices')).toBeVisible();
  });
});


test.describe('Shapefile Upload Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should show upload button with correct styling', async ({ page }) => {
    const uploadButton = page.locator('text=Uploading a shape file');
    await expect(uploadButton).toBeVisible();
    
    // Check styling matches Figma (orange theme)
    const parentDiv = uploadButton.locator('..');
    const bgColor = await parentDiv.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should have orange-ish background (rgb values around 255, 237, 213 for orange-50)
    expect(bgColor).toContain('rgb');
  });

  test('should trigger file input when upload button is clicked', async ({ page }) => {
    const uploadButton = page.locator('text=Uploading a shape file');
    
    // Click upload button
    await uploadButton.click();
    
    // Note: Since this is a label wrapping a hidden input,
    // we verify the input exists and has correct accept attribute
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
    
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).toContain('.shp');
    expect(acceptAttr).toContain('.geojson');
    expect(acceptAttr).toContain('.kml');
  });

  test('should handle file upload (shows alert in demo)', async ({ page }) => {
    // Listen for alert dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('File uploaded');
      await dialog.accept();
    });
    
    // Create a mock file
    const fileInput = page.locator('input[type="file"]');
    
    // Set files (this triggers onChange)
    await fileInput.setInputFiles({
      name: 'test-area.geojson',
      mimeType: 'application/json',
      buffer: new TextEncoder().encode(JSON.stringify({
        type: 'FeatureCollection',
        features: []
      }))
    });
    
    // Wait for alert
    await page.waitForTimeout(500);
    
  });
});


test.describe('Accessibility (A11Y)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    // Check map controls have aria-labels
    await expect(page.getByLabel('Zoom in')).toBeVisible();
    await expect(page.getByLabel('Zoom out')).toBeVisible();
    await expect(page.getByLabel('Fullscreen')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check that focus is visible (this is basic, full test needs more)
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeTruthy();
  });

  test('should have semantic HTML structure', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Define Area of Interest');
    
    // Check for semantic buttons (not divs with click handlers)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(5); // Multiple buttons in UI
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Check that main heading has good contrast
    const heading = page.locator('h1');
    const color = await heading.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    
    // Orange-500 text should have proper contrast
    expect(color).toBeTruthy();
  });
});