const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Navigating to localhost:3000...");
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log("Page loaded. Looking for map container...");
  await page.waitForTimeout(5000);
  
  // Look specifically for the hero map group div
  const mapElement = await page.$('div.group.relative');
  if (mapElement) {
    const box = await mapElement.boundingBox();
    if (box) {
      console.log(`Hovering over map at x:${box.x + box.width/2}, y:${box.y + box.height/2}`);
      await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
      
      // Wait 3.5 seconds to trigger our delay
      console.log("Waiting 3.5 seconds for hover transition...");
      await page.waitForTimeout(3500);
      
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
          parentOpacity: parentStyle ? parentStyle.opacity : 'none',
          grandParentOpacity: grandParentStyle ? grandParentStyle.opacity : 'none'
        };
      });
      console.log("Hover text status: ", textStatus);
      await page.screenshot({path: 'hover-screenshot.png'});
      console.log("Saved hover-screenshot.png");
    }
  } else {
    console.log("Could not find map group element");
  }
  
  // Check stats font thickness
  const statsThickness = await page.evaluate(() => {
    const counterSpans = Array.from(document.querySelectorAll('.tabular-nums'));
    if (counterSpans.length === 0) return null;
    const style = window.getComputedStyle(counterSpans[0]);
    return {
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily
    };
  });
  
  console.log("Stats digit styling: ", statsThickness);
  
  await browser.close();
})();
