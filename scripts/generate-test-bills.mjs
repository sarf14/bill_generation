// Generate real A4 PDF bills for a spread of test cases using the REAL
// src/index.css and the SAME auto-fit algorithm as the app, so you can open
// them locally and eyeball that every one fits a single page at full width.
//
// Output: ./test_bills/*.pdf   Run: node scripts/generate-test-bills.mjs
import puppeteer from 'puppeteer-core';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { numberToWords } from '../src/utils/numberToWords.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const css = readFileSync(resolve(root, 'src/index.css'), 'utf8');
const outDir = resolve(root, 'test_bills');
mkdirSync(outDir, { recursive: true });

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const BASE = {
  proprietorName: 'A. QADIR PAWASKAR',
  address: 'Mohd Umar Palace, A-Wing, 2nd Floor, R. No. 202, Kismat Colony, Kausa, Mumbra.',
  mobile: '9867426477',
  date: '20/10/2026',
  accountHolder: 'Pawaskar Abdul Qadir A G',
  bankName: 'Kokan Mercantile Co-op. Bank Ltd.',
  accountNo: '750101001016450',
  ifscCode: 'KKBK0KMCB02',
  themeColor: '#FF0000',
};

function renderBillHTML(d) {
  const total = d.items.reduce((a, it) => {
    const amt = parseFloat(String(it.amount).replace(/,/g, ''));
    return isNaN(amt) ? a : a + amt;
  }, 0);
  const words = numberToWords(total);
  const toLines = d.to.split('\n').map((l) => `${esc(l)}<br/>`).join('');
  const rows = d.items.map((it, i) => `
    <tr>
      <td class="col-sr">${i + 1}.</td>
      <td class="col-desc">${it.description.split('\n').map((l) => `<div>${esc(l)}</div>`).join('')}</td>
      <td class="col-qty">${esc(it.qty)}</td>
      <td class="col-rate">${esc(it.rate)}</td>
      <td class="col-amt">${esc(it.amount)}</td>
    </tr>`).join('');
  return `
  <div class="preview-wrapper" id="sheet">
    <div class="bill-preview-container">
      <div class="bill-header">
        <div class="mobile-no">Mobile : ${esc(d.mobile)}</div>
        <h1 class="proprietor-name" style="color:${d.themeColor}">${esc(d.proprietorName)}</h1>
        <div class="address">${esc(d.address)}</div>
      </div>
      <div class="bill-divider"></div>
      <div class="bill-meta">
        <div class="date-row"><span>Date : ${esc(d.date)}</span></div>
        <div class="to-section">To,<br/><span class="client-name">${toLines}</span></div>
      </div>
      <div class="bill-title-section">
        <div class="site-row"><span class="bold">Site : </span><span class="underline bold">${esc(d.site)}</span></div>
        <h2 class="underline bill-title">${esc(d.billTitle)}</h2>
      </div>
      <table class="items-table">
        <thead><tr>
          <th class="col-sr">Sr.<br/>No.</th><th class="col-desc">Description</th>
          <th class="col-qty">Qty.</th><th class="col-rate">Rate</th><th class="col-amt">Amount</th>
        </tr></thead>
        <tbody>${rows}
          <tr class="total-row"><td colspan="4" class="text-right bold">TOTAL</td><td class="col-amt bold">${total.toLocaleString('en-IN')}</td></tr>
        </tbody>
      </table>
      <div class="amount-words">(Rupees ${esc(words)} Only)</div>
      <div class="bill-footer">
        <div class="bank-details">
          <div class="bold">Bank Details :</div>
          <table><tbody>
            <tr><td>Account Holder Name</td><td>: ${esc(d.accountHolder)}</td></tr>
            <tr><td>Bank Name</td><td>: ${esc(d.bankName)}</td></tr>
            <tr><td>Account No.</td><td>: ${esc(d.accountNo)}</td></tr>
            <tr><td>IFSC Code</td><td>: ${esc(d.ifscCode)}</td></tr>
          </tbody></table>
        </div>
        <div class="signature-section">
          <div>Thanking you,</div>
          <div class="signature-block">Yours faithfully,<br/><span class="bold">${esc(d.proprietorName)}</span><br/><br/><br/>(Proprietor)</div>
        </div>
      </div>
    </div>
  </div>`;
}

const longDesc = '8 Nos 2x10 Mtr\n8 Nos 3x10 Mtr\n2 Nos 5x10 Mtr\nInstallation vertical net on 1st floor to 22th floor front side duct area';
const item = (over = {}) => ({ description: longDesc, qty: '5380 sq ft', rate: '14', amount: '75320', ...over });

const CASES = [
  { file: '01_single_short_item', ...BASE, to: 'Taqwa Estates LLP', site: 'Mariana Height, Antop Hill, Wadala, Mumbai.', billTitle: 'BILL FOR MAINTENANCE AND LABOUR CHARGE',
    items: [{ description: '8 Nos. 5 x 10 mtr. Net\nCleaning, Repairing and\nInstallation on 3rd Floor', qty: 'L.S.', rate: 'L.S.', amount: '15000' }] },
  { file: '02_bombay_one_long_item', ...BASE, to: 'BOMBAY BUILDING COMPANY', site: 'Marine lines parsi dairy - Mumbai', billTitle: 'BILL FOR MATERIAL AND LABOUR CHARGE',
    items: [item()] },
  { file: '03_two_items', ...BASE, to: 'Sunrise Builders', site: 'Hill Road, Bandra West, Mumbai.', billTitle: 'BILL FOR MATERIAL AND LABOUR CHARGE',
    items: [item({ amount: '45000' }), item({ description: 'Anti-bird net\n2 Nos 4x6 Mtr', qty: '120 sq ft', rate: '20', amount: '2400' })] },
  { file: '04_four_items', ...BASE, to: 'BOMBAY BUILDING COMPANY', site: 'Marine lines parsi dairy - Mumbai', billTitle: 'BILL FOR MATERIAL AND LABOUR CHARGE',
    items: Array.from({ length: 4 }, (_, i) => item({ amount: String(10000 * (i + 1)) })) },
  { file: '05_eight_items', ...BASE, to: 'Metro Infra Pvt Ltd', site: 'Lower Parel, Mumbai.', billTitle: 'BILL FOR MATERIAL AND LABOUR CHARGE',
    items: Array.from({ length: 8 }, (_, i) => item({ amount: String(8000 + i * 1000) })) },
  { file: '06_twelve_items_long_everything', ...BASE, proprietorName: 'ABDUL REHMAN SHAIKH CONTRACTOR AND SUPPLIER',
    to: 'The Secretary,\nShree Siddhivinayak Co-operative Housing Society Ltd.\nPlot No. 42, Sector 19, Navi Mumbai',
    site: 'Oberoi Sky Heights, Lokhandwala Complex, Andheri West, Mumbai - 400053, Maharashtra, India',
    billTitle: 'BILL FOR SUPPLY, INSTALLATION AND MAINTENANCE OF SAFETY NET SYSTEM INCLUDING ALL LABOUR AND MATERIAL',
    items: Array.from({ length: 12 }, (_, i) => item({ amount: String(5000 + i * 750) })) },
];

async function run() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  for (const c of CASES) {
    const { file, ...data } = c;
    const html = `<!doctype html><html><head><meta charset="utf8"><style>${css}
      @page { size: A4; margin: 0 }
      html,body{margin:0;padding:0;background:#fff}
      .preview-wrapper{box-shadow:none;margin:0;height:297mm;overflow:hidden}
    </style></head><body>${renderBillHTML(data)}</body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    // same auto-fit as the app
    const font = await page.evaluate(() => {
      const el = document.getElementById('sheet');
      const container = el.querySelector('.bill-preview-container');
      const A4_RATIO = 297 / 210, BASE = 16;
      container.style.fontSize = BASE + 'px';
      const target = el.offsetWidth * A4_RATIO;
      let f = BASE;
      for (let i = 0; i < 10; i++) {
        const h = el.scrollHeight;
        if (h <= target + 0.5) break;
        f = Math.max(5, f * (target / h) * 0.995);
        container.style.fontSize = f + 'px';
      }
      return f;
    });
    const outPath = resolve(outDir, `${file}.pdf`);
    await page.pdf({ path: outPath, format: 'A4', printBackground: true, pageRanges: '1' });
    console.log(`  ${file}.pdf   (${data.items.length} items, font ${font.toFixed(1)}px)`);
  }
  await browser.close();
  console.log(`\nDone -> ${outDir}`);
}
run().catch((e) => { console.error(e); process.exit(1); });
