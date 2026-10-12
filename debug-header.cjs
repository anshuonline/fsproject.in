const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DIST = 'F:\\APPS\\freesong.in\\dist';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
  try {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  } catch (e) { res.writeHead(404); res.end(); }
});

(async () => {
  await new Promise((r) => server.listen(4176, r));
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 900 });
  await page.goto('http://localhost:4176/', { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 14000));

  // Measure the header banner position vs the fixed header
  const pos = await page.evaluate(() => {
    const slot = document.querySelector('[data-slot="header_banner"]');
    if (!slot) return { found: false };
    const rect = slot.getBoundingClientRect();
    const iframes = Array.from(slot.querySelectorAll('iframe')).map(f => ({
      top: Math.round(f.getBoundingClientRect().top),
      h: f.clientHeight, w: f.clientWidth
    }));
    return { found: true, slotTop: Math.round(rect.top), slotH: Math.round(rect.height), iframes };
  });
  console.log('header banner position:', JSON.stringify(pos, null, 2));

  await page.screenshot({ path: 'F:\\APPS\\freesong.in\\debug-header-ad.png', clip: { x: 0, y: 0, width: 1500, height: 400 } });
  console.log('screenshot saved: debug-header-ad.png');

  await browser.close();
  server.close();
  process.exit(0);
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
