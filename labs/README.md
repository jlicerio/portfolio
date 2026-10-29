# Labs

Live studies that run in the browser on WebGPU.
Each study is one page beside a shared engine.

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
