#!/usr/bin/env node
// Build the archive atlas: one point per image on the site.
// Position comes from measured colour and texture, not from a neural network.
// Every number here is computed from the pixels with ImageMagick.

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { dirname, resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const site = JSON.parse(readFileSync(resolve(root, 'data/site.json'), 'utf8'));

const walk = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) out.push(full);
  }
  return out;
};

const files = [
  ...walk(resolve(root, 'assets/images/projects')),
  ...walk(resolve(root, 'assets/images/clips')),
  ...readdirSync(resolve(root, 'assets/images'))
    .filter((name) => /\.(jpg|jpeg|png)$/i.test(name))
    .map((name) => resolve(root, 'assets/images', name)),
];

const rel = (full) => full.slice(root.length + 1);

// Which study does this file belong to?
const owner = (path) => {
  const parts = path.split('/');
  const projectIndex = parts.indexOf('projects');
  if (projectIndex >= 0) return parts[projectIndex + 1];
  if (parts.includes('clips')) return 'clips';
  return 'covers';
};

const measure = (full) => {
  // 6x6 RGB grid, averaged luminance, and dominant palette in one pass each.
  const grid = execFileSync('magick', [full, '-resize', '6x6!', '-depth', '8', 'txt:-'], { encoding: 'utf8' });
  const pixels = grid.split('\n').filter((line) => /^0,/.test(line)).map((line) => {
    const match = line.match(/srgb\((\d+),(\d+),(\d+)\)/) || line.match(/#([0-9A-Fa-f]{6})/);
    if (!match) return [0, 0, 0];
    if (match.length === 4) return [Number(match[1]), Number(match[2]), Number(match[3])];
    const hex = match[1];
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  });
  const mean = pixels.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]).map((v) => v / pixels.length);
  const variance = pixels.reduce((acc, p) => {
    const l = 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
    return acc + (l - (0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2])) ** 2;
  }, 0) / pixels.length;
  const saturation = pixels.reduce((acc, p) => {
    const max = Math.max(...p);
    const min = Math.min(...p);
    return acc + (max === 0 ? 0 : (max - min) / max);
  }, 0) / pixels.length;

  const paletteOut = execFileSync('magick', [full, '-resize', '40x40', '-colors', '3', '-format', '%c', 'histogram:info:-'], { encoding: 'utf8' });
  const palette = [...paletteOut.matchAll(/#([0-9A-Fa-f]{6})/g)].slice(0, 3).map((m) => '#' + m[1].toUpperCase());

  const dims = execFileSync('magick', ['identify', '-format', '%w %h', full], { encoding: 'utf8' }).trim().split(' ').map(Number);

  return {
    mean: mean.map((v) => Math.round(v)),
    lum: Math.round(0.2126 * mean[0] + 0.7152 * mean[1] + 0.0722 * mean[2]),
    texture: Math.round(Math.sqrt(variance)),
    saturation: Math.round(saturation * 100) / 100,
    aspect: Math.round((dims[0] / dims[1]) * 100) / 100,
    width: dims[0],
    height: dims[1],
    palette,
  };
};

const raw = [];
for (const full of files) {
  const path = rel(full);
  const stats = statSync(full);
  const features = measure(full);
  raw.push({ path, work: owner(path), bytes: stats.size, ...features });
}

// Feature vector for the projection: colour, light, texture, saturation, aspect.
const vector = (p) => [
  p.mean[0] / 255, p.mean[1] / 255, p.mean[2] / 255,
  p.lum / 255, p.texture / 128, p.saturation, Math.min(p.aspect, 3) / 3,
];

const dims = 7;
const mean = new Array(dims).fill(0);
for (const p of raw) vector(p).forEach((v, i) => { mean[i] += v / raw.length; });
const centred = raw.map((p) => vector(p).map((v, i) => v - mean[i]));

const covariance = Array.from({ length: dims }, () => new Array(dims).fill(0));
for (const row of centred) {
  for (let i = 0; i < dims; i += 1) for (let j = 0; j < dims; j += 1) covariance[i][j] += row[i] * row[j] / centred.length;
}

const power = (matrix, iterations = 200) => {
  let v = new Array(dims).fill(1 / Math.sqrt(dims));
  for (let n = 0; n < iterations; n += 1) {
    const next = new Array(dims).fill(0);
    for (let i = 0; i < dims; i += 1) for (let j = 0; j < dims; j += 1) next[i] += matrix[i][j] * v[j];
    const norm = Math.hypot(...next) || 1;
    v = next.map((x) => x / norm);
  }
  return v;
};

const pc1 = power(covariance);
const deflated = covariance.map((row, i) => row.map((value, j) => value - pc1[i] * pc1[j] * row.reduce((s, x, k) => s + 0, 0)));
// Deflate properly: lambda * v v^T
const lambda1 = (() => {
  let sum = 0;
  for (let i = 0; i < dims; i += 1) for (let j = 0; j < dims; j += 1) sum += pc1[i] * covariance[i][j] * pc1[j];
  return sum;
})();
for (let i = 0; i < dims; i += 1) for (let j = 0; j < dims; j += 1) deflated[i][j] = covariance[i][j] - lambda1 * pc1[i] * pc1[j];
const pc2 = power(deflated);

const projected = centred.map((row) => {
  const x = row.reduce((s, v, i) => s + v * pc1[i], 0);
  const y = row.reduce((s, v, i) => s + v * pc2[i], 0);
  return [x, y];
});

const xs = projected.map((p) => p[0]);
const ys = projected.map((p) => p[1]);
const norm = (v, values) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return max === min ? 0.5 : (v - min) / (max - min);
};

const projects = new Map(site.projects.map((p) => [p.id, p]));
const points = raw.map((p, index) => ({
  path: p.path,
  work: p.work,
  title: projects.get(p.work)?.title || (p.work === 'clips' ? 'Clip poster' : 'Cover'),
  year: projects.get(p.work)?.year || '',
  href: projects.get(p.work)?.href || '',
  x: Math.round(norm(projected[index][0], xs) * 1000) / 1000,
  y: Math.round(norm(projected[index][1], ys) * 1000) / 1000,
  lum: p.lum,
  texture: p.texture,
  saturation: p.saturation,
  aspect: p.aspect,
  bytes: p.bytes,
  palette: p.palette,
}));

mkdirSync(resolve(root, 'data'), { recursive: true });
writeFileSync(resolve(root, 'data/atlas.json'), JSON.stringify({
  built: new Date().toISOString().slice(0, 10),
  count: points.length,
  features: ['mean R', 'mean G', 'mean B', 'luminance', 'texture', 'saturation', 'aspect'],
  method: 'Seven features measured from the pixels with ImageMagick, standardised, then projected to two axes with a principal component analysis. No neural network.',
  explained: Math.round((lambda1 / covariance.reduce((s, row, i) => s + row[i], 0)) * 1000) / 1000,
  points,
}, null, 2) + '\n');

console.log('points', points.length, 'works', new Set(points.map((p) => p.work)).size);
