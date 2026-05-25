const puppeteer = require('puppeteer');
const path = require('path');

const files = [
  { html: 'index.html', name: 'astana-valve.pdf', label: 'Astana Valve' },
];

const srcDir = '/Users/daulettemirtas/Documents/myProject/astana-valve-project';
const outDir = '/Users/daulettemirtas/Documents/myProject/astana-valve-project/docs';

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--allow-file-access-from-files',
        '--disable-features=IsolateOrigins',
      ]
    });
    console.log('Browser launched');
  } catch(e) {
    console.error('Launch error:', e.message);
    process.exit(1);
  }

  for (const f of files) {
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      const htmlPath = `file://${srcDir}/${f.html}`;
      console.log(`  Loading ${f.html}...`);

      await page.goto(htmlPath, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 4000));

      const outPath = path.join(outDir, f.name);
      await page.pdf({
        path: outPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });
      await page.close();
      console.log(`✓ ${f.label} → docs/${f.name}`);
    } catch(e) {
      console.error(`✗ Error on ${f.html}:`, e.message);
    }
  }

  await browser.close();
  console.log('\nDone.');
})().catch(e => { console.error('Fatal:', e); process.exit(1); });
