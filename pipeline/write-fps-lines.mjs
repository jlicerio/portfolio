#!/usr/bin/env node
// Insert the measured frame rate into each case study result list.
// Reads the verify report for the project, so the number in the copy is the number in the report.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const file = resolve(root, 'data/site.json');
const site = JSON.parse(readFileSync(file, 'utf8'));

const ids = ['forget-me-not', 'triqueta', 'river-pierce', 'motion', '9ine5ive6eis', 'tigers-blood', 'archived'];
const marker = /^Runs at /;

for (const id of ids) {
  const reportPath = resolve(root, 'pipeline/reports', id + '.json');
  if (!existsSync(reportPath)) { console.log(id + ' no report'); continue; }
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  if (!report.pass) { console.log(id + ' report failed'); continue; }
  const desktop = report.sizes.find((size) => size.name === 'desktop');
  const phone = report.sizes.find((size) => size.name === 'phone');
  const browser = String(report.browser || 'Chrome').split('/')[0] + ' ' + String(report.browser || '/').split('/')[1]?.split('.')[0];
  const project = site.projects.find((item) => item.id === id);
  const result = project.caseStudy.result.filter((line) => !marker.test(line));
  result.unshift('Runs at ' + desktop.fps + ' fps at 1440 x 900 and ' + phone.fps + ' fps at 390 x 844 in headless ' + browser + '.');
  project.caseStudy.result = result;
  console.log(id.padEnd(16) + desktop.fps + ' / ' + phone.fps + ' fps');
}

writeFileSync(file, JSON.stringify(site, null, 2) + '\n');
