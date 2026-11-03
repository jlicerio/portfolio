#!/usr/bin/env node
// Write the shared study-page shell for every project in the site data.
// One layout, one markup block, per-project meta only.
// The shell follows work.html: intro block, one index row, numbered rows.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const site = JSON.parse(readFileSync(resolve(root, 'data/site.json'), 'utf8'));

// A live study keeps its own stage. The stage is a numbered row, so the page
// keeps one rhythm from the index row down to the last note.
const stages = {
  'warp-and-weft': {
    head: '<link rel="stylesheet" href="../labs/live.css?v=3">',
    script: `<script type="module">
  import { runStudy } from '../labs/engine/run.js';
  runStudy(document.querySelector('#view'), {
    weave: true,
    bladeScale: 0.82,
    chair: {
      url: '../labs/chair.gltf',
      position: [0.5, 0, -1.5],
      rotationY: -0.6,
      scale: 1.4,
      tint: [0.9, 0.9, 0.87],
      alignCell: true,
    },
    post: { glow: 0.45, grain: 0.021, vignette: 0.62 },
    path: { start: [2.6, 4.4], end: [0.5, -1.5] },
    pointer: true,
    pointerRadius: 2.4,
    wind: 1.35,
  });
</script>`,
    row: `<section class="case-row case-stage">
    <span class="case-row-number" aria-hidden="true"></span>
    <div class="case-row-main">
      <div class="case-row-head"><h2>Live / WebGPU</h2><span class="case-row-note">Canvas, real time</span></div>
      <div class="live-stage"><canvas id="view"></canvas></div>
      <div class="live-foot"><span id="live-status">Starting…</span><span>Move the pointer over the field</span></div>
    </div>
  </section>`,
  },
  'viscous-orb': {
    head: '<link rel="stylesheet" href="../labs/live.css?v=3">',
    script: '',
    row: `<section class="case-row case-stage">
    <span class="case-row-number" aria-hidden="true"></span>
    <div class="case-row-main">
      <div class="case-row-head"><h2>Live / WebGL2</h2><span class="case-row-note">Canvas, real time</span></div>
      <div class="live-stage"><iframe src="../labs/embed/viscous-orb.html" title="Viscous Orb live study" loading="lazy"></iframe></div>
      <div class="live-foot"><span>Fluid / dither veil</span><span>Move the pointer over the orb</span></div>
    </div>
  </section>`,
  },
  'growth-instrument': {
    head: '<link rel="stylesheet" href="../labs/live.css?v=4">',
    script: '',
    row: `<section class="case-row case-stage">
    <span class="case-row-number" aria-hidden="true"></span>
    <div class="case-row-main">
      <div class="case-row-head"><h2>Live / Browser tool</h2><span class="case-row-note">One HTML file</span></div>
      <div class="live-stage"><iframe src="https://jlicerio.github.io/generative-tools/growth-instrument/?s=rd&amp;seed=3574968473&amp;pal=signal&amp;bands=6" title="Meristem, live in the page" loading="lazy"></iframe></div>
      <div class="live-foot"><span>Five systems, eight ramps, five exports</span><span><a class="media-link" href="https://jlicerio.github.io/generative-tools/growth-instrument/" target="_blank" rel="noreferrer">OPEN FULL SCREEN ↗</a></span></div>
    </div>
  </section>`,
  },
  'form-space': {
    head: '<link rel="stylesheet" href="../labs/live.css?v=4">',
    script: '',
    row: `<section class="case-row case-stage">
    <span class="case-row-number" aria-hidden="true"></span>
    <div class="case-row-main">
      <div class="case-row-head"><h2>Live / WebGPU</h2><span class="case-row-note">One rule, 72 forms</span></div>
      <div class="live-stage"><iframe src="../labs/embed/form-graph.html" title="Form Space, live in the page" loading="lazy"></iframe></div>
      <div class="live-foot"><span>Dither, ASCII and edges / click a form</span><span><a class="media-link" href="../labs/embed/form-graph.html" target="_blank" rel="noreferrer">OPEN FULL SCREEN ↗</a></span></div>
    </div>
  </section>`,
  },
  'surveillance-status': {
    head: '<link rel="stylesheet" href="../labs/live.css?v=4">',
    script: '',
    row: `<section class="case-row case-stage">
    <span class="case-row-number" aria-hidden="true"></span>
    <div class="case-row-main">
      <div class="case-row-head"><h2>Live / Browser vision</h2><span class="case-row-note">Two camera cuts</span></div>
      <div class="video-pair">
        <figure class="video-card">
          <video controls muted loop playsinline preload="metadata" poster="../assets/images/projects/surveillance-status/01.jpg">
            <source src="../assets/video/surveillance-cdmx.mp4" type="video/mp4">
          </video>
          <figcaption><span>MEXICO CITY / ZÓCALO</span><span>00:33</span></figcaption>
        </figure>
        <figure class="video-card">
          <video controls muted loop playsinline preload="metadata" poster="../assets/images/projects/surveillance-status/06.jpg">
            <source src="../assets/video/surveillance-ny.mp4" type="video/mp4">
          </video>
          <figcaption><span>NEW YORK / TIMES SQUARE</span><span>01:05</span></figcaption>
        </figure>
      </div>
      <div class="live-foot"><span>Browser vision / language model</span><span>Sound removed for the web cut</span></div>
    </div>
  </section>`,
  },
};

// The Pages deploy serves the repo at this path, so share cards need the absolute form.
// Three studies carry an SVG cover, which scrapers reject, so they point at a raster still.
const siteUrl = 'https://jlicerio.github.io/portfolio/';
const shareImages = {
  'warp-and-weft': 'assets/images/projects/warp-and-weft/01.jpg',
  'viscous-orb': 'assets/images/projects/viscous-orb/01.jpg',
  'growth-instrument': 'assets/images/projects/growth-instrument/desktop-4x3.png',
  'form-space': 'assets/images/projects/form-space/desktop-4x3.png',
};
const shareImage = (project) => shareImages[project.id] || project.image;

const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const template = (project) => {
  const stage = stages[project.id] || { head: '', script: '', row: '' };
  const archive = project.id === 'archived'
    ? `\n  <section class="archive-index" data-archive aria-label="Every study by year"></section>`
    : '';
  const stageRow = stage.row ? `\n  ${stage.row}` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="../assets/images/favicon.svg" type="image/svg+xml">
<meta name="description" content="${esc(project.summary)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(project.title)} — Juan Licerio">
<meta property="og:description" content="${esc(project.summary)}">
<meta property="og:image" content="${siteUrl}${shareImage(project)}">
<meta property="og:url" content="${siteUrl}projects/${project.id}.html">
<title>${esc(project.title)} — Juan Licerio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../style.css?v=12">${stage.head ? '\n' + stage.head : ''}
</head>
<body data-page="project" data-project="${project.id}" data-root="../">
<header class="site-header site-header--page"><a class="wordmark" href="../index.html">JUAN LICERIO</a><nav class="site-nav" aria-label="Primary"><a href="../work.html" aria-current="page">WORK</a><a href="../cv.html">CV</a><a href="../contact.html">CONTACT</a><button class="theme-toggle" type="button" aria-label="Switch to light mode" aria-pressed="false"><span class="theme-dot"></span><span class="theme-label">LIGHT</span></button></nav></header>
<main class="case-main">
  <a class="back-link" href="../work.html">← BACK TO WORK</a>
  <section class="work-intro case-intro">
    <span class="section-label"><span><span data-project-kicker>STUDY</span> / <span data-project-number></span></span><span data-project-discipline></span></span>
    <div class="work-intro-grid">
      <h1 id="case-title" data-project-title></h1>
      <p data-project-summary></p>
    </div>
  </section>
  <section class="work-index case-index" aria-labelledby="case-title">
    <div class="work-index-head" aria-hidden="true"><span>NO.</span><span>PROJECT</span><span>DISCIPLINE</span><span>YEAR</span><span>PREVIEW</span></div>
    <ul class="work-index-list" data-case-meta></ul>
  </section>${stageRow}
  <div class="case-body" data-case-body></div>${archive}
</main>
<footer><span>JUAN LICERIO</span><span>MEDIA ART / SYSTEMS / RGV</span></footer>
<script type="module" src="../app.js?v=12"></script>${stage.script ? '\n' + stage.script : ''}
</body>
</html>
`;
};

for (const project of site.projects) {
  writeFileSync(resolve(root, 'projects', project.id + '.html'), template(project));
  console.log('wrote projects/' + project.id + '.html');
}
