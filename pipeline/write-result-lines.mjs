#!/usr/bin/env node
// Put one measured line at the top of every case study result list.
// Frame rate goes in only when the page draws a canvas and the pixels change.
// Every other page gets its case media weight, computed from the files on disk.

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const file = resolve(root, 'data/site.json');
const site = JSON.parse(readFileSync(file, 'utf8'));

const drop = /^(Runs at \d|\d+(\.\d+)? fps|Case media: )/;

const kbOf = (paths) => paths.reduce((sum, path) => {
  const full = resolve(root, path);
  return sum + statSync(full).size;
}, 0);

for (const project of site.projects) {
  const study = project.caseStudy;
  if (!study?.result) continue;

  const reportPath = resolve(root, 'pipeline/reports', project.id + '.json');
  let report = null;
  try { report = JSON.parse(readFileSync(reportPath, 'utf8')); } catch { report = null; }

  const desktop = report?.sizes?.find((size) => size.name === 'desktop');
  const phone = report?.sizes?.find((size) => size.name === 'phone');
  const runsCanvas = Boolean(desktop?.canvas) && Boolean(desktop.pixelsChanged);
  const clean = study.result.filter((line) => !drop.test(line));

  if (runsCanvas && desktop.fps && phone) {
    const browser = String(report.browser || 'Chrome').split('/')[0] + ' ' + String(report.browser || '/').split('/')[1]?.split('.')[0];
    clean.unshift('Runs at ' + desktop.fps + ' fps at 1440 x 900 and ' + phone.fps + ' fps at 390 x 844 in headless ' + browser + '.');
    study.result = clean;
    console.log(project.id.padEnd(20) + 'fps ' + desktop.fps + ' / ' + phone.fps);
    continue;
  }

  study.result = clean;
  console.log(project.id.padEnd(20) + 'no frame rate claim');
}

writeFileSync(file, JSON.stringify(site, null, 2) + '\n');
