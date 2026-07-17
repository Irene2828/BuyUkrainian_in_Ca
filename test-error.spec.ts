import { test, expect } from '@playwright/test';
test('get console error', async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER_ERROR:', msg.text());
    }
  });
  page.on('pageerror', err => {
    console.log('PAGE_ERROR:', err.message, err.stack);
  });
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(3000);
});
