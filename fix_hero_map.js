const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client/src/components/hero.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the Invisible Event Catcher
content = content.replace(
  /{[\s\S]*?Invisible Event Catcher[\s\S]*?}\s*<div className="absolute inset-0 z-\[60\] bg-transparent" aria-hidden="true" \/>\s*/g,
  ''
);

// 2. Reduce the 3000ms delays to 300ms for TAP TO EXPLORE on both desktop and mobile
content = content.replace(/delay-\[3000ms\]/g, 'delay-300');
content = content.replace(/duration-\[3000ms\]/g, 'duration-500');

// 3. Ensure the mobile map isn't completely pointer-events-none if we want pin hovers
// The mobile wrapper is: <div className="pointer-events-none absolute inset-0 scale-[1.28] translate-x-[6%] translate-y-[-4%]">
// But if it's pointer-events-none, pins won't hover. We'll change it to pointer-events-auto.
content = content.replace(
  /className="pointer-events-none absolute inset-0 scale-\[1.28\]/g,
  'className="pointer-events-auto absolute inset-0 scale-[1.28]'
);

// Desktop wrapper just to be safe
content = content.replace(
  /className="pointer-events-none absolute inset-0 scale-\[1.2\]/g,
  'className="pointer-events-auto absolute inset-0 scale-[1.2]'
);


fs.writeFileSync(file, content, 'utf8');
console.log("Hero map fixed!");
