#!/usr/bin/env node
// One polish pass on the index: a short discipline label per study, newest-first order,
// and a preview column that reads without a hover.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const file = resolve(root, 'data/site.json');
const site = JSON.parse(readFileSync(file, 'utf8'));
const countWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

const discipline = {
  'warp-and-weft': 'WEBGPU / WGSL',
  'viscous-orb': 'WEBGL2 / FLUID',
  'growth-instrument': 'CANVAS 2D / EXPORT',
  'form-space': 'WEBGPU / 3D',
  'surveillance-status': 'LIVE VIDEO',
  'forget-me-not': 'PROJECTION MAPPING',
  'river-pierce': 'AUGMENTED REALITY',
  '9ine5ive6eis': 'IDENTITY / TYPE',
  triqueta: 'AR / VR',
  'tigers-blood': '3D / MOTION',
  motion: 'MOTION GRAPHICS',
  'collapsed-timelines': 'FOUR-CHANNEL VIDEO',
  archived: 'INDEX',
};

const order = [
  'warp-and-weft', 'viscous-orb', 'growth-instrument', 'form-space',
  'surveillance-status', 'forget-me-not', 'river-pierce',
  '9ine5ive6eis', 'triqueta', 'tigers-blood',
  'motion', 'collapsed-timelines', 'archived',
];

for (const project of site.projects) {
  if (discipline[project.id]) project.discipline = discipline[project.id];
}

const byId = new Map(site.projects.map((project) => [project.id, project]));
const missing = order.filter((id) => !byId.has(id));
if (missing.length) throw new Error('missing project: ' + missing.join(', '));
site.projects = order.map((id) => byId.get(id));
const studyCount = site.projects.filter((project) => project.id !== 'archived').length;
if (!countWords[studyCount]) throw new Error(`study count ${studyCount} is outside the supported range`);
const workIntro = resolve(root, 'work.html');
const intro = readFileSync(workIntro, 'utf8').replace(/(?:\w+|\d+) studies in four sections/i, `${countWords[studyCount]} studies in four sections`);
writeFileSync(workIntro, intro);

writeFileSync(file, JSON.stringify(site, null, 2) + '\n');
console.log(site.projects.map((project, index) => String(index + 1).padStart(2, '0') + ' ' + project.id + ' — ' + project.discipline).join('\n'));
