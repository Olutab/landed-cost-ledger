// scripts/build-data.mjs
// Reads data/matrix.txt and converts it to public/matrix.json

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const matrixPath = resolve(__dirname, '../data/matrix.txt');
const outputPath = resolve(__dirname, '../public/matrix.json');

console.log('Reading data/matrix.txt...');
const raw = readFileSync(matrixPath, 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');

if (lines.length === 0) {
  console.error('Error: matrix.txt is empty!');
  process.exit(1);
}

// First line is the header
const headers = lines[0].split('|').map(h => h.trim());

// Parse the rest into JSON
const data = [];
for (let i = 1; i < lines.length; i++) {
  const fields = lines[i].split('|');
  const row = {};
  headers.forEach((header, index) => {
    row[header] = fields[index] ? fields[index].trim() : '';
  });
  data.push(row);
}

// Make sure the public folder exists
mkdirSync(resolve(__dirname, '../public'), { recursive: true });

// Write the JSON file
writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`SUCCESS! Converted ${data.length} rows into public/matrix.json`);