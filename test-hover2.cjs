const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Navigating...");
  
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log("Page loaded. Looking for map container...");
  await page.waitForTimeout(5000);
  
  // Look specifically for the hero map
  const mapElement = await page.$('.interactive-map-container, [variant="hero"], .group');
  if (mapElement) {
    const box = await mapElement.boundingBox();
    if (box) {
      console.log(`Hovering over map at x:${box.x + box.width/2}, y:${box.y + box.height/2}`);
      await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
      
      // Wait 3.5 seconds to trigger our delay
      console.log("Waiting 4 seconds for hover transition...");
      await page.waitForTimeout(4000);
      
      // Check if text is visible
      const textStatus = await page.evaluate(() => {
        const span = Array.from(document.querySelectorAll('span')).find(el => el.textContent && el.textContent.includes('TAP TO EXPLORE THE MAP'));
        if (!span) return "Text element not found in DOM";
        
        const style = window.getComputedStyle(span);
        const parent = span.parentElement;
        const parentStyle = parent ? window.getComputedStyle(parent) : null;
        const grandParent = parent ? parent.parentElement : null;
        const grandParentStyle = grandParent ? window.getComputedStyle(grandParent) : null;
        
        return {
          spanOpacity: style.opacity,
          spanVisibility: style.visibility,
          spanDisplay: style.display,
          parentOpacity: parentStyle ? parentStyle.opacity : 'none',
          grandParentOpacity: grandParentStyle ? grandParentStyle.opacity : 'none',
          grandParentClasses: grandParent ? grandParent.className : 'none'
        };
      });
      console.log("Hover text status: ", textStatus);
    }
  } else {
    console.log("Could not find map element to hover");
  }
  
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
