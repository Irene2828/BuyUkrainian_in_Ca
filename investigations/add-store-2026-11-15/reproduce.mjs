import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const results=[];
for(const scenario of ['success-french','postal-compact','postal-lower','unresolved','geocode-blocked','geocode-http','geocode-hang','insert-blocked','insert-500','insert-409','insert-429','insert-html','insert-hang','website-bare','long-description','no-products','comma-products','rapid-double']) {
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage(); let posts=[],geocodes=[];let errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const req=route.request(),url=req.url();
  if(url.startsWith('https://photon.komoot.io/')) {geocodes.push(url);if(scenario==='geocode-hang')return; if(scenario==='geocode-blocked')return route.abort('failed');return route.fulfill({status:scenario==='geocode-http'?503:200,contentType:'application/json',body:JSON.stringify({features:scenario==='unresolved'?[]:[{geometry:{coordinates:[-71.208,46.813]},properties:{city:'Québec',state:'Québec'}}]})});}
  if(url.includes('/api/locations')&&req.method()==='POST') {const body=req.postDataJSON();posts.push(body);if(scenario==='insert-hang')return;if(scenario==='insert-blocked')return route.abort('failed');if(!scenario.startsWith('insert-')) { const res=await fetch('http://127.0.0.1:3000/api/locations',{method:'POST',headers:{'Content-Type':'application/json','X-Forwarded-For':'192.0.2.'+(results.length+1)},body:JSON.stringify(body)}); return route.fulfill({status:res.status,contentType:'application/json',body:await res.text()}); } let status=201,error='';if(scenario.startsWith('insert-')&&/\d/.test(scenario)){status=Number(scenario.split('-')[1]);error='TEST server rejection '+status;}return route.fulfill({status:scenario==='insert-html'?502:status,contentType:scenario==='insert-html'?'text/html':'application/json',body:scenario==='insert-html'?'<h1>Bad Gateway</h1>':JSON.stringify(error?{error}:{...body,id:'TEST-local-only',status:'pending'})});}
  if(url.includes('/api/'))return route.fulfill({contentType:'application/json',body:'[]'});
  if(!url.startsWith('http://127.0.0.1:5173'))return route.abort();
  return route.continue();
 });
 await page.goto('http://127.0.0.1:5173');
 await page.waitForTimeout(300); await page.evaluate(()=>window.dispatchEvent(new CustomEvent('openAddStoreModal')));
 const form=page.locator('form').filter({has:page.getByPlaceholder('European Deli')});
 await form.getByPlaceholder('European Deli').fill("TEST Épicerie d'Orléans");
 await form.getByPlaceholder('Search street address').fill("123 rue d'Orléans, Québec, QC "+(scenario==='postal-compact'?'G1R4P5':scenario==='postal-lower'?'g1r 4p5':'G1R 4P5'));
 if(scenario==='comma-products')await form.getByPlaceholder('List other products, separated by commas').fill(',,,');
 else if(scenario!=='no-products')await form.getByRole('button',{name:'Roshen chocolates',exact:true}).click();
 if(scenario==='website-bare')await form.getByPlaceholder('https://example.com').fill('example.com');
 if(scenario==='long-description')await form.locator('textarea').fill('é'.repeat(1001));
 const submit=form.getByRole('button',{name:'Submit store',exact:true});
 await submit.click();if(scenario==='rapid-double')await page.evaluate(()=>{const f=document.querySelector('form');f.requestSubmit();});
 await page.waitForTimeout(scenario.endsWith('hang')?3000:700);
 const toast=page.locator('[data-radix-toast-viewport]');
 const info=await page.evaluate(()=>{const vp=document.querySelector('ol[tabindex="-1"]');const toast=vp?.querySelector('li');const b=toast?.getBoundingClientRect();const hit=b?document.elementFromPoint(Math.min(innerWidth-1,b.x+b.width/2),Math.min(innerHeight-1,b.y+b.height/2)):null;return {toastText:toast?.textContent,toastZ:vp?getComputedStyle(vp).zIndex:null,toastPointerEvents:vp?getComputedStyle(vp).pointerEvents:null,toastRect:b?{x:b.x,y:b.y,width:b.width,height:b.height}:null,hit:hit?.outerHTML.slice(0,200),toastOnTop:!!toast&&!!hit&&toast.contains(hit),spinner:!!document.querySelector('button[type=submit] .animate-spin'),disabled:document.querySelector('button[type=submit]')?.disabled,submitText:document.querySelector('button[type=submit]')?.textContent};});
 results.push({scenario,geocodes:geocodes.length,posts:posts.length,payload:posts[0],success:await page.getByText('Thanks for helping the map grow',{exact:true}).count(),...info,errors});
 if(['website-bare','insert-blocked','geocode-hang'].includes(scenario))await page.screenshot({path:'work/'+scenario+'.png'});
 await context.close();
}
await browser.close();fs.writeFileSync('work/results.json',JSON.stringify(results,null,2));
console.log(results.map(({scenario,geocodes,posts,success,toastText,toastOnTop,spinner,disabled})=>({scenario,geocodes,posts,success,toastText,toastOnTop,spinner,disabled})));
