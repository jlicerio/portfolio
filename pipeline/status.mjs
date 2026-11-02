#!/usr/bin/env node
// Build the study status table from data/site.json and pipeline reports.
// A report counts only when it matches the project, the URL, and both widths.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const site = JSON.parse(readFileSync(resolve(root, 'data/site.json'), 'utf8'));

const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

const caseStats = (study) => {
  if (!study) return { valid: false, words: 0, reason: 'no case study' };
  const process = Array.isArray(study.process) ? study.process.filter(nonEmpty) : [];
  const result = Array.isArray(study.result) ? study.result.filter(nonEmpty) : [];
  const credits = Array.isArray(study.credits)
    ? study.credits.filter((item) => item && nonEmpty(item.role) && nonEmpty(item.name))
    : [];
  const text = [study.brief, ...process, ...result].filter(nonEmpty).join(' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const problems = [];
  if (!nonEmpty(study.brief)) problems.push('brief');
  if (process.length < 3) problems.push('process');
  if (result.length < 2) problems.push('result');
  if (credits.length < 1) problems.push('credits');
  if (words < 250) problems.push('words');
  return { valid: problems.length === 0, words, reason: problems.join(', ') };
};

const readReport = (project) => {
  const path = resolve(root, 'pipeline/reports/' + project.id + '.json');
  if (!existsSync(path)) return { report: null, valid: false, reason: 'no report' };
  const report = JSON.parse(readFileSync(path, 'utf8'));
  if (report.slug !== project.id) return { report, valid: false, reason: 'slug mismatch' };
  if (report.pass !== true) return { report, valid: false, reason: 'report failed' };
  if (!project.href || !String(report.url || '').endsWith('/' + project.href)) {
    return { report, valid: false, reason: 'url mismatch' };
  }
  const names = new Set((report.sizes || []).map((size) => size.name));
  if (!names.has('desktop') || !names.has('phone')) {
    return { report, valid: false, reason: 'desktop and phone required' };
  }
  return { report, valid: true, reason: '' };
};

const rows = site.projects.map((project) => {
  const { report, valid, reason } = readReport(project);
  const study = caseStats(project.caseStudy);
  const built = Boolean(project.href) && existsSync(resolve(root, project.href.split('?')[0]));

  let stage = 'concept';
  let note = reason;
  if (built) stage = 'built';
  if (valid) stage = 'verified';
  if (valid && study.valid) stage = 'case study';
  if (project.shipped && project.liveUrl && project.approvedAt && valid && study.valid) {
    stage = 'shipped';
    note = '';
  } else if (project.shipped && !(valid && study.valid && project.approvedAt)) {
    note = 'shipped flag blocked';
  }
  if (!built) note = 'missing page';

  const desktop = report?.sizes?.find((size) => size.name === 'desktop');
  const runsCanvas = Boolean(desktop?.canvas) && Boolean(desktop.pixelsChanged);
  if (valid && !runsCanvas && !note) note = 'no canvas, no fps claim';
  return {
    id: project.id,
    title: project.title,
    archived: Boolean(project.archived),
    stage,
    fps: desktop && runsCanvas ? desktop.fps : null,
    errors: desktop ? desktop.errors.length : null,
    checked: report?.checkedAt ? report.checkedAt.slice(0, 10) : null,
    caseStudy: study.valid,
    words: study.words || null,
    note,
  };
});

const header = '| Study | Stage | FPS | Errors | Case study | Words | Checked | Note |\n| :--- | :--- | ---: | ---: | :---: | ---: | :--- | :--- |';
const body = rows
  .filter((row) => !row.archived)
  .map((row) => '| ' + row.title + ' | ' + row.stage + ' | ' + (row.fps ?? '-') + ' | ' + (row.errors ?? '-') + ' | ' + (row.caseStudy ? 'yes' : 'no') + ' | ' + (row.words ?? '-') + ' | ' + (row.checked ?? '-') + ' | ' + (row.note || '-') + ' |')
  .join('\n');

const counts = rows.filter((row) => !row.archived).reduce((all, row) => {
  all[row.stage] = (all[row.stage] || 0) + 1;
  return all;
}, {});

const summary = Object.entries(counts).map(([stage, count]) => count + ' ' + stage).join(', ');
const markdown = '# Study status\n\n' + summary + '\n\n' + header + '\n' + body + '\n';

writeFileSync(resolve(root, 'pipeline/status.md'), markdown);
console.log(markdown);
