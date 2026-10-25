import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const matrixPath = join(__dirname, '../data/matrix.txt');
const manifestPath = join(__dirname, '../images.manifest.json');
const imgDir = join(__dirname, '../public/images');

const UA = 'LandedCostLedger-image-fetcher/1.1 (https://landedship.netlify.app; contact: hello@landedcostledger.example)';
const MIN_WIDTH = 1000;
const BAD_TITLE = /(svg|map|logo|diagram)/i;

if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });

const rawMatrix = readFileSync(matrixPath, 'utf8');
const lines = rawMatrix.split(/\r?\n/).filter(l => l.trim() !== '');
const headers = lines[0].split('|').map(h => h.trim());

let manifest = {};
if (existsSync(manifestPath)) manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Licence normalisation: "CC BY-SA 4.0" -> "cc-by-sa-4.0". Allow-list only.
const normLic = (s) => (s || '').toLowerCase().trim().replace(/\s+/g, '-');
function licenseVerdict(lic) {
  const l = normLic(lic);
  if (!l) return { ok: false, reason: 'no license metadata' };
  if (l.startsWith('cc0')) return { ok: true, reason: l };
  if (l.startsWith('public-domain') || l === 'public-domain' || l.startsWith('pd-')) return { ok: true, reason: l };
  if (l === 'cc-by' || l.startsWith('cc-by-')) {
    if (l.includes('-nc')) return { ok: false, reason: l + ' (non-commercial rejected)' };
    if (l.includes('-nd')) return { ok: false, reason: l + ' (no-derivatives rejected)' };
    return { ok: true, reason: l };
  }
  return { ok: false, reason: l + ' (not in allow-list)' };
}

function evaluate(page) {
  const info = page.imageinfo?.[0];
  if (!info) return { ok: false, reason: 'no imageinfo' };
  if (!info.mime || !info.mime.startsWith('image/')) return { ok: false, reason: 'mime ' + info.mime };
  const title = page.title || '';
  if (BAD_TITLE.test(title)) return { ok: false, reason: 'title keyword in: ' + title };
  if (!info.width || info.width < MIN_WIDTH) return { ok: false, reason: 'width ' + info.width + ' < ' + MIN_WIDTH };
  if (info.height && info.height > info.width) return { ok: false, reason: 'portrait ' + info.width + 'x' + info.height };
  const meta = info.extmetadata || {};
    // Deprioritize military/government photos unless no alternative
  const title = page.title || '';
  const isMilitary = /(military|army|navy|air force|marine|soldier|troop|combat|deployment)/i.test(title);
  if (isMilitary && pool.length >= 2) {
    return { ok: false, reason: 'military photo (skipping in favor of commercial)' };
  }
  const lv = licenseVerdict(meta.LicenseShortName?.value || '');
  if (!lv.ok) return { ok: false, reason: 'license: ' + lv.reason };
  return { ok: true, reason: lv.reason, info, meta };
}

async function searchCommons(q) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=20'
    + '&gsrsearch=' + encodeURIComponent(q + ' filetype:bitmap')
    + '&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1600&format=json';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
    if (!res.ok) return { pages: [], status: res.status, error: 'HTTP ' + res.status };
    const data = await res.json();
    const pages = data.query?.pages ? Object.values(data.query.pages) : [];
    pages.sort((a, b) => (a.pageid || 0) - (b.pageid || 0)); // stable pool order
    return { pages, status: res.status, error: null };
  } catch (err) {
    return { pages: [], status: 0, error: err.message }; // network/proxy failure
  }
}

function ladder(query, fallback) {
  const w = query.split(/\s+/).filter(Boolean);
  const steps = [query];
  if (w.length > 4) steps.push(w.slice(0, 4).join(' '));
  if (w.length > 3) steps.push(w.slice(0, 3).join(' '));
  if (w.length > 2) steps.push(w.slice(0, 2).join(' '));
  if (w.length > 3) steps.push(w.slice(-3).join(' '));
  if (w.length > 2) steps.push(w.slice(-2).join(' '));
  if (fallback) steps.push(fallback);
  return [...new Set(steps.map(s => s.trim()).filter(Boolean))];
}

const poolCache = new Map();
let networkFailures = 0;

async function poolFor(query, fallback, poolCap = 4, diagnose = false) {
  if (poolCache.has(query)) return poolCache.get(query);
  const pool = [];
  const seen = new Set();
  for (const step of ladder(query, fallback)) {
    const { pages, status, error } = await searchCommons(step);
    if (diagnose) console.log(`  ladder "${step}" -> HTTP ${status}${error ? ' ERROR: ' + error : ''}, ${pages.length} results`);
    if (error) { networkFailures++; await sleep(400); continue; }
    for (const page of pages) {
      const v = evaluate(page);
      if (diagnose) console.log(`    ${v.ok ? 'ACCEPT' : 'REJECT'} ${page.title} [${v.reason}]`);
      if (v.ok && !seen.has(page.pageid)) {
        seen.add(page.pageid);
        pool.push({
          pageid: page.pageid,
          downloadUrl: v.info.thumburl || v.info.url,
          pageUrl: v.info.descriptionurl || v.info.url,
          artist: (v.meta.Artist?.value || 'Unknown photographer').replace(/<[^>]*>/g, '').trim(),
          license: normLic(v.meta.LicenseShortName?.value),
          licenseUrl: (v.meta.LicenseUrl?.value || '').replace(/<[^>]*>/g, '').trim()
        });
      }
      if (pool.length >= poolCap) break;
    }
    if (pool.length >= poolCap) break;
    await sleep(250);
  }
  poolCache.set(query, pool);
  return pool;
}

function hashSlug(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

// ---- --diagnose mode ----
if (process.argv[2] === '--diagnose') {
  const q = process.argv[3] || '';
  console.log(`DIAGNOSE "${q}"`);
  await poolFor(q, undefined, 4, true);
  console.log(`Pool size: ${poolCache.get(q).length}`);
  console.log(`Network failures during diagnose: ${networkFailures}`);
  process.exit(0);
}

// ---- normal run ----
const indexable = [];
for (let i = 1; i < lines.length; i++) {
  const fields = lines[i].split('|');
  const row = {};
  headers.forEach((h, idx) => row[h] = fields[idx] ? fields[idx].trim() : '');
  if (row.auditing_status !== 'UNVERIFIED-DRAFT') indexable.push(row);
}

// A URL already used as a hero anywhere (including earlier runs) must not repeat.
const usedUrls = new Set(Object.values(manifest).map(m => m.originalUrl));

// Group pending rows by distinct query: one search per query, unique hand-out.
const pendingByQuery = new Map();
for (const row of indexable) {
  if (manifest[row.slug]) continue;
  if (!pendingByQuery.has(row.image_query)) pendingByQuery.set(row.image_query, []);
  pendingByQuery.get(row.image_query).push(row);
}

const noPhotoQueries = new Set();
const reused = [];

for (const [query, rows] of pendingByQuery) {
  console.log(`\nQUERY "${query}" -> ${rows.length} page(s) need a photo`);
  const pool = await poolFor(query, rows[0].hts_category, Math.min(20, Math.max(4, rows.length)));
  if (pool.length === 0) { noPhotoQueries.add(query); console.log('    [none] no acceptable photo on any ladder step'); continue; }

  const free = pool.filter(p => !usedUrls.has(p.pageUrl));
  const assignable = free.length ? free : pool;
  if (!free.length) reused.push(query);

  // Deterministic unique hand-out: order pages by hash, hand pool out in sequence.
  const ordered = [...rows].sort((a, b) => hashSlug(a.slug) - hashSlug(b.slug));
  for (let i = 0; i < ordered.length; i++) {
    const row = ordered[i];
    const pick = assignable[i % assignable.length];
    console.log(`  [${row.slug}] <- ${pick.license} by ${pick.artist}`);
    try {
      const res = await fetch(pick.downloadUrl, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error('download HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      for (const w of [1280, 800, 480]) {
        await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: w === 480 ? 70 : 80 }).toFile(join(imgDir, `${row.slug}-${w}.webp`));
      }
      const m = await sharp(join(imgDir, `${row.slug}-1280.webp`)).metadata();
      manifest[row.slug] = {
        files: [`${row.slug}-1280.webp`, `${row.slug}-800.webp`, `${row.slug}-480.webp`],
        width: m.width, height: m.height,
        artist: pick.artist, license: pick.license, licenseUrl: pick.licenseUrl,
        source: 'Wikimedia Commons', originalUrl: pick.pageUrl,
        alt: `Documentary photograph for: ${row.entity_name}`
      };
      usedUrls.add(pick.pageUrl);
    } catch (err) {
      networkFailures++;
      console.log(`    [net] download failed: ${err.message}`);
    }
    await sleep(300);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const have = indexable.filter(r => manifest[r.slug]).length;
const total = indexable.length;
const pct = Math.round((have / total) * 100);
console.log(`\n=== IMAGE SUMMARY ===`);
console.log(`Coverage: ${have}/${total} (${pct}%)`);
console.log(`Network/proxy failures: ${networkFailures}`);
if (noPhotoQueries.size) { console.log('Queries that found nothing:'); [...noPhotoQueries].forEach(q => console.log('   - ' + q)); }
if (reused.length) { console.log('Pool exhausted for these queries (hero reuse unavoidable — review):'); reused.forEach(q => console.log('   - ' + q)); }
if (pct < 90) { console.log('Coverage below 90%: exiting non-zero by protocol.'); process.exit(1); }