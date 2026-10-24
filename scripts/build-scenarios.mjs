import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const matrixPath = join(__dirname, '../data/matrix.txt');
const cssPath = join(__dirname, '../src/index.css');
const outDir = join(__dirname, '../public/scenarios');

const rawMatrix = readFileSync(matrixPath, 'utf8');
const lines = rawMatrix.split(/\r?\n/).filter(l => l.trim() !== '');
const headers = lines[0].split('|').map(h => h.trim());
const css = readFileSync(cssPath, 'utf8');

// Matrix lookup for neighbors
const matrixData = [];
for (let i = 1; i < lines.length; i++) {
  const fields = lines[i].split('|');
  const row = {};
  headers.forEach((h, idx) => row[h] = fields[idx] ? fields[idx].trim() : '');
  matrixData.push(row);
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// --- MATH ENGINE (Mirrors the React Calculator) ---
function calcCosts(value, mode, origin, category) {
  const isInformal = value <= 2500;
  const mpf = isInformal ? 5.0 : Math.max(31.67, Math.min(614.35, value * 0.003464));
  const hmf = mode.includes('ocean') ? value * 0.00125 : 0;
  let dutyRate = 0.05;
  if (origin === 'China' && ['Electronics', 'Furniture', 'Metals', 'Apparel', 'Telecom', 'Auto Parts', 'Footwear', 'Bags', 'Plastics'].includes(category)) dutyRate = 0.25;
  if (origin === 'Mexico') dutyRate = 0.0;
  return { mpf, hmf, duty: value * dutyRate, dutyRate };
}

const money = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// --- PROSE ENGINE ---
function generateProse(row) {
  let prose = '';
  
  // Paragraph 1: Entry Path & Thresholds
  if (row.entry_path === 'de_minimis_candidate') {
    prose += `<p>Because this shipment falls under the $800 threshold via ${row.mode}, it is a candidate for de minimis entry (Section 321). However, under the 2025–2026 indefinite suspension rules for non-postal modes, and strict CBP data requirements, eligibility is not guaranteed. Importers must ensure the HTS classification (${row.hts_category}) is not on any active exclusion list.</p>`;
  } else if (row.entry_path.includes('informal')) {
    prose += `<p>Shipments in the $801 to $2,500 band require informal entry clearance. Your ${row.mode} carrier or a licensed broker will typically file a simplified entry on your behalf. While faster than formal entry, CBP still assesses standard Merchandise Processing Fees (MPF) and collects all applicable duties before release.</p>`;
  } else {
    prose += `<p>Because this shipment exceeds the $2,500 informal threshold, it requires a formal customs entry. This mandates the use of a licensed customs broker and a continuous or single-entry customs bond. The broker will file the CBP Form 7501 (Entry Summary) and is legally responsible for classifying the ${row.hts_category} correctly under the Harmonized Tariff Schedule.</p>`;
  }

  // Paragraph 2: Risk & Section 301
  if (row.risk_tier === 'CRITICAL' || row.section_301_exposure === 'likely') {
    prose += `<p><strong>Tariff Exposure:</strong> This scenario carries a high likelihood of Section 301 punitive tariffs (often an additional 25% ad valorem for Chinese origin goods in this category). These duties are assessed on top of the standard Most Favored Nation (MFN) duty rate. Importers should verify if any active USTR exclusions apply to their specific 10-digit HTS subheading before finalizing the purchase order.</p>`;
  } else if (row.risk_tier === 'HIGH') {
    prose += `<p><strong>Compliance Risk:</strong> This route is flagged as high risk due to the combination of value, mode, and product category. CBP frequently targets these shipments for intensive exams (VACIS or MET) to verify country of origin, forced labor compliance (UFLPA), and accurate valuation. Expect potential delays of 5–14 days at the port of entry and additional exam fees passed through by your broker.</p>`;
  }

  return prose;
}

// --- HTML TEMPLATE ---
const template = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{entity_name}} | Landed Cost Ledger</title>
    <meta name="description" content="{{summary_fact}}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>{{CSS}}</style>
  </head>
  <body>
    <header class="topbar">
      <div class="wrap topbar-inner">
        <a href="/" style="display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: inherit;">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="6" fill="#1D4ED8"/><path d="M6 9h12M6 13h12M6 17h8" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/></svg>
          <span class="brand">Landed Cost Ledger</span>
        </a>
        <nav class="nav-links">
          <a href="/">Calculator</a><a href="/method">Method</a><a href="/about">About</a><a href="/faq">FAQ</a>
        </nav>
        <span class="asof">Data as of 21 Oct 2026</span>
      </div>
    </header>

    <main>
      <section class="wrap page-content">
        <span class="overline">Import Scenario</span>
        <h1>{{entity_name}}</h1>
        <p class="lede">{{summary_fact}}</p>
        
        <h2>Entry Path & Compliance Analysis</h2>
        {{PROSE}}

                <h2>Worked Example: Cost Stack</h2>
        <p>Below is an estimated cost stack for a hypothetical <strong>\${{EXAMPLE_VALUE}}</strong> shipment of {{hts_category}} via {{mode}} from {{origin_name}}.</p>
        <div class="worksheet" style="margin-top: 1.5rem;">
          <div class="worksheet-right" style="grid-column: 1 / -1;">
            <div class="line"><span>Declared Goods Value</span><strong>\${{EXAMPLE_VALUE}}</strong></div>
            <div class="line"><span>Est. Duty & Section 301 ({{DUTY_RATE}}%)</span><strong>\${{EST_DUTY}}</strong></div>
            <div class="line"><span>Merchandise Processing Fee (MPF)</span><strong>\${{EST_MPF}}</strong></div>
            <div class="line"><span>Harbor Maintenance Fee (HMF)</span><strong>\${{EST_HMF}}</strong></div>
            <div class="total"><span>Estimated Landed Cost</span><strong>\${{EST_TOTAL}}</strong></div>
          </div>
        </div>
        <p class="limits" style="margin-top: 1rem;">Note: This example excludes freight, insurance, and broker clearance fees. See <a href="/method">Method & Expert Advice</a> for calculation limits.</p>

        <h2>Compare Similar Scenarios</h2>
        <p>Small changes in value or mode can drastically alter the entry type and fee structure. Compare this route to:</p>
        <ul style="font-size: 1.05rem; line-height: 1.8; color: var(--ink-soft);">
          {{NEIGHBORS}}
        </ul>

        <div style="margin-top: 3rem; text-align: center; padding: 2rem; background: var(--tint); border-radius: 14px;">
          <h3 style="margin-bottom: 0.5rem;">Calculate your exact shipment</h3>
          <p style="color: var(--ink-soft); margin-bottom: 1.5rem;">Use our interactive tool to model different values for this exact route.</p>
          <a href="/" style="display: inline-block; background: var(--accent); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 6px rgba(29,78,216,0.2);">Open the Calculator</a>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="wrap">
        <nav class="footer-nav">
          <a href="/about">About Us</a><a href="/method">Method & Expert Advice</a><a href="/faq">FAQ</a><a href="/privacy">Privacy Policy</a><a href="/contact">Contact</a>
        </nav>
        <p class="footer-small">© 2026 Landed Cost Ledger · Static, client-side tool · No cookies, no tracking, no uploads.</p>
      </div>
    </footer>
  </body>
</html>`;

// 3. Generate pages
let count = 0;
for (const row of matrixData) {
  if (row.auditing_status === 'UNVERIFIED-DRAFT') continue;

  // Compute worked example based on value band
  let exVal = 500;
  if (row.value_band === '801-2500') exVal = 1500;
  if (row.value_band === '2501-10000') exVal = 5000;
  if (row.value_band === '10001-plus') exVal = 25000;
  
  const costs = calcCosts(exVal, row.mode, row.origin_name, row.hts_category.split(' ')[0]); // Extract first word for category matching
  
  // Build Neighbors list
  const neighbors = row.computed_nearest_neighbors ? row.computed_nearest_neighbors.split(',').map(slug => {
    const match = matrixData.find(m => m.slug === slug);
    return match ? `<li><a href="/scenarios/${slug}/">${match.alias}</a></li>` : '';
  }).join('') : '<li>No similar scenarios in current matrix.</li>';

    let html = template
    .replace('{{CSS}}', css)
    .replace('{{PROSE}}', generateProse(row))
    .replace('{{NEIGHBORS}}', neighbors)
    .replaceAll('${{EXAMPLE_VALUE}}', money(exVal))
    .replaceAll('{{DUTY_RATE}}', (costs.dutyRate * 100).toFixed(0))
    .replaceAll('${{EST_DUTY}}', money(costs.duty))
    .replaceAll('${{EST_MPF}}', money(costs.mpf))
    .replaceAll('${{EST_HMF}}', money(costs.hmf))
    .replaceAll('${{EST_TOTAL}}', money(exVal + costs.duty + costs.mpf + costs.hmf));
  for (const [key, val] of Object.entries(row)) {
    html = html.replaceAll(`{{${key}}}`, val);
  }

  const dir = join(outDir, row.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  count++;
}

console.log(`\n✨ Generated ${count} rich scenario pages in public/scenarios/`);
// --- SEO HARDENING: Sitemap & Robots ---
const SITE_URL = 'https://landedship.netlify.app'; 

// 1. Generate robots.txt
const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
writeFileSync(join(__dirname, '../public/robots.txt'), robotsTxt);

// 2. Generate sitemap.xml
const corePages = ['', 'about', 'method', 'faq', 'privacy', 'contact'];
let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

corePages.forEach(page => {
    const loc = page === '' ? SITE_URL : `${SITE_URL}/${page}`;
    sitemapXml += `  <url><loc>${loc}</loc></url>\n`;
});

matrixData.forEach(row => {
    if (row.auditing_status !== 'UNVERIFIED-DRAFT') {
        sitemapXml += `  <url><loc>${SITE_URL}/scenarios/${row.slug}/</loc></url>\n`;
    }
});

sitemapXml += `</urlset>`;
writeFileSync(join(__dirname, '../public/sitemap.xml'), sitemapXml);

console.log(`\n🗺️  Generated robots.txt and sitemap.xml for ${SITE_URL}`);