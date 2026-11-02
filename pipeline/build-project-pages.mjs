#!/usr/bin/env node
// Write the shared project-page shell for each static case study.
// One layout, one markup block, per-project meta only.

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const pages = [
  {
    id: 'forget-me-not',
    title: 'Forget Me Not',
    description: 'Projection mapping and technical integration for Victoria\'s solo exhibition Forget Me Not at a 2025 installation. Bed, wall, sink, and window blind as projection surfaces.',
    cover: 'assets/images/projects/forget-me-not/hero.jpg',
  },
  {
    id: 'triqueta',
    title: 'Triqueta AR/VR Exhibition',
    description: 'AR overlays on Michael Flanagan\'s paintings and a VR experience built around his video works, developed for the McAllen Creative Incubator in 2023.',
    cover: 'assets/images/projects/triqueta/hero.jpg',
  },
  {
    id: 'river-pierce',
    title: 'River Pierce Foundation AR Showcase',
    description: 'A commissioned augmented reality project for the River Pierce Foundation, debuted at the Treviño–Uribe Rancho in San Ygnacio, Texas on 10 May 2025.',
    cover: 'assets/images/projects/river-pierce/hero.jpg',
  },
  {
    id: 'motion',
    title: 'Motion',
    description: 'Personal motion graphics studies in After Effects, Photoshop, and Blender: abstract form, procedural animation, and dithered type.',
    cover: 'assets/images/projects/motion/hero.jpg',
  },
  {
    id: '9ine5ive6eis',
    title: '9ine5ive6eis',
    description: 'Visual identity for a limited apparel release: cloud graphic, custom typography, tote and tee layout, and a brand motion loop.',
    cover: 'assets/images/projects/9ine5ive6eis/hero.jpg',
  },
  {
    id: 'tigers-blood',
    title: 'Tigers Blood',
    description: 'A commissioned 3D animation of a static 2D logo, finished with metallic textures and analog video effects for the 2023 Tigers Blood show syllabus.',
    cover: 'assets/images/projects/tigers-blood/hero.jpg',
  },
];

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const template = ({ id, title, description, cover }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="../assets/images/favicon.svg" type="image/svg+xml">
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)} — Juan Licerio">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="../${cover}">
<title>${esc(title)} — Juan Licerio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../style.css?v=6">
</head>
<body data-page="project" data-project="${id}" data-root="../">
<header class="site-header site-header--page"><a class="wordmark" href="../index.html">JUAN LICERIO</a><nav class="site-nav" aria-label="Primary"><a href="../work.html" aria-current="page">WORK</a><a href="../cv.html">CV</a><a href="../contact.html">CONTACT</a><button class="theme-toggle" type="button" aria-label="Switch to light mode" aria-pressed="false"><span class="theme-dot"></span><span class="theme-label">LIGHT</span></button></nav></header>
<main class="project-main">
  <a class="back-link" href="../work.html">← BACK TO WORK</a>
  <section class="project-heading">
    <div class="project-heading-copy">
      <span class="section-label">PROJECT / <span data-project-year></span></span>
      <h1 data-project-title></h1>
      <p class="project-summary" data-project-summary></p>
    </div>
    <figure class="project-cover" data-project-cover></figure>
  </section>
  <section class="project-description">
    <div><span class="section-label">ABOUT</span></div>
    <div><p data-project-description></p><p class="project-tools" data-project-tools></p></div>
  </section>
  <section class="project-links-section" data-project-links-section hidden>
    <div class="section-label">LINKS</div>
    <div class="project-links" data-project-links></div>
  </section>
</main>
<footer><span>JUAN LICERIO</span><span>MEDIA ART / SYSTEMS / RGV</span></footer>
<script type="module" src="../app.js?v=5"></script>
</body>
</html>
`;

for (const page of pages) {
  writeFileSync(resolve(root, 'projects', page.id + '.html'), template(page));
  console.log('wrote projects/' + page.id + '.html');
}
