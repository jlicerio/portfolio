# Meristem — Case Study

**Brief.** Five natural growth processes had to share one canvas, so a form could be read as a still, a vector, a solid and a colour field without four separate tools. Each form had to come back from a number, and the printed output had to hold a real colour ramp rather than a single ink.

**Process.**

1. One canvas holds five systems: diffusion-limited aggregation, physarum, Gray-Scott reaction-diffusion, differential growth and space colonisation. Each writes into the same density grid, so the shared renderer, ramp and export read one field.
2. An integer seed drives mulberry32, and the same seed rebuilds the same form. The permalink carries the system, the seed and every shape parameter, so any form is addressable by URL.
3. Ink coverage picks a position on one of eight ramps, four stops each. The band setting dithers the ramp position between tones, not the colour, so a natural process prints as a gradient and not as one flat ink.
4. Pause or finish the growth and the volume exports unlock: a voxel mesh as GLB with vertex colours, a 25,000 to 400,000 particle cloud as PLY with per-particle colour, size and contour band, and a Bayer-dithered ASCII volume with one glyph per voxel.
5. The tool is one HTML file of 54,427 bytes. There is no build step and no network request after load, so it runs from a static host or a local folder.
6. Each system keeps its own parameter set, and the parameter list redraws when the system changes. Live parameter changes grow the form from the current step, and a restart replays it from the seed.

**Result.**

- Five systems, eight colour ramps of four stops, and five exports: PNG at 2x, SVG, GLB, PLY and ASCII.
- The whole tool is one 54,427-byte HTML file with no dependency and no build step.
- At 1440 x 900 the form sits beside the control panel, and the panel scrolls. At 390 x 844 the form sits above the controls. Neither width scrolls sideways.

**Credits.**

- Design and code: Juan Licerio
- Reference: Rohan Newman, named in the tool as the study reference (licence not stated)
- Renderer: Canvas 2D, browser native, with custom GLB and PLY writers

Page: `projects/growth-instrument.html`. Verified report: `pipeline/reports/growth-instrument.json`.
