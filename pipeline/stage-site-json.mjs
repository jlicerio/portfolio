#!/usr/bin/env node
// Apply the final case-study fields for a set of project ids onto a base copy of data/site.json.
// Usage: node pipeline/stage-site-json.mjs <base.json> <final.json> <id> [<id> ...]

import { readFileSync, writeFileSync } from 'node:fs';

const [basePath, finalPath, ...ids] = process.argv.slice(2);
const base = JSON.parse(readFileSync(basePath, 'utf8'));
const final = JSON.parse(readFileSync(finalPath, 'utf8'));
const fields = ['year', 'summary', 'image', 'description', 'caseStudy'];

for (const id of ids) {
  const target = base.projects.find((project) => project.id === id);
  const source = final.projects.find((project) => project.id === id);
  if (!target || !source) throw new Error('project missing: ' + id);
  for (const field of fields) {
    if (source[field] === undefined) delete target[field];
    else target[field] = source[field];
  }
}

writeFileSync('data/site.json', JSON.stringify(base, null, 2) + '\n');
console.log('staged data/site.json for ' + ids.join(', '));
