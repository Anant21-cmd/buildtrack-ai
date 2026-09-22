const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const targetUrl = process.argv[2] || 'http://localhost:3000';
  console.log('Launching browser...');
  const browserPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
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
    console.log(`BROWSER CONSOLE: ${msg.type()} ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`BROWSER ERROR: ${err.message}`);
  });
  
  page.on('requestfailed', request => {
    console.log(`BROWSER HTTP ERROR: ${request.response()?.status() || 'unknown'} ${request.url()}`);
  });

  console.log(`Navigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('Navigation timeout or error:', e.message));
  
  await page.screenshot({ path: 'screenshot.png' });
  console.log('Screenshot saved to screenshot.png');
  
  await browser.close();
  console.log('Done.');
})();
