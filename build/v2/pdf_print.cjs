// Prints Forecut report HTML to PDF. Usage: node pdf_print.cjs jobs.json   (jobs: [[html, pdf], ...])
const { chromium } = require('playwright');
const jobs = require(process.argv[2]);
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  for (const [h, o] of jobs) { await p.goto('file://' + h, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: o, width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true }); }
  await b.close(); })();
