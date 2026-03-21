import { chromium } from '@playwright/test';

const pages = [
  { url: 'http://localhost:3000/en', name: '01-home-en' },
  { url: 'http://localhost:3000/en/pricing', name: '02-pricing' },
  { url: 'http://localhost:3000/en/case-studies', name: '03-case-studies' },
  { url: 'http://localhost:3000/en/demo', name: '04-demo' },
  { url: 'http://localhost:3000/en/how-it-works', name: '05-how-it-works' },
  { url: 'http://localhost:3000/en/for-partners', name: '06-for-partners' },
  { url: 'http://localhost:3000/zh', name: '07-home-zh' },
];

const results = [];
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  for (const p of pages) {
    consoleErrors.length = 0;
    try {
      const resp = await page.goto(p.url, { waitUntil: 'networkidle', timeout: 20000 });
      const status = resp?.status() ?? 0;
      const h1 = await page.$eval('h1', el => el.textContent?.trim() ?? '').catch(() => 'NO H1');
      await page.screenshot({ path: `.tmp/page-verify/${p.name}.png`, fullPage: false });
      
      results.push({
        name: p.name,
        status,
        h1: h1.substring(0, 80),
        errors: consoleErrors.length,
        ok: status === 200 && h1 !== 'NO H1',
      });
    } catch (err) {
      results.push({
        name: p.name,
        status: 0,
        h1: 'TIMEOUT/ERROR',
        errors: 0,
        ok: false,
        err: err.message.substring(0, 80),
      });
    }
  }
} finally {
  await browser.close();
  console.log('BROWSER CLOSED');
}

console.log(JSON.stringify(results, null, 2));
