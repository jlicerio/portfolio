# Labs

Live studies that run in the browser. Three use WebGPU; Viscous Orb uses WebGL2 for its fluid
feedback solver. System Sheet is a print-first page with its own SVG and Canvas 2D renderer.

## Layout

| Path | Purpose |
| --- | --- |
| engine/run.js | Shared runner. Takes a config, creates the device, runs the loop. |
| engine/grass-engine.js | Grass renderer: field, terrain, sky, chair, post stack. |
| engine/*.wgsl | Shaders: grass, terrain, chair, sky, post, contour, strata. |
| engine/scene.js | Clump table, blade generators, colour fields. |
| engine/glb.js | Minimal GLB reader for props. |
| chair.glb | Shared prop. |
| warp-and-weft.html | Study 01, linked from Work. |
| isolines.html | Study 02. |
| strata.html | Study 03. |
| viscous-orb.html | Study 04. WebGL2 fluid and dither veil. |
| system-sheet.html | Study 05. SVG and Canvas 2D system sheet. |
| embed/archive-atlas.html | Atlas of every image on the site, placed by measured colour and texture. Canvas 2D. |
| embed/field-of-forms.html | 132 generative forms in 5 nature families, laid out by hue and structure. Canvas 2D. |
| embed/forms-3d.html | The same rule set in three.js: 132 line modules in 3D, laid out by hue, tone, and density. |
| embed/component-board.html | Bento board of 9 components: biomorphic dither, resonance, connectivity, surface division, ASCII, colour sets. |
| embed/series-runner.html | Bounded operator set plus a seed: six draws per seed, keep or reject, seeds listed for export. |
| embed/volumetric-diatom.html | The valve in 3D: dither particles, ASCII glyph particles, and iso-contour lines over a dome depth field. |
| embed/volumetric-archive.html | The 88-image atlas in 3D: cards, dithered cards, and ASCII cards placed by colour, light, and texture. |
| embed/form-graph.html | Form space: one centre and five rings of real dithered valves, 9 palettes, 5 configurations. Click a form for its volumetric view. |

## Add a study

1. Copy a study page and keep the header and footer markup.
2. Import the runner and pass a config:

```js
import { runStudy } from './engine/run.js';
runStudy(document.querySelector('#view'), {
  weave: true,
  bladeScale: 0.82,
  chair: { url: './chair.glb', position: [0.5, 0, -1.5], scale: 1.4 },
  post: { glow: 0.45, grain: 0.021, vignette: 0.62 },
  path: { start: [2.6, 4.4], end: [0.5, -1.5] },
  pointer: true,
});
```

3. Add an entry to data/site.json so it appears on Work.

## Notes

- The runner caps the drawing buffer at 1.5 device pixels and 1728 px wide.
- Cloth pages render 18 percent fewer blades.
- Every study needs a browser with WebGPU: Chrome 113+ or Safari 26+.
