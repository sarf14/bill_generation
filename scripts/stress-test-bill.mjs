// Stress test: render the REAL bill layout (src/index.css) in headless Chrome
// across thousands of varied bills and measure whether each fits a single A4
// page, and how much vertical compression the full-page-stretch PDF introduces.
//
// Run: node scripts/stress-test-bill.mjs [numRandomCases]
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { numberToWords } from '../src/utils/numberToWords.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const css = readFileSync(resolve(root, 'src/index.css'), 'utf8');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PX_PER_MM = 96 / 25.4; // 3.779527...
const A4_H_MM = 297;
const A4_W_MM = 210;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Faithful reproduction of BillPreview.jsx DOM (same classes/structure).
function renderBillHTML(d) {
  const total = d.items.reduce((acc, it) => {
    const amt = parseFloat(String(it.amount).replace(/,/g, ''));
    return isNaN(amt) ? acc : acc + amt;
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

// ---- case generation ----
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

const DESCS = [
  'L.S.',
  '8 Nos. 5 x 10 mtr. Net',
  '8 Nos 2x10 Mtr\n8 Nos 3x10 Mtr\n2 Nos 5x10 Mtr',
  '8 Nos 2x10 Mtr\n8 Nos 3x10 Mtr\n2 Nos 5x10 Mtr\nInstallation vertical net on 1st floor to 22th floor front side duct area',
  'Supply and installation of safety netting system across the full perimeter of the building including all labour, material, scaffolding, transport and incidental charges as per site requirement and client instructions',
  'Cleaning, Repairing and\nInstallation on 3rd Floor',
  'Net Cleaning\nNet Repairing\nNet Re-installation\nHardware replacement\nAnchor bolt fixing\nTensioning and finishing works on all floors from ground to terrace level',
];
const SITES = [
  'Mumbai',
  'Marine lines parsi dairy - Mumbai',
  'Mariana Height, Antop Hill, Wadala, Mumbai.',
  'Oberoi Sky Heights, Lokhandwala Complex, Andheri West, Mumbai - 400053, Maharashtra, India',
];
const TOS = [
  'ABC Co.',
  'BOMBAY BUILDING COMPANY',
  'Taqwa Estates LLP',
  'The Secretary,\nShree Siddhivinayak Co-operative Housing Society Ltd.\nPlot No. 42, Sector 19, Navi Mumbai',
];
const TITLES = [
  'BILL',
  'BILL FOR MATERIAL AND LABOUR CHARGE',
  'BILL FOR MAINTENANCE AND LABOUR CHARGE',
  'BILL FOR SUPPLY, INSTALLATION AND MAINTENANCE OF SAFETY NET SYSTEM INCLUDING ALL LABOUR AND MATERIAL',
];
const NAMES = ['A. QADIR PAWASKAR', 'M. YUSUF KHAN', 'ABDUL REHMAN SHAIKH CONTRACTOR AND SUPPLIER'];
const QTYS = ['L.S.', '1', '5380 sq ft', '12 Nos', '1250.75'];
const RATES = ['L.S.', '14', '150', '1250', '85.50'];

let SEED = 1234567;
const rnd = () => ((SEED = (SEED * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const ri = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

function makeCase() {
  const n = ri(1, 12);
  const items = [];
  for (let i = 0; i < n; i++) {
    items.push({ description: pick(DESCS), qty: pick(QTYS), rate: pick(RATES), amount: String(ri(500, 250000)) });
  }
  return {
    ...BASE,
    proprietorName: pick(NAMES),
    to: pick(TOS),
    site: pick(SITES),
    billTitle: pick(TITLES),
    items,
    _meta: { items: n },
  };
}

// deterministic edge cases
function edgeCases() {
  const mk = (over) => ({ ...BASE, to: 'BOMBAY BUILDING COMPANY', site: SITES[1], billTitle: TITLES[1], items: [], ...over });
  const longest = { description: DESCS[6], qty: '5380 sq ft', rate: '14', amount: '75320' };
  const one = [{ description: DESCS[0], qty: 'L.S.', rate: 'L.S.', amount: '15000' }];
  return [
    { name: 'single short item', ...mk({ items: one }) },
    { name: 'the BOMBAY bill (1 long item)', ...mk({ items: [{ description: DESCS[3], qty: '5380 sq ft', rate: '14', amount: '75320' }] }) },
    { name: '4 identical items', ...mk({ items: Array.from({ length: 4 }, () => ({ ...longest })) }) },
    { name: '8 long items', ...mk({ items: Array.from({ length: 8 }, () => ({ ...longest })) }) },
    { name: '12 long items + long everything', ...mk({ proprietorName: NAMES[2], to: TOS[3], site: SITES[3], billTitle: TITLES[3], items: Array.from({ length: 12 }, () => ({ ...longest })) }) },
    { name: '15 max items', ...mk({ items: Array.from({ length: 15 }, () => ({ ...longest })) }) },
  ];
}

async function run() {
  const N = parseInt(process.argv[2] || '2000', 10);
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1400, deviceScaleFactor: 1 });

  async function measure(data) {
    const html = `<!doctype html><html><head><meta charset="utf8"><style>${css}
      body{margin:0;background:#fff} .pdf-scroll-container,.preview-section{all:unset}</style></head>
      <body><div class="pdf-scroll-container">${renderBillHTML(data)}</div></body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    return page.evaluate(() => {
      const el = document.getElementById('sheet');
      const container = el.querySelector('.bill-preview-container');
      const natural = el.scrollHeight; // before fitting
      // --- identical algorithm to App.jsx fitBillToPage ---
      const A4_RATIO = 297 / 210;
      const BASE_FONT = 16;
      container.style.fontSize = BASE_FONT + 'px';
      const target = el.offsetWidth * A4_RATIO;
      let font = BASE_FONT;
      for (let i = 0; i < 10; i++) {
        const h = el.scrollHeight;
        if (h <= target + 0.5) break;
        font = Math.max(5, font * (target / h) * 0.995);
        container.style.fontSize = font + 'px';
      }
      const r = el.getBoundingClientRect();
      return { natural, h: el.scrollHeight, w: r.width, font };
    });
  }

  const results = [];
  // edge cases first (named)
  for (const ec of edgeCases()) {
    const { name, _meta, ...data } = ec;
    const m = await measure(data);
    results.push({ name, items: data.items.length, ...m });
  }
  // random cases
  for (let i = 0; i < N; i++) {
    const c = makeCase();
    const { _meta, ...data } = c;
    const m = await measure(data);
    results.push({ name: null, items: _meta.items, ...m });
  }
  await browser.close();

  // analyze — after auto-fit, every bill should be <=297mm tall at full 210mm
  // width, with NO vertical squish (font is shrunk uniformly instead).
  const toMm = (px) => px / PX_PER_MM;
  let fitOk = 0, widthOk = 0, noSquish = 0;
  const fontBuckets = { '16px (full size)': 0, '13-16px': 0, '10-13px': 0, '7-10px': 0, '5-7px (tiny)': 0 };
  let smallestFont = null;
  const perItemFont = {};
  for (const r of results) {
    r.hmm = toMm(r.h);
    r.wmm = toMm(r.w);
    r.naturalMm = toMm(r.natural);
    if (r.hmm <= A4_H_MM + 1) fitOk++;              // fits one page
    if (Math.abs(r.wmm - A4_W_MM) < 1) widthOk++;   // full width, never narrow
    if (r.hmm <= A4_H_MM + 1 && r.wmm >= A4_W_MM - 1) noSquish++; // aspect preserved
    const f = r.font;
    if (f >= 15.9) fontBuckets['16px (full size)']++;
    else if (f >= 13) fontBuckets['13-16px']++;
    else if (f >= 10) fontBuckets['10-13px']++;
    else if (f >= 7) fontBuckets['7-10px']++;
    else fontBuckets['5-7px (tiny)']++;
    if (!smallestFont || f < smallestFont.font) smallestFont = r;
    if (!perItemFont[r.items] || r.font < perItemFont[r.items]) perItemFont[r.items] = r.font;
  }

  console.log(`\n===== BILL LAYOUT STRESS TEST (with auto-fit) =====`);
  console.log(`cases: ${results.length} (6 edge + ${N} random)`);
  console.log(`fits one A4 page  (height <= 297mm): ${fitOk}/${results.length}`);
  console.log(`full width        (width == 210mm): ${widthOk}/${results.length}`);
  console.log(`no distortion     (fit AND full width): ${noSquish}/${results.length}`);
  console.log(`\nfont-size used (smaller = more content, text stays undistorted):`);
  for (const [k, v] of Object.entries(fontBuckets)) console.log(`  ${k.padEnd(18)} ${v}`);
  console.log(`\nsmallest font by item count (px):`);
  for (const k of Object.keys(perItemFont).sort((a, b) => a - b)) console.log(`  ${String(k).padStart(2)} items -> ${perItemFont[k].toFixed(1)}px`);
  console.log(`\ntoughest case: ${smallestFont.font.toFixed(1)}px font  natural ${smallestFont.naturalMm.toFixed(0)}mm -> fitted ${smallestFont.hmm.toFixed(0)}mm  ${smallestFont.items} items  ${smallestFont.name || '(random)'}`);

  console.log(`\nnamed edge cases:`);
  for (const r of results.filter((x) => x.name)) {
    console.log(`  ${r.name.padEnd(34)} ${r.items} items  font ${r.font.toFixed(1)}px  ${r.hmm.toFixed(0)}mm x ${r.wmm.toFixed(0)}mm  (natural ${r.naturalMm.toFixed(0)}mm)`);
  }

  const pass = fitOk === results.length && widthOk === results.length;
  console.log(`\n=> ${pass ? 'PASS' : 'FAIL'}: every bill fits one page at full width with no distortion.`);
}

run().catch((e) => { console.error(e); process.exit(1); });
