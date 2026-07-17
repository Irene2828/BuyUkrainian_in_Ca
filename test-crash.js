import puppeteer from 'puppeteer';

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
  });
  
  await page.waitForTimeout(1000);
  
  // Try to grab the error message from the UI
  const errorMsg = await page.evaluate(() => {
    const errEl = document.querySelector('.text-red-500');
    return errEl ? errEl.textContent : null;
  });
  
  console.log('UI ERROR MESSAGE:', errorMsg);
  
  await browser.close();
})();
