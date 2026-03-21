import { chromium } from '@playwright/test';
import fs from 'fs';

const pageName = process.argv[2];
const path = process.argv[3];

if (!pageName || !path) {
  console.error("Usage: node screenshot.mjs <name> <path>");
  process.exit(1);
}

async function takeScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  if (!fs.existsSync('.tmp/screenshots-v2')) {
    fs.mkdirSync('.tmp/screenshots-v2', { recursive: true });
  }

  console.log(`Taking screenshot of ${pageName}...`);
  await page.goto(`http://localhost:3000${path}`);
  await page.waitForTimeout(1500); 
  await page.screenshot({ path: `.tmp/screenshots-v2/${pageName}.png`, fullPage: true });

  await browser.close();
  console.log(`Screenshot saved to .tmp/screenshots-v2/${pageName}.png`);
}

takeScreenshot();
