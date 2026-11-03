#!/usr/bin/env node
// Write docs/studies/<id>.md from data/site.json so the page copy and the file cannot drift.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const site = JSON.parse(readFileSync(resolve(root, 'data/site.json'), 'utf8'));

const ids = site.projects.filter((project) => project.caseStudy?.brief).map((project) => project.id);

for (const id of ids) {
  const project = site.projects.find((item) => item.id === id);
  const study = project.caseStudy;
  const title = id === 'archived' ? 'Archived Works — Index Hub' : `${project.title} — Case Study`;
  const lines = [
    `# ${title}`,
    '',
    `**Brief.** ${study.brief}`,
    '',
    '**Process.**',
    '',
    ...study.process.map((step, index) => `${index + 1}. ${step}`),
    '',
    '**Result.**',
    '',
    ...study.result.map((item) => `- ${item}`),
    '',
    '**Credits.**',
    '',
  ];
  for (const credit of study.credits) lines.push(`- ${credit.role}: ${credit.name}`);
  lines.push('', `Page: \`projects/${id}.html\`. Verified report: \`pipeline/reports/${id}.json\`.`, '');
  writeFileSync(resolve(root, 'docs/studies', id + '.md'), lines.join('\n'));
  console.log('wrote docs/studies/' + id + '.md');
}
