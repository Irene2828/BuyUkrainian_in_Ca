const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  await page.goto('http://localhost:3001/map', { waitUntil: 'networkidle2' });
  
  console.log('Page loaded. Clicking a pin...');
  
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => {
    const listItems = document.querySelectorAll('.cursor-pointer');
    let clicked = false;
    listItems.forEach(el => {
      if (el.textContent.includes('See on Map') && !clicked) {
        el.click();
        clicked = true;
      }
    });
    // Alternative if that fails: click the map center
    if (!clicked) {
        const map = document.querySelector('.passport-map-container');
        if (map) {
            const rect = map.getBoundingClientRect();
            const clickEvent = new MouseEvent('click', {
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2,
                bubbles: true,
                cancelable: true
            });
            map.dispatchEvent(clickEvent);
        }
    }
  });
  
  await page.waitForTimeout(1000);
  
  await browser.close();
})();
