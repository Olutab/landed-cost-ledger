// scripts/validate.mjs
// Reads data/matrix.txt and checks every row for mistakes.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const matrixPath = resolve(__dirname, '../data/matrix.txt');

// The 22 columns, in exact order.
const EXPECTED_COLUMNS = [
  'id','slug','entity_name','alias','category','summary_fact','source_url',
  'source_name','last_checked','auditing_status','image_query','origin_name',
  'mode','value_band','hts_category','section_301_exposure','entry_path',
  'risk_tier','fee_profile','computed_entry_bucket','computed_nearest_neighbors',
  'computed_page_variant'
];

// Allowed values for each controlled field.
const ENUMS = {
  category: ['SCENARIO','MODE_HUB','ORIGIN_HUB','HTS_HUB','COMPARISON','GLOSSARY','TOOL_LANDING','BEST_FOR'],
  mode: ['postal','courier','air','ocean_lcl','ocean_fcl'],
  value_band: ['0-800','801-2500','2501-10000','10001-plus'],
  section_301_exposure: ['none','possible','likely','unknown','excluded'],
  entry_path: ['de_minimis_candidate','postal_informal_candidate','informal_entry_candidate','formal_entry_likely','needs_review'],
  risk_tier: ['LOW','MODERATE','HIGH','CRITICAL'],
  fee_profile: ['MAIL','EXPRESS','AIR','OCEAN_LCL','OCEAN_FCL','FORMAL_MIX'],
  auditing_status: ['SOURCED','HUMAN-CHECKED','ESTIMATED','UNVERIFIED-DRAFT'],
  computed_page_variant: ['variant-entry-check','variant-cost-breakdown','variant-mode-decision','variant-warning-review']
};

// Fields that must never be empty.
const REQUIRED = [
  'id','slug','entity_name','category','summary_fact','auditing_status',
  'image_query','origin_name','mode','value_band','hts_category','risk_tier'
];

const raw = readFileSync(matrixPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');

const errors = [];

if (lines.length === 0) {
  errors.push('matrix.txt is empty.');
} else {

  // --- Check the header row ---
  const header = lines[0].split('|');
  if (header.length !== EXPECTED_COLUMNS.length) {
    errors.push(`Header has ${header.length} columns, expected ${EXPECTED_COLUMNS.length}.`);
  }
  header.forEach((col, i) => {
    if (col.trim() !== EXPECTED_COLUMNS[i]) {
      errors.push(`Header column ${i + 1} is "${col.trim()}", expected "${EXPECTED_COLUMNS[i]}".`);
    }
  });

  const seenIds = new Set();
  const seenSlugs = new Set();

  // --- Check every data row ---
  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1;
    const fields = lines[i].split('|');
    const rowId = (fields[0] || '').trim() || `(row ${rowNum})`;

    if (fields.length !== EXPECTED_COLUMNS.length) {
      errors.push(`Row ${rowNum} (${rowId}): has ${fields.length} columns, expected ${EXPECTED_COLUMNS.length}.`);
      continue;
    }

    const row = {};
    EXPECTED_COLUMNS.forEach((col, idx) => { row[col] = fields[idx].trim(); });

    // Duplicates
    if (seenIds.has(row.id)) errors.push(`Row ${rowNum}: duplicate id "${row.id}".`);
    seenIds.add(row.id);
    if (seenSlugs.has(row.slug)) errors.push(`Row ${rowNum}: duplicate slug "${row.slug}".`);
    seenSlugs.add(row.slug);

    // Required fields
    REQUIRED.forEach(f => {
      if (!row[f]) errors.push(`Row ${rowNum} (${row.id}): required field "${f}" is empty.`);
    });

    // Enum values
    Object.entries(ENUMS).forEach(([field, allowed]) => {
      if (row[field] && !allowed.includes(row[field])) {
        errors.push(`Row ${rowNum} (${row.id}): "${field}" = "${row[field]}" is not an allowed value.`);
      }
    });

    // Slug format
    if (row.slug && !/^[a-z0-9-]+$/.test(row.slug)) {
      errors.push(`Row ${rowNum} (${row.id}): slug "${row.slug}" must be lowercase letters, numbers and hyphens only.`);
    }

    // --- HONESTY GATE (Rule 0) ---
    // If a row claims to be SOURCED or HUMAN-CHECKED, it MUST have a real source.
    if (row.auditing_status === 'SOURCED' || row.auditing_status === 'HUMAN-CHECKED') {
      if (!row.source_url)  errors.push(`Row ${rowNum} (${row.id}): status is ${row.auditing_status} but source_url is empty.`);
      if (!row.source_name) errors.push(`Row ${rowNum} (${row.id}): status is ${row.auditing_status} but source_name is empty.`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.last_checked)) {
        errors.push(`Row ${rowNum} (${row.id}): last_checked must be YYYY-MM-DD, got "${row.last_checked}".`);
      }
    }

    // If a row is ESTIMATED, the summary must say so.
    if (row.auditing_status === 'ESTIMATED' && !/estimate/i.test(row.summary_fact)) {
      errors.push(`Row ${rowNum} (${row.id}): status is ESTIMATED but summary_fact does not explain the estimate.`);
    }
  }
}

// --- Print the report ---
console.log('');
console.log('=== MATRIX VALIDATION REPORT ===');
console.log(`Rows checked : ${Math.max(0, lines.length - 1)}`);
console.log(`Errors found : ${errors.length}`);
console.log('');

if (errors.length) {
  console.log('PROBLEMS:');
  errors.forEach(e => console.log('  x  ' + e));
  console.log('');
  console.log('Fix the rows above, then run the validator again.');
  process.exit(1);
} else {
  console.log('PASS  -  all rows are valid. Ready to build.');
  console.log('');
  process.exit(0);
}