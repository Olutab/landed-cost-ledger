import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const matrixPath = join(__dirname, '../data/matrix.txt');
const cssPath = join(__dirname, '../src/index.css');
const outDir = join(__dirname, '../public/scenarios');

// 1. Read data and CSS
const rawMatrix = readFileSync(matrixPath, 'utf8');
const lines = rawMatrix.split(/\r?\n/).filter(l => l.trim() !== '');
const headers = lines[0].split('|').map(h => h.trim());
const css = readFileSync(cssPath, 'utf8');

// Clean up old generated files to prevent ghosts
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// 2. HTML Template
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
          <a href="/">Calculator</a>
          <a href="/method">Method</a>
          <a href="/about">About</a>
          <a href="/faq">FAQ</a>
        </nav>
        <span class="asof">Data as of 21 Oct 2026</span>
      </div>
    </header>

    <main>
      <section class="wrap page-content">
        <span class="overline">Import Scenario</span>
        <h1>{{entity_name}}</h1>
        <p class="lede">{{summary_fact}}</p>
        
        <div class="worksheet" style="margin-top: 2rem;">
           <div class="worksheet-left">
             <h3 class="panel-title">Scenario Parameters</h3>
             <div class="line"><span>Origin</span><strong>{{origin_name}}</strong></div>
             <div class="line"><span>Mode</span><strong>{{mode}}</strong></div>
             <div class="line"><span>Value Band</span><strong>{{value_band}}</strong></div>
             <div class="line"><span>Category</span><strong>{{hts_category}}</strong></div>
             <div class="line"><span>Fee Profile</span><strong>{{fee_profile}}</strong></div>
           </div>
           <div class="worksheet-right">
             <h3 class="panel-title">Compliance & Audit</h3>
             <div class="line"><span>Entry Path</span><strong>{{entry_path}}</strong></div>
             <div class="line"><span>Section 301</span><strong>{{section_301_exposure}}</strong></div>
             <div class="line"><span>Risk Tier</span><strong>{{risk_tier}}</strong></div>
             <div class="line"><span>Audit Status</span><strong>{{auditing_status}}</strong></div>
             {{SOURCE_LINK}}
           </div>
        </div>

        <div style="margin-top: 3rem; text-align: center; padding: 2rem; background: var(--tint); border-radius: 14px;">
          <h3 style="margin-bottom: 0.5rem;">Calculate exact dollar amounts</h3>
          <p style="color: var(--ink-soft); margin-bottom: 1.5rem;">Use our interactive tool to estimate MPF, HMF, and total landed cost for this exact scenario.</p>
          <a href="/" style="display: inline-block; background: var(--accent); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 6px rgba(29,78,216,0.2);">Open the Calculator</a>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="wrap">
        <nav class="footer-nav">
          <a href="/about">About Us</a>
          <a href="/method">Method & Expert Advice</a>
          <a href="/faq">FAQ</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/contact">Contact</a>
        </nav>
        <p class="footer-small">© 2026 Landed Cost Ledger · Static, client-side tool · No cookies, no tracking, no uploads.</p>
      </div>
    </footer>
  </body>
</html>`;

// 3. Generate pages
let count = 0;
for (let i = 1; i < lines.length; i++) {
  const fields = lines[i].split('|');
  const row = {};
  headers.forEach((h, idx) => row[h] = fields[idx] ? fields[idx].trim() : '');

  // Skip drafts
  if (row.auditing_status === 'UNVERIFIED-DRAFT') continue;

  const sourceLink = row.source_url 
    ? `<p style="margin-top: 1rem; font-size: 0.9rem;"><a href="${row.source_url}" target="_blank" rel="noopener noreferrer">View official source (${row.source_name})</a></p>` 
    : '';

  let html = template
    .replace('{{CSS}}', css)
    .replace('{{SOURCE_LINK}}', sourceLink);
  
  // Replace all data fields
  for (const [key, val] of Object.entries(row)) {
    html = html.replaceAll(`{{${key}}}`, val);
  }

  // Write to public/scenarios/[slug]/index.html
  const dir = join(outDir, row.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  count++;
}

console.log(`\n✨ Generated ${count} scenario pages in public/scenarios/`);