const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Navigating to localhost:3000...");
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log("Page loaded. Looking for map container...");
  await page.waitForTimeout(5000);
  
  // Try finding ALL .group elements and dump them
  const groups = await page.$$('.group, .group\\/map-hover');
  console.log(`Found ${groups.length} elements with group classes`);
  
  for (let i=0; i<groups.length; i++) {
    const box = await groups[i].boundingBox();
    if (box && box.width > 100 && box.height > 100) {
      console.log(`Hovering group ${i} at x:${box.x + box.width / 2}, y:${box.y + box.height / 2}`);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(3500);
      
      const textStatus = await page.evaluate(() => {
        const span = Array.from(document.querySelectorAll('span')).find(el => el.textContent && el.textContent.includes('TAP TO EXPLORE'));
        if (!span) return "Text not found";
        
        let container = span;
        while(container && !container.className.includes('absolute inset-0 z-[70]')) {
          container = container.parentElement;
        }
        
        if (!container) return "Container not found";
        return window.getComputedStyle(container).opacity;
      });
      
      console.log(`Opacity after hovering group ${i}: ${textStatus}`);
      if (textStatus === '1') {
          console.log("SUCCESS! Found the right trigger.");
          await page.screenshot({path: 'hover-success2.png'});
      }
    }
  }
  
  await browser.close();
})();
