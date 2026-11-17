import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const original18 = ['success-french','postal-compact','postal-lower','unresolved','geocode-blocked','geocode-http','geocode-hang','insert-blocked','insert-500','insert-409','insert-429','insert-html','insert-hang','website-bare','long-description','no-products','comma-products','rapid-double'];
const extra = ['website-facebook','name-101','address-201','product-51','products-21','products-20','limits-at-boundary','city-short','province-short','website-invalid','website-201','schema-400','spam-400','insert-empty','insert-malformed','success-empty','success-malformed','geocode-body-hang','insert-body-hang','fallback-duplicate','fallback-name-address-duplicate','verified-proximity-duplicate','autocomplete','autocomplete-edited','honeypot-autofill-safe','honeypot-bot','server-insert-failure','prepare-error','legacy-honeypot-autofill','repeat-validation-error'];
const scenarios = process.env.SCENARIOS?.split(',') || [...original18, ...extra];
const results = [];
fs.mkdirSync('work/add-store', { recursive: true });
const browser = await chromium.launch({ executablePath:'/usr/bin/chromium', headless:true, args:['--no-sandbox'] });
const name = "TEST Épicerie d'Orléans";
const address = "123 rue d'Orléans, Québec, QC G1R 4P5";
const fallback = { name:'TEST Different Store',address:'999 Other Street, Calgary',latitude:'56.1304000',longitude:'-106.3468000' };
const clientErrors = { 'long-description':'Description must be at most 1000', 'no-products':'at least one product', 'comma-products':'at least one product', 'name-101':'at most 100', 'address-201':'at most 200', 'product-51':'at most 50', 'products-21':'no more than 20', 'city-short':'at least 2 characters', 'province-short':'at least 2 characters', 'website-invalid':'valid website', 'website-201':'at most 200', 'repeat-validation-error':'at least one product' };
const errorCases = new Set([...Object.keys(clientErrors),'insert-blocked','insert-500','insert-409','insert-429','insert-html','insert-hang','schema-400','spam-400','insert-empty','insert-malformed','success-empty','success-malformed','insert-body-hang','fallback-name-address-duplicate','verified-proximity-duplicate','server-insert-failure','prepare-error']);
try {
 for (const [index, scenario] of scenarios.entries()) {
  const started = Date.now();
  const context = await browser.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
  const page = await context.newPage();
  const posts = [], geocodes = [], errors = [];
  let forwarded = 0;
  let botPayload = null;
  let fixture = [];
  if (scenario === 'fallback-duplicate') fixture = [fallback];
  if (scenario === 'fallback-name-address-duplicate') fixture = [{...fallback,name,address}];
  if (scenario === 'verified-proximity-duplicate') fixture = [{...fallback,latitude:'46.813',longitude:'-71.208'}];
  await fetch('http://127.0.0.1:3000/test/reset', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fixture, failInsert:scenario==='server-insert-failure'})});
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(({scenario}) => {
    // Inject a deterministic Places SDK only for autocomplete-specific cases.
    if (['autocomplete','autocomplete-edited','city-short','province-short'].includes(scenario)) {
      class Autocomplete {
        constructor() { window.testAutocomplete = this; }
        addListener(_event, callback) { this.callback = callback; return {remove(){}}; }
        getPlace() { return {
          formatted_address: "123 rue d'Orléans, Québec, QC G1R 4P5",
          geometry: {location: {lat:()=>46.813,lng:()=>-71.208}},
          address_components: [
            {types:['locality'],long_name:scenario==='city-short'?'Q':'Québec'},
            {types:['administrative_area_level_1'],short_name:scenario==='province-short'?'Q':'QC'},
          ],
        }; }
      }
      window.google = { maps: { importLibrary: async name => name==='places'?{Autocomplete}:{} } };
    }
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const url = String(args[0]);

      const response = await originalFetch(...args);
      if ((scenario==='geocode-body-hang' && url.startsWith('https://photon.komoot.io')) || (scenario==='insert-body-hang' && url==='/api/locations' && args[1]?.method==='POST')) {
        return new Response(new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('{'));}}), {status:response.status,headers:response.headers});
      }
      return response;
    };
  }, {scenario});
  await page.route('**/*', async route => {
    const req=route.request(), url=req.url();
    if (url.startsWith('https://photon.komoot.io/')) {
      geocodes.push(url);
      if (scenario==='geocode-hang') return;
      if (scenario==='geocode-blocked') return route.abort('failed');
      const unresolved = ['unresolved','fallback-duplicate','fallback-name-address-duplicate'].includes(scenario);
      return route.fulfill({status:scenario==='geocode-http'?503:200,contentType:'application/json',body:JSON.stringify({features:unresolved?[]:[{geometry:{coordinates:[-71.208,46.813]},properties:{city:'Québec',state:'Québec'}}]})});
    }
    if (url.includes('/api/locations') && req.method()==='POST') {
      let body=req.postDataJSON(); posts.push(body);
      if (scenario==='insert-hang') return;
      if (scenario==='insert-blocked') return route.abort('failed');
      if (['insert-500','insert-409','insert-429','insert-html','insert-empty','insert-malformed','success-empty','success-malformed'].includes(scenario)) {
        const status = scenario==='insert-html'?502:scenario.startsWith('success-')?201:scenario==='insert-empty'?400:scenario==='insert-malformed'?503:Number(scenario.split('-')[1]);
        const responseBody = scenario.endsWith('empty')?'':scenario.endsWith('malformed')?'{broken':scenario==='insert-html'?'<h1>Bad Gateway</h1>':JSON.stringify({error:'TEST rejection '+status});
        return route.fulfill({status,contentType:scenario==='insert-html'?'text/html':'application/json',body:responseBody});
      }
      if (scenario==='schema-400') body={...body,name:'X'};
      if (scenario==='legacy-honeypot-autofill') body={...body,company_fax_hp:'TEST browser autofill'};
      if (scenario==='honeypot-bot') { body={...body,x_k9m2:'TEST bot'}; botPayload=body; }
      forwarded++;
      const response=await fetch('http://127.0.0.1:3000/api/locations',{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':`192.0.${Number(process.env.TEST_RUN || 1)}.${index+1}`},body:JSON.stringify(body)});
      return route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});
    }
    if (url.includes('/api/')) return route.fulfill({contentType:'application/json',body:'[]'});
    if (!url.startsWith('http://127.0.0.1:5173')) return route.abort();
    return route.continue();
  });
  try {
    await page.goto('http://127.0.0.1:5173');
    await page.waitForTimeout(300);
    await page.evaluate(()=>window.dispatchEvent(new CustomEvent('openAddStoreModal')));
    const form=page.locator('form').filter({has:page.getByPlaceholder('European Deli')});
    await form.getByPlaceholder('European Deli').fill(scenario==='name-101'?'TEST '+ 'Store '.repeat(16):name);
    // Exactly 101 characters, without the spam detector's repetition pattern.
    if (scenario==='name-101') await form.getByPlaceholder('European Deli').fill('TEST '+ 'abcde '.repeat(15)+'abcdef');
    if (scenario==='name-101') assert.equal((await form.getByPlaceholder('European Deli').inputValue()).length,101);
    await form.getByPlaceholder('Search street address').fill(scenario==='address-201'?'TEST '+ 'Street '.repeat(27)+'StreetX':address.replace('G1R 4P5',scenario==='postal-compact'?'G1R4P5':scenario==='postal-lower'?'g1r 4p5':'G1R 4P5'));
    if (scenario==='address-201') assert.equal((await form.getByPlaceholder('Search street address').inputValue()).length,201);
    if (['autocomplete','autocomplete-edited','city-short','province-short'].includes(scenario)) {
      await page.waitForFunction(()=>window.testAutocomplete);
      await page.evaluate(()=>window.testAutocomplete.callback());
      if (scenario==='autocomplete-edited') await form.getByPlaceholder('Search street address').fill('456 TEST New Street, Ottawa, ON');
    }
    if (scenario==='comma-products') await form.getByPlaceholder('List other products, separated by commas').fill(',,,');
    else if (scenario==='product-51') await form.getByPlaceholder('List other products, separated by commas').fill('Ukrainian '.repeat(5)+'X');
    else if (scenario==='products-21'||scenario==='products-20') await form.getByPlaceholder('List other products, separated by commas').fill(Array.from({length:scenario==='products-21'?21:20},(_,i)=>'Product '+i).join(' , '));
    else if (!['no-products','repeat-validation-error'].includes(scenario)) await form.getByRole('button',{name:'Roshen chocolates',exact:true}).click();
    if (scenario==='website-bare') await form.getByPlaceholder('https://example.com').fill('example.com');
    if (scenario==='website-facebook') await form.getByPlaceholder('https://example.com').fill('facebook.com/page');
    if (scenario==='website-invalid') await form.getByPlaceholder('https://example.com').fill('not a website');
    if (scenario==='website-201') await form.getByPlaceholder('https://example.com').fill('https://example.com/'+ 'a'.repeat(182));
    if (scenario==='long-description') await form.locator('textarea').fill('é'.repeat(1001));
    if (scenario==='spam-400') await form.locator('textarea').fill('Buy now, click here for free money');
    if (scenario==='limits-at-boundary') {
      await form.getByPlaceholder('European Deli').fill('TEST '+ 'abcde '.repeat(15)+'abcde'); // 100
      await form.getByPlaceholder('Search street address').fill('TEST '+ 'Street '.repeat(27)+'Street'); // 200
      await form.locator('textarea').fill('Some store details. '.repeat(50).slice(0,999)+'X'); // 1000
      await form.getByPlaceholder('List other products, separated by commas').fill('Ukrainian '.repeat(5).trim()+'X'); // 50
    }
    const hp = form.locator('input[name=x_k9m2]');
    assert.equal(await hp.getAttribute('autocomplete'),'off');
    assert.equal(await hp.getAttribute('type'),'hidden');
    assert.equal(await hp.getAttribute('tabindex'),'-1');
    assert.equal(await hp.getAttribute('aria-hidden'),'true');
    assert.equal(await hp.isVisible(),false);
    // A browser autofill candidate must be a visible, enabled text control.
    if (scenario==='honeypot-autofill-safe') {
      assert.equal(await hp.inputValue(),'');
      const snapshot=await form.ariaSnapshot();
      assert.ok(!snapshot.includes('x_k9m2'));
    }
    if (scenario==='prepare-error') {
      // Trigger a synchronous preparation exception after validation (before mutation).
      await page.evaluate(()=>{window.String = new Proxy(window.String, {apply(target, thisArg, args){if(args[0]===46.813) throw new Error('TEST preparation failed');return Reflect.apply(target,thisArg,args);}});});
    }
    const before=await form.locator('input,textarea').evaluateAll(els=>els.map(el=>({name:el.name,value:el.value})));
    await form.getByRole('button',{name:'Submit store',exact:true}).click();
    if (scenario==='rapid-double') await form.evaluate(el=>el.requestSubmit());
    const terminal=page.getByRole('alert').or(page.getByText('Thanks for helping the map grow',{exact:true}));
    await terminal.first().waitFor({state:'visible',timeout:23000});
    await page.waitForTimeout(150);
    if (scenario==='repeat-validation-error') {
      await form.getByRole('button',{name:'Submit store',exact:true}).click();
      await page.waitForTimeout(150);
    }
    const success=await page.getByText('Thanks for helping the map grow',{exact:true}).isVisible();
    const alert=page.getByRole('alert');
    const message=success?'Thanks for helping the map grow':await alert.innerText();
    assert.equal(success,!errorCases.has(scenario),`${scenario}: ${message}`);
    let unobscured=true, preserved=true;
    if (!success) {
      unobscured=await alert.evaluate(el=>{const b=el.getBoundingClientRect();const hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return b.y>=0&&b.bottom<=innerHeight&&!!hit&&el.contains(hit);});
      assert.ok(unobscured,'Alert must be in viewport and unobscured');
      assert.equal(await alert.evaluate(el=>document.activeElement===el),true,'Focus the accessible error');
      if (scenario==='insert-500') {
        await page.waitForTimeout(6500);
        assert.equal(await alert.isVisible(),true,'Error persists past toast dismissal time');
      }
      assert.equal(await form.getByRole('button',{name:'Submit store',exact:true}).isEnabled(),true);
      const after=await form.locator('input,textarea').evaluateAll(els=>els.map(el=>({name:el.name,value:el.value})));
      preserved=JSON.stringify(before)===JSON.stringify(after);
      assert.ok(preserved,'Keep all entered data');
      if (clientErrors[scenario]) { assert.ok(message.includes(clientErrors[scenario]),message); assert.equal(posts.length,0); }
      if (scenario==='insert-hang'||scenario==='insert-body-hang') assert.match(message,/timed out.*couldn't confirm/i);
      if (scenario==='insert-blocked') assert.match(message,/connection or content blocker/i);
      if (scenario==='schema-400') assert.match(message,/name.*at least 2/i);
      if (scenario==='spam-400') assert.match(message,/flagged as spam/i);
      // The alert persists after focus/scroll changes (no toast auto-dismiss timer).
      await form.getByPlaceholder('European Deli').focus();
      assert.equal(await alert.count(),1);
    }
    if (scenario==='rapid-double') { assert.equal(posts.length,1); assert.equal(geocodes.length,1); }
    if (scenario==='website-bare') assert.equal(posts[0].website,'https://example.com');
    if (scenario==='website-facebook') assert.equal(posts[0].website,'https://facebook.com/page');
    if (scenario==='autocomplete') {assert.equal(geocodes.length,0);assert.equal(posts[0].geocodingStatus,'resolved');}
    if (scenario==='autocomplete-edited') {assert.equal(geocodes.length,1);assert.equal(posts[0].address,'456 TEST New Street, Ottawa, ON');}
    const records=await (await fetch('http://127.0.0.1:3000/test/records')).json();
    const unresolved=['unresolved','geocode-blocked','geocode-http','geocode-hang','geocode-body-hang','fallback-duplicate'].includes(scenario);
    if (unresolved) {assert.equal(posts[0].geocodingStatus,'unresolved');assert.equal(records[0].geocodingStatus,'unresolved');assert.equal(records[0].latitude,'56.1304');}
    if (success&&scenario!=='honeypot-bot') {assert.equal(records.length,1);assert.equal(records[0].status,'pending');}
    if ((!success && scenario!=='insert-body-hang')||scenario==='honeypot-bot') assert.equal(records.length,0);
    if (scenario==='insert-body-hang') assert.equal(records.length,1); // response body stalls after a successful local insert
    if (scenario==='honeypot-bot') assert.equal(botPayload.x_k9m2,'TEST bot');
    assert.deepEqual(errors,[],'No uncaught browser errors');
    if (['insert-blocked','long-description','geocode-hang','autocomplete'].includes(scenario)) await page.screenshot({path:`work/add-store/${scenario}.png`});
    const result={scenario,pass:true,feedback:message,unobscured,preserved,posts:posts.length,geocodes:geocodes.length,records:records.length,elapsedMs:Date.now()-started};
    results.push(result);console.log(JSON.stringify(result));
  } catch(error) {
    results.push({scenario,pass:false,error:error.stack,posts:posts.length,geocodes:geocodes.length});
    console.error(scenario,error, JSON.stringify({posts,errors}));
    await page.screenshot({path:`work/add-store/FAILED-${scenario}.png`});
  } finally {await context.close();}
 }
} finally {
 await browser.close();
 fs.writeFileSync('work/add-store/results.json',JSON.stringify(results,null,2));
}
assert.ok(results.every(result=>result.pass),'All browser scenarios must pass');
