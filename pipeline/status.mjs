#!/usr/bin/env node
// Build the study status table from data/site.json and pipeline reports.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const site = JSON.parse(readFileSync(resolve(root, 'data/site.json'), 'utf8'));

const completeCaseStudy = (study) => {
  if (!study) return false;
  const steps = Array.isArray(study.process) ? study.process.length : 0;
  const results = Array.isArray(study.result) ? study.result.length : 0;
  const credits = Array.isArray(study.credits) ? study.credits.length : 0;
  return Boolean(study.brief) && steps >= 3 && results >= 2 && credits >= 1;
};

const rows = site.projects.map((project) => {
  const reportPath = resolve(root, 'pipeline/reports/' + project.id + '.json');
  const report = existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')) : null;
  const caseStudy = completeCaseStudy(project.caseStudy);

  let stage = 'concept';
  if (project.href) stage = 'built';
  if (report?.pass) stage = 'verified';
  if (report?.pass && caseStudy) stage = 'case study';
  if (project.shipped && project.liveUrl) stage = 'shipped';

  const desktop = report?.sizes?.find((size) => size.name === 'desktop');
  return {
    id: project.id,
    title: project.title,
    archived: Boolean(project.archived),
    stage,
    fps: desktop ? desktop.fps : null,
    errors: desktop ? desktop.errors.length : null,
    checked: report?.checkedAt ? report.checkedAt.slice(0, 10) : null,
    caseStudy,
  };
});

const header = '| Study | Stage | FPS | Errors | Case study | Checked |\n| :--- | :--- | ---: | ---: | :---: | :--- |';
const body = rows
  .filter((row) => !row.archived)
  .map((row) => '| ' + row.title + ' | ' + row.stage + ' | ' + (row.fps ?? '-') + ' | ' + (row.errors ?? '-') + ' | ' + (row.caseStudy ? 'yes' : 'no') + ' | ' + (row.checked ?? '-') + ' |')
  .join('\n');

const counts = rows.filter((row) => !row.archived).reduce((all, row) => {
  all[row.stage] = (all[row.stage] || 0) + 1;
  return all;
}, {});

const summary = Object.entries(counts).map(([stage, count]) => count + ' ' + stage).join(', ');
const markdown = '# Study status\n\n' + summary + '\n\n' + header + '\n' + body + '\n';

writeFileSync(resolve(root, 'pipeline/status.md'), markdown);
console.log(markdown);
