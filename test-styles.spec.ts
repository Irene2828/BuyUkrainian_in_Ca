import { test, expect } from '@playwright/test';
test('get cta styles', async ({ page }) => {
  await page.goto('http://localhost:3001');
  const cta = page.locator('div.pointer-events-auto').filter({ hasText: 'Explore the Map' });
  const count = await cta.count();
  console.log('CTA Row Count:', count);
  for (let i = 0; i < count; i++) {
    const el = cta.nth(i);
    const box = await el.boundingBox();
    const className = await el.getAttribute('class');
    console.log(`CTA Row ${i}:`, { box, className });
  }
  const parent = page.locator('.hero-text-align');
  const parentBox = await parent.boundingBox();
  console.log('Parent Container:', parentBox);
});
