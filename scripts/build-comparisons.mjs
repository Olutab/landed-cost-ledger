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

// Group by Origin + Category + Value Band
const groups = {};
for (const row of matrixData) {
  const catShort = row.hts_category.split(' ')[0] + ' ' + row.hts_category.split(' ')[1]; // e.g., "HTS 8544"
  const key = `${row.origin_name}|${catShort}|${row.value_band}`;
  if (!groups[key]) groups[key] = [];
  groups[key].push(row);
}

let count = 0;
let slugs = [];

for (const [key, rows] of Object.entries(groups)) {
  if (rows.length < 2) continue; // Need at least 2 modes to compare
  
  // Pick the first two distinct modes
  const modes = [...new Set(rows.map(r => r.mode))];
  if (modes.length < 2) continue;
  
  const r1 = rows.find(r => r.mode === modes[0]);
  const r2 = rows.find(r => r.mode === modes[1]);
  
  const [origin, cat, band] = key.split('|');
  const mode1Label = r1.mode.replace('_', ' ').toUpperCase();
  const mode2Label = r2.mode.replace('_', ' ').toUpperCase();
  const slug = `${origin.toLowerCase()}-${r1.mode.toLowerCase()}-vs-${r2.mode.toLowerCase()}-${band}-${cat.toLowerCase().replace(/\s+/g, '-')}`;
  
  slugs.push(slug);
  
  // Generate HTML
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${origin} ${mode1Label} vs ${mode2Label} for ${cat} (${band}) | Landed Cost Ledger</title>
    <meta name="description" content="Side-by-side comparison of ${mode1Label} vs ${mode2Label} for importing ${cat} from ${origin} in the ${band} value band. See differences in MPF, HMF, entry path, and risk." />
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
        <nav class="nav-links"><a href="/">Calculator</a><a href="/scenarios/">Scenarios</a><a href="/method">Method</a></nav>
      </div>
    </header>
    <main>
      <section class="wrap page-content">
        <span class="overline">Comparison</span>
        <h1>${origin}: ${mode1Label} vs ${mode2Label}</h1>
        <p class="lede">Comparing shipping modes for <strong>${cat}</strong> shipments in the <strong>${band}</strong> value band. While the goods and origin are identical, the entry path, fee structure, and risk profile change drastically between these two modes.</p>
        
        <div class="worksheet" style="margin-top: 2rem; grid-template-columns: 1fr 1fr;">
          <div class="worksheet-left" style="border-right: 1px solid var(--line);">
            <h3 class="panel-title">${mode1Label}</h3>
            <div class="line"><span>Entry Path</span><strong>${r1.entry_path}</strong></div>
            <div class="line"><span>Fee Profile</span><strong>${r1.fee_profile}</strong></div>
            <div class="line"><span>Section 301</span><strong>${r1.section_301_exposure}</strong></div>
            <div class="line"><span>Risk Tier</span><strong>${r1.risk_tier}</strong></div>
            <div class="line"><span>Audit Status</span><strong>${r1.auditing_status}</strong></div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--ink-soft);">${r1.summary_fact}</p>
          </div>
          <div class="worksheet-right">
            <h3 class="panel-title">${mode2Label}</h3>
            <div class="line"><span>Entry Path</span><strong>${r2.entry_path}</strong></div>
            <div class="line"><span>Fee Profile</span><strong>${r2.fee_profile}</strong></div>
            <div class="line"><span>Section 301</span><strong>${r2.section_301_exposure}</strong></div>
            <div class="line"><span>Risk Tier</span><strong>${r2.risk_tier}</strong></div>
            <div class="line"><span>Audit Status</span><strong>${r2.auditing_status}</strong></div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--ink-soft);">${r2.summary_fact}</p>
          </div>
        </div>

        <div style="margin-top: 3rem; text-align: center;">
          <a href="/" style="display: inline-block; background: var(--accent); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Calculate Exact Costs</a>
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

console.log(`\n⚔️  Generated ${count} comparison pages in public/comparisons/`);
// Save slugs for the sitemap generator to read later
writeFileSync(join(__dirname, '../public/comparisons-slugs.json'), JSON.stringify(slugs));