const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browserPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  let chromePath = null;
  for (const p of browserPaths) {
    if (fs.existsSync(p)) { chromePath = p; break; }
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`BROWSER ERROR: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    console.log(`BROWSER UNCAUGHT EXCEPTION: ${err.message}`);
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });

  // Type login credentials. Let's assume there's a button or input for demo users.
  // Wait, I can just find the demo user button in Login.jsx and click it.
  // In Login.jsx there is a button that calls fillPreset. But we can just type in 'admin@buildtrack.ai' and 'admin123' (assuming it's a valid default).
  // I will just evaluate JS to find the email input.
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    if(inputs.length >= 2) {
      inputs[0].value = 'engineer@apex.com';
      inputs[1].value = 'password123';
      const form = document.querySelector('form');
      if (form) {
         inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
         inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
         const submit = form.querySelector('button[type="submit"]');
         if (submit) submit.click();
      }
    }
  });

  console.log('Waiting for navigation after login...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Navigating to /issues...');
  await page.goto('http://localhost:3000/issues', { waitUntil: 'networkidle0' });

  console.log('Current URL after login:', page.url());
  await page.screenshot({ path: 'post-login-screenshot.png' });

  
  await browser.close();
  console.log('Done.');
})();
