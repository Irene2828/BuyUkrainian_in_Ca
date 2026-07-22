const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Navigating to localhost:3000...");
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log("Page loaded. Looking for map container...");
  await page.waitForTimeout(5000);
  
  // Try to find the hero map element more robustly
  const mapElement = await page.$('.group');
  if (mapElement) {
    const box = await mapElement.boundingBox();
    if (box) {
      // Find the center of the bounding box
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      console.log(`Hovering over map at x:${centerX}, y:${centerY}`);
      
      // Move mouse to center
      await page.mouse.move(centerX, centerY);
      
      // Wait 3.5 seconds to trigger our delay
      console.log("Waiting 3.5 seconds for hover transition...");
      await page.waitForTimeout(3500);
      
      // Check if text is visible
      const textStatus = await page.evaluate(() => {
        // Look for the specific text
        const spans = Array.from(document.querySelectorAll('span'));
        const targetSpan = spans.find(el => el.textContent && el.textContent.includes('TAP TO EXPLORE THE MAP'));
        
        if (!targetSpan) return "Text element not found in DOM";
        
        // Find the overlay container which has the opacity/transition
        let container = targetSpan;
        while(container && !container.className.includes('absolute inset-0 z-[70]')) {
          container = container.parentElement;
        }
        
        if (!container) return "Container not found";
        
        const style = window.getComputedStyle(container);
        
        return {
          opacity: style.opacity,
          display: style.display,
          visibility: style.visibility,
          classes: container.className
        };
      });
      console.log("Hover text status: ", textStatus);
      await page.screenshot({path: 'hover-screenshot2.png'});
      console.log("Saved hover-screenshot2.png");
    }
  } else {
    console.log("Could not find map element");
  }
  
  await browser.close();
})();
