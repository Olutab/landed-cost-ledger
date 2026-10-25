import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const matrixPath = join(__dirname, '../data/matrix.txt');
const cssPath = join(__dirname, '../src/index.css');
const outDir = join(__dirname, '../public/comparisons');

const rawMatrix = readFileSync(matrixPath, 'utf8');
const lines = rawMatrix.split(/\r?\n/).filter(l => l.trim() !== '');
const headers = lines[0].split('|').map(h => h.trim());
const css = readFileSync(cssPath, 'utf8');

const matrixData = [];
for (let i = 1; i < lines.length; i++) {
  const fields = lines[i].split('|');
  const row = {};
  headers.forEach((h, idx) => row[h] = fields[idx] ? fields[idx].trim() : '');
  matrixData.push(row);
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// Group by Origin + Category + Value Band (simpler key)
const groups = {};
for (const row of matrixData) {
  // Extract just the HTS code part (e.g., "HTS 8544" from "HTS 8544 insulated wire")
  const htsMatch = row.hts_category.match(/HTS\s*\d+/);
  const catShort = htsMatch ? htsMatch[0] : row.hts_category.split(' ')[0];
  const key = `${row.origin_name}|${catShort}|${row.value_band}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(row);
}

let count = 0;
let slugs = [];

for (const [key, rows] of Object.entries(groups)) {
  if (rows.length < 2) continue;
  
  // Get unique modes in this group
  const modes = [...new Set(rows.map(r => r.mode))];
  if (modes.length < 2) continue;
  
  // Generate comparisons for each pair of modes
  for (let i = 0; i < modes.length; i++) {
    for (let j = i + 1; j < modes.length; j++) {
      const modeA = modes[i];
      const modeB = modes[j];
      
      const r1 = rows.find(r => r.mode === modeA);
      const r2 = rows.find(r => r.mode === modeB);
      
      const [origin, cat, band] = key.split('|');
      const modeALabel = modeA.replace(/_/g, ' ').toUpperCase();
      const modeBLabel = modeB.replace(/_/g, ' ').toUpperCase();
      const slug = `${origin.toLowerCase()}-${modeA.toLowerCase()}-vs-${modeB.toLowerCase()}-${band}-${cat.toLowerCase().replace(/\s+/g, '-')}`.replace(/[^a-z0-9-]/g, '');
      
      if (slugs.includes(slug)) continue; // Avoid duplicates
      slugs.push(slug);
      
      // Calculate cost difference
      const val = band === '0-800' ? 500 : band === '801-2500' ? 1500 : band === '2501-10000' ? 5000 : 25000;
      const mpf1 = val <= 2500 ? 5 : Math.max(31.67, Math.min(614.35, val * 0.003464));
      const mpf2 = val <= 2500 ? 5 : Math.max(31.67, Math.min(614.35, val * 0.003464));
      const hmf1 = modeA.includes('ocean') ? val * 0.00125 : 0;
      const hmf2 = modeB.includes('ocean') ? val * 0.00125 : 0;
      
      const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${modeALabel} vs ${modeBLabel} for ${cat} from ${origin} (${band}) | Landed Cost Ledger</title>
    <meta name="description" content="Compare ${modeALabel} vs ${modeBLabel} for importing ${cat} from ${origin}. See differences in MPF ($${mpf1.toFixed(2)} vs $${mpf2.toFixed(2)}), HMF, entry path, and Section 301 exposure." />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>${css}</style>
  </head>
  <body>
    <header class="topbar">
      <div class="wrap topbar-inner">
        <a href="/" style="display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: inherit;">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="6" fill="#1D4ED8"/><path d="M6 9h12M6 13h12M6 17h8" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/></svg>
          <span class="brand">Landed Cost Ledger</span>
        </a>
        <nav class="nav-links"><a href="/">Calculator</a><a href="/scenarios/">Scenarios</a><a href="/research">Research</a></nav>
      </div>
    </header>
    <main>
      <section class="wrap page-content">
        <span class="overline">Mode Comparison</span>
        <h1>${origin}: ${modeALabel} vs ${modeBLabel}</h1>
        <p class="lede">Side-by-side analysis of two shipping modes for <strong>${cat}</strong> shipments in the <strong>${band.replace('-', ' to $')}</strong> value band. For a $${val.toLocaleString()} shipment, the fee structures diverge significantly.</p>
        
        <div class="worksheet" style="margin-top: 2rem; grid-template-columns: 1fr 1fr;">
          <div style="border-right: 1px solid var(--line); padding-right: 1.5rem;">
            <h3 style="color: var(--accent);">${modeALabel}</h3>
            <div class="line"><span>Entry Path</span><strong>${r1.entry_path}</strong></div>
            <div class="line"><span>MPF (est.)</span><strong>$${mpf1.toFixed(2)}</strong></div>
            <div class="line"><span>HMF</span><strong>${hmf1 > 0 ? '$' + hmf1.toFixed(2) : 'N/A'}</strong></div>
            <div class="line"><span>Section 301</span><strong>${r1.section_301_exposure}</strong></div>
            <div class="line"><span>Risk Tier</span><strong>${r1.risk_tier}</strong></div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--ink-soft);">${r1.summary_fact}</p>
            <a href="/scenarios/${r1.slug}/" style="display: inline-block; margin-top: 1rem; color: var(--accent); font-weight: 600;">View full scenario →</a>
          </div>
          <div>
            <h3 style="color: var(--accent);">${modeBLabel}</h3>
            <div class="line"><span>Entry Path</span><strong>${r2.entry_path}</strong></div>
            <div class="line"><span>MPF (est.)</span><strong>$${mpf2.toFixed(2)}</strong></div>
            <div class="line"><span>HMF</span><strong>${hmf2 > 0 ? '$' + hmf2.toFixed(2) : 'N/A'}</strong></div>
            <div class="line"><span>Section 301</span><strong>${r2.section_301_exposure}</strong></div>
            <div class="line"><span>Risk Tier</span><strong>${r2.risk_tier}</strong></div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--ink-soft);">${r2.summary_fact}</p>
            <a href="/scenarios/${r2.slug}/" style="display: inline-block; margin-top: 1rem; color: var(--accent); font-weight: 600;">View full scenario →</a>
          </div>
        </div>

        <div style="margin-top: 2rem; padding: 1.5rem; background: var(--tint); border-radius: 14px; border-left: 4px solid var(--accent);">
          <h3 style="margin-top: 0;">Key Difference</h3>
          <p style="margin-bottom: 0;">
            ${modeA.includes('ocean') && !modeB.includes('ocean') 
              ? `${modeALabel} incurs HMF (0.125% = $${hmf1.toFixed(2)}) while ${modeBLabel} does not. However, ${modeBLabel} may have higher base freight costs and different entry requirements.`
              : modeB.includes('ocean') && !modeA.includes('ocean')
              ? `${modeBLabel} incurs HMF (0.125% = $${hmf2.toFixed(2)}) while ${modeALabel} does not. However, ${modeALabel} may have higher base freight costs and different entry requirements.`
              : `Both modes have different fee profiles: ${r1.fee_profile} vs ${r2.fee_profile}. The entry path difference (${r1.entry_path} vs ${r2.entry_path}) is the primary compliance consideration.`
            }
          </p>
        </div>

        <div style="margin-top: 2rem; text-align: center;">
          <a href="/" style="display: inline-block; background: var(--accent); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Calculate Your Exact Shipment</a>
        </div>
      </section>
    </main>
    <footer class="footer"><div class="wrap"><p class="footer-small">© 2026 Landed Cost Ledger</p></div></footer>
  </body>
</html>`;

      const dir = join(outDir, slug);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'index.html'), html);
      count++;
    }
  }
}

console.log(`\n⚔️  Generated ${count} comparison pages in public/comparisons/`);
writeFileSync(join(__dirname, '../public/comparisons-slugs.json'), JSON.stringify(slugs));