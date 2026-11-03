# Warp and Weft — Case Study

**Brief.** A WebGPU field of grass had to read as cloth. The scene needed one object, one checker cut, and no visible blade cards. The page had to run in a browser tab at full desktop width, hold a steady frame, and keep the chair readable at phone width. The field is the subject, and the chair is the scale reference.

**Process.**

1. A clump table and blade generators build the meadow. Each clump shares a colour field, so the checker reads at distance without a texture.
2. A vertex shader bends the blades in the wind. The wind runs on a slow noise field, and a pointer ray parts the grass around the cursor.
3. A mask cuts the field into a checker. The dark squares use a shorter blade and a cooler colour, so the pattern survives the camera move.
4. One GLB chair sits on a dark square. The chair is the only hard edge in the frame, and it gives the field a human scale.
5. A film pass adds halation, grain, and vignette. The grade stays low-contrast so the white chair holds against the grass.
6. The camera keeps a low eye height. The horizon stays out of frame, so the field reads as cloth rather than a landscape.
7. The drawing buffer caps at the viewport size. The blade count is fixed when the scene starts, so the meadow holds 60 fps on a laptop and on a phone.
8. A small status line reports frame rate and blade count. The test run read 265,744 blades at 60 fps.
9. The GLB chair loads once and is drawn once. The meadow uses no textures; colour comes from the clump fields.

**Result.**

- Runs at 60.2 fps at 1440 x 900 in headless Chrome 156, on the live canvas.
- The phone run draws the same scene on a 359 x 478 canvas with no console error.
- 265,744 blades in the live scene.

**Credits.**

- Design and code: Juan Licerio
- Renderer: WebGPU / WGSL
- Chair model: 3D scan

Page: `projects/warp-and-weft.html`. Verified report: `pipeline/reports/warp-and-weft.json`.
