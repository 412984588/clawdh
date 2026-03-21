import { chromium } from 'playwright';
import fs from 'fs';

const pages = [
  { name: 'home', path: '/' },
  { name: 'pricing', path: '/pricing' },
  { name: 'case-studies', path: '/case-studies' },
  { name: 'demo', path: '/demo' },
  { name: 'for-partners', path: '/for-partners' },
  { name: 'how-it-works', path: '/how-it-works' },
  { name: 'pilot-sample', path: '/pilot-sample' },
  { name: 'request-access', path: '/request-access' },
  { name: 'security', path: '/security' }
];

async function takeScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  if (!fs.existsSync('.tmp/screenshots-v2')) {
    fs.mkdirSync('.tmp/screenshots-v2', { recursive: true });
  }

  for (const p of pages) {
    console.log(`Taking screenshot of ${p.name}...`);
    await page.goto(`http://localhost:3000${p.path}`);
    // wait for framer motion animations
    await page.waitForTimeout(1500); 
    await page.screenshot({ path: `.tmp/screenshots-v2/${p.name}.png`, fullPage: true });
  }

  await browser.close();
  console.log('Screenshots complete.');
}

takeScreenshots();
