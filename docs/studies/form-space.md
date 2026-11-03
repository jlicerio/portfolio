# Form Space — Case Study

**Brief.** One valve rule had to carry a whole space: 72 forms that read as one family and still differ, arranged so a viewer can see the form change as the parameters rise. The space had to run full screen in a browser with no image assets, and any single form had to open as a volume of its own.

**Process.**

1. Every specimen comes from one valve rule: folds from 6 to 48, one to six rings, depth, edge sharpness, warp, a quarter turn and a mirror. The centre is the plain valve with no change.
2. Complexity is computed from the parameters, not assigned. Folds, ring count and warp give a value from 0 to 1, and the 72 specimens sort by that value, so the space reads as one ramp.
3. The layout puts one specimen at the centre and the rest on five rings of 7, 12, 16, 18 and 18. Each ring is one step of complexity. A line joins each specimen to the closest simpler one, which gives 71 links and a readable parent behind every form.
4. Each form is drawn as a dithered point cloud and as a valve outline from the same parametric surface. Nine palettes of three colours pass through one warm grey soften, so no form shouts.
5. Three render modes read the same geometry: dither, ASCII with a 10-glyph ramp, and edges. A sound toggle turns the five rings into five detuned drones with their own pan, and an opened form plays an arpeggio.
6. A click opens the form alone, fits the camera to the screen aspect, and prints its configuration name, fold count, ring count, warp and particle count. The name is read from the parameters, so the label follows the form and no list is stored.

**Result.**

- 72 specimens, one centre, rings of 7, 12, 16, 18 and 18, and 71 links.
- Nine palettes, three render modes and a five-ring sound bed.
- The live lab runs at 60.6 fps at 1440 x 900 and 60.5 fps at 390 x 844. The case page recorded 60.0 fps at 1440 x 900 and 59.5 fps at 390 x 844.
- On a portrait screen the camera fits to the aspect, so the outer ring runs past the frame and the field is read by orbit.

**Credits.**

- Design and code: Juan Licerio
- Renderer: three.js WebGPURenderer and TSL, MIT
- Geometry: One parametric valve surface, no bitmap textures

Page: `projects/form-space.html`. Verified report: `pipeline/reports/form-space.json`.
