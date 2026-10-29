// Mobile reproduction test. Chrome on Android auto-inflates text in wide
// elements ("text autosizing"), which was shrinking the bill to tiny text on
// phones. We launch Chromium with text-autosizing ENABLED and a phone viewport
// to reproduce that, then compare:
//   NOFIX  -> text-size-adjust: auto  (the old bug: inflation -> font shrinks)
//   FIX    -> text-size-adjust: 100%  (current CSS: stable, full-size font)
//
// Run: node scripts/mobile-test-bill.mjs
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { numberToWords } from '../src/utils/numberToWords.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const css = readFileSync(resolve(root, 'src/index.css'), 'utf8');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PX_PER_MM = 96 / 25.4;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const BASE = {
  proprietorName: 'A. QADIR PAWASKAR',
  address: 'Mohd Umar Palace, A-Wing, 2nd Floor, R. No. 202, Kismat Colony, Kausa, Mumbra.',
  mobile: '9867426477', date: '20/10/2026',
  accountHolder: 'Pawaskar Abdul Qadir A G', bankName: 'Kokan Mercantile Co-op. Bank Ltd.',
  accountNo: '750101001016450', ifscCode: 'KKBK0KMCB02', themeColor: '#FF0000',
};
function renderBillHTML(d) {
  const total = d.items.reduce((a, it) => { const amt = parseFloat(String(it.amount).replace(/,/g, '')); return isNaN(amt) ? a : a + amt; }, 0);
  const words = numberToWords(total);
  const toLines = d.to.split('\n').map((l) => `${esc(l)}<br/>`).join('');
  const rows = d.items.map((it, i) => `<tr><td class="col-sr">${i + 1}.</td><td class="col-desc">${it.description.split('\n').map((l) => `<div>${esc(l)}</div>`).join('')}</td><td class="col-qty">${esc(it.qty)}</td><td class="col-rate">${esc(it.rate)}</td><td class="col-amt">${esc(it.amount)}</td></tr>`).join('');
  return `<div class="preview-wrapper" id="sheet"><div class="bill-preview-container">
    <div class="bill-header"><div class="mobile-no">Mobile : ${esc(d.mobile)}</div><h1 class="proprietor-name" style="color:${d.themeColor}">${esc(d.proprietorName)}</h1><div class="address">${esc(d.address)}</div></div>
    <div class="bill-divider"></div>
    <div class="bill-meta"><div class="date-row"><span>Date : ${esc(d.date)}</span></div><div class="to-section">To,<br/><span class="client-name">${toLines}</span></div></div>
    <div class="bill-title-section"><div class="site-row"><span class="bold">Site : </span><span class="underline bold">${esc(d.site)}</span></div><h2 class="underline bill-title">${esc(d.billTitle)}</h2></div>
    <table class="items-table"><thead><tr><th class="col-sr">Sr.<br/>No.</th><th class="col-desc">Description</th><th class="col-qty">Qty.</th><th class="col-rate">Rate</th><th class="col-amt">Amount</th></tr></thead>
    <tbody>${rows}<tr class="total-row"><td colspan="4" class="text-right bold">TOTAL</td><td class="col-amt bold">${total.toLocaleString('en-IN')}</td></tr></tbody></table>
    <div class="amount-words">(Rupees ${esc(words)} Only)</div>
    <div class="bill-footer"><div class="bank-details"><div class="bold">Bank Details :</div><table><tbody>
      <tr><td>Account Holder Name</td><td>: ${esc(d.accountHolder)}</td></tr><tr><td>Bank Name</td><td>: ${esc(d.bankName)}</td></tr>
      <tr><td>Account No.</td><td>: ${esc(d.accountNo)}</td></tr><tr><td>IFSC Code</td><td>: ${esc(d.ifscCode)}</td></tr></tbody></table></div>
    <div class="signature-section"><div>Thanking you,</div><div class="signature-block">Yours faithfully,<br/><span class="bold">${esc(d.proprietorName)}</span><br/><br/><br/>(Proprietor)</div></div></div>
  </div></div>`;
}

const d2 = '8 Nos 5x10 Mtr Net Cleaning\nRepairing and Installation\non 3rd Floor';
const longDesc = '8 Nos 2x10 Mtr\n8 Nos 3x10 Mtr\n2 Nos 5x10 Mtr\nInstallation vertical net on 1st floor to 22th floor front side duct area';
const CASES = [
  { name: 'uncle 2-item short', ...BASE, to: 'BOMBAY BUILDING COMPANY', site: 'Marine lines parsi dairy - Mumbai', billTitle: 'BILL FOR MATERIAL AND LABOUR CHARGE',
    items: [{ description: '3 Nos 5x10 Mtr 3 layer Net Installation on\n6th floor front side area', qty: '1614 sq ft', rate: '20', amount: '32280' },
            { description: '4 Nos 1.5x15 Mtr 2 Layer Braided net\ninstallation on 5th 10th 15th 20th floor', qty: '968 sq ft', rate: '14', amount: '13552' }] },
  { name: '1 short item', ...BASE, to: 'Taqwa Estates LLP', site: 'Wadala, Mumbai.', billTitle: 'BILL FOR MAINTENANCE', items: [{ description: d2, qty: 'L.S.', rate: 'L.S.', amount: '15000' }] },
  { name: '4 items', ...BASE, to: 'BOMBAY BUILDING COMPANY', site: 'Marine lines parsi dairy - Mumbai', billTitle: 'BILL FOR MATERIAL AND LABOUR CHARGE',
    items: Array.from({ length: 4 }, () => ({ description: longDesc, qty: '5380 sq ft', rate: '14', amount: '75320' })) },
];

async function measure(page, data, mode) {
  const tsa = mode === 'FIX' ? '100%' : 'auto';
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf8">
    <style>${css}
    body{margin:0;background:#fff}
    /* force the mode under test, overriding the stylesheet */
    body, .bill-preview-container { -webkit-text-size-adjust:${tsa}; text-size-adjust:${tsa}; }
    </style></head><body><div class="pdf-scroll-container" style="overflow-x:auto">${renderBillHTML(data)}</div></body></html>`;
  await page.setContent(html, { waitUntil: 'load' });
  return page.evaluate(() => {
    const el = document.getElementById('sheet');
    const container = el.querySelector('.bill-preview-container');
    const width = el.offsetWidth;
    const natural = el.scrollHeight;
    // same algorithm + guard as App.jsx
    const A4_RATIO = 297 / 210, BASE_FONT = 16;
    container.style.fontSize = BASE_FONT + 'px';
    let font = BASE_FONT;
    if (width >= 200) {
      const target = width * A4_RATIO;
      for (let i = 0; i < 10; i++) {
        const h = el.scrollHeight;
        if (h <= target + 0.5) break;
        font = Math.max(5, font * (target / h) * 0.995);
        container.style.fontSize = font + 'px';
      }
    }
    return { width, natural, font, fitted: el.scrollHeight };
  });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new',
    args: ['--no-sandbox', '--blink-settings=textAutosizingEnabled=true,textAutosizingWindowSizeOverride=360x780'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 780, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

  const toMm = (px) => (px / PX_PER_MM).toFixed(0);
  console.log(`\n===== MOBILE TEST (phone viewport 360px, text-autosizing ON) =====`);
  console.log(`case                     mode   sheetW   natural(16px)  ->  font    fitted`);
  for (const c of CASES) {
    const { name, ...data } = c;
    for (const mode of ['NOFIX', 'FIX']) {
      const r = await measure(page, data, mode);
      const flag = mode === 'FIX'
        ? (r.font >= 15.5 || data.items.length >= 4 ? 'ok' : 'LOW?')
        : '(old bug)';
      console.log(`${name.padEnd(22)} ${mode.padEnd(6)} ${toMm(r.width)}mm   ${toMm(r.natural).padStart(4)}mm        ->  ${r.font.toFixed(1).padStart(4)}px  ${toMm(r.fitted)}mm  ${flag}`);
    }
  }
  await browser.close();
  console.log(`\nExpected: NOFIX inflates natural height -> font shrinks (tiny text = the bug).`);
  console.log(`          FIX keeps natural height stable -> short bills stay ~16px, full width 210mm.`);
}
run().catch((e) => { console.error(e); process.exit(1); });
