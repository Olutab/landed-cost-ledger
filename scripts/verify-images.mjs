import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');
const manifestPath = join(__dirname, '../images.manifest.json');
const SITE_URL = 'https://landedship.netlify.app';

let manifest = {};
if (existsSync(manifestPath)) manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const fails = [];
const warns = [];
const rel = (p) => relative(distDir, p).replace(/\\/g, '/');

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function toDistPath(url) {
  if (url.startsWith(SITE_URL)) return join(distDir, url.slice(SITE_URL.length).split('?')[0]);
  if (url.startsWith('/')) return join(distDir, url.split('?')[0]);
  return null;
}

function checkRef(htmlFile, url, kind) {
  if (!url || url.startsWith('data:')) return;
  if (url.startsWith('http') && !url.startsWith(SITE_URL)) { warns.push(`${rel(htmlFile)}: external ${kind}: ${url}`); return; }
  const p = toDistPath(url);
  if (!p) { fails.push(`${rel(htmlFile)}: RELATIVE path in ${kind}: ${url}`); return; }
  if (!existsSync(p) || statSync(p).size === 0) fails.push(`${rel(htmlFile)}: missing/empty file for ${kind}: ${url}`);
}

const files = walk(distDir);
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const r = rel(f);

  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
  for (const tag of imgs) {
    const src = /src="([^"]+)"/.exec(tag)?.[1];
    const srcset = /srcset="([^"]+)"/.exec(tag)?.[1];
    if (src) checkRef(f, src, 'img src');
    if (srcset) srcset.split(',').forEach(part => checkRef(f, part.trim().split(/\s+/)[0], 'img srcset'));
    if (!/alt="/.test(tag)) warns.push(`${r}: <img> missing alt (${src})`);
    if (!/width="/.test(tag) || !/height="/.test(tag)) warns.push(`${r}: <img> missing width/height (${src})`);
  }

  for (const m of html.matchAll(/<source\b[^>]*srcset="([^"]+)"/gi)) {
    m[1].split(',').forEach(part => checkRef(f, part.trim().split(/\s+/)[0], 'source srcset'));
  }

  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    if (/property="og:image(?::url)?"/.test(tag) || /name="og:image(?::url)?"/.test(tag)) {
      const content = /content="([^"]+)"/.exec(tag)?.[1];
      if (!content) { fails.push(`${r}: og:image without content`); continue; }
      if (!content.startsWith('http')) { fails.push(`${r}: og:image not absolute: ${content}`); continue; }
      checkRef(f, content, 'og:image');
    }
  }

  for (const m of html.matchAll(/<link\b[^>]*rel="preload"[^>]*>/gi)) {
    const href = /href="([^"]+)"/.exec(m[0])?.[1];
    if (href && /\/images\//.test(href)) checkRef(f, href, 'preload');
  }

  const sm = /^scenarios\/([^/]+)\/index\.html$/.exec(r);
  if (sm) {
    const slug = sm[1];
    if (manifest[slug]) {
      if (imgs.length === 0) fails.push(`${r}: manifest has a photo but the page has no <img> (helper never called?)`);
    } else {
      warns.push(`${r}: no photo in manifest yet (visible fallback expected)`);
    }
  }
}

console.log('');
console.log('=== IMAGE VERIFIER ===');
console.log(`HTML files scanned: ${files.length}`);
console.log(`FAIL: ${fails.length}   WARN: ${warns.length}`);
fails.forEach(x => console.log('  x ' + x));
warns.forEach(x => console.log('  ! ' + x));
if (fails.length) { console.log('BUILD FAILED by image verifier.'); process.exit(1); }
console.log('Image verifier passed.');