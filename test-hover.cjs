const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Navigating to localhost:5000...");
  
  try {
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.log("Failed port 5000, trying 3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  }
  
  console.log("Page loaded. Looking for map container...");
  
  // Wait for map to render
  await page.waitForTimeout(3000);
  
  // Hover over the map area
  console.log("Hovering over the center of the viewport...");
  await page.mouse.move(500, 500); // Move to middle of screen
  
  // Wait 3.5 seconds to trigger our delay-[3000ms]
  console.log("Waiting 3.5 seconds for hover transition...");
  await page.waitForTimeout(3500);
  
  // Check if text is visible
  console.log("Checking if 'TAP TO EXPLORE' text is visible...");
  const textVisible = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('span')).find(el => el.textContent && el.textContent.includes('TAP TO EXPLORE THE MAP'));
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.opacity > 0 && style.visibility !== 'hidden';
  });
  
  console.log("Hover text is visible: " + textVisible);
  
  // Check stats font thickness
  const statsThickness = await page.evaluate(() => {
    const el = document.querySelector('.tabular-nums');
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily
    };
  });
  
  console.log("Stats digit styling: ", statsThickness);
  
  await browser.close();
})();
