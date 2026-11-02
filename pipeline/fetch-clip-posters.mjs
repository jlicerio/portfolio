#!/usr/bin/env node
// Fetch a poster frame for every Adobe player clip in data/site.json and store it locally.
// The frame is the visual on the page; the player itself loads only when someone presses play.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const file = resolve(root, 'data/site.json');
const site = JSON.parse(readFileSync(file, 'utf8'));
const outDir = resolve(root, 'assets/images/clips');
mkdirSync(outDir, { recursive: true });

const idOf = (embedUrl) => {
  const match = String(embedUrl || '').match(/\/ccv\/([^/?#]+)\//);
  return match ? match[1] : null;
};

let fetched = 0;
let kept = 0;

for (const project of site.projects) {
  for (const media of project.videos || []) {
    const id = idOf(media.embedUrl);
    if (!id) continue;
    const target = 'assets/images/clips/' + id.replace(/[^A-Za-z0-9_-]/g, '') + '.jpg';
    const full = resolve(root, target);
    if (existsSync(full)) { media.poster = target; kept += 1; continue; }
    const url = 'https://www-ccv.adobe.io/v1/player/ccv/' + id + '/posterframe?api_key=BehancePro2View';
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) { console.log('skip ' + id + ' ' + response.status); continue; }
      const buffer = Buffer.from(await response.arrayBuffer());
      writeFileSync(full, buffer);
      execFileSync('magick', [full, '-resize', '720x720>', '-strip', '-interlace', 'Plane', '-quality', '80', full]);
      media.poster = target;
      fetched += 1;
      console.log('poster ' + id + ' -> ' + target);
    } catch (error) {
      console.log('fail ' + id + ' ' + error.message);
    }
  }
}

writeFileSync(file, JSON.stringify(site, null, 2) + '\n');
console.log('posters: ' + fetched + ' new, ' + kept + ' already present');
