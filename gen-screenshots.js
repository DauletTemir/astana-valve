const puppeteer = require('puppeteer');
const path = require('path');

const files = [
  { html: 'index.html', name: 'preview-full.png', label: 'Astana Valve' },
];

const srcDir = '/Users/daulettemirtas/Documents/myProject/astana-valve-project';
const outDir = '/Users/daulettemirtas/Documents/myProject/astana-valve-project/docs';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--disable-web-security', '--allow-file-access-from-files',
    ]
  });

  for (const f of files) {
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
      console.log(`  Loading ${f.html}...`);
      await page.goto(`file://${srcDir}/${f.html}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 3500));
      const outPath = path.join(outDir, f.name);
      await page.screenshot({ path: outPath, fullPage: true });
      await page.close();
      const size = require('fs').statSync(outPath).size;
      console.log(`✓ ${f.label} → ${f.name} (${(size/1024).toFixed(0)}KB)`);
    } catch(e) {
      console.error(`✗ ${f.html}: ${e.message}`);
    }
  }
  await browser.close();
  console.log('Done.');
})().catch(e => console.error('Fatal:', e.message));
