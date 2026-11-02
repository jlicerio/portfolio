# Viscous Orb — Case Study

**Brief.** A single sphere had to hold a real-time fluid interior and keep a clean silhouette. The earlier build used a tiled caustic texture, and the grid repeated in the reflection. The target was a liquid surface that reacts to a pointer, settles on its own, and holds 60 fps at portrait size. The page also had to run inside a portfolio iframe with a capped drawing buffer.

**Process.**

1. The study renders one sphere and one full-screen fluid pass. A pointer ray hits the sphere, and the hit point writes velocity and dye into a 256 x 256 field. An invisible mover crosses the orb on a loop, so the surface moves without input.
2. A pressure solve and a vorticity pass move the dye through the field. The velocity decays after each pass. The dye carries the colour, and the field returns to rest in about one second.
3. The first build sampled a tiled caustic texture. The tiles showed as a grid in the reflection. I removed the texture and drove the reflection from the fluid field. The grid artifact disappeared.
4. A Bayer veil reads the dye and turns the moving liquid into coarse pixels. The veil clears as the field settles. A toggle keeps the veil off for clean stills.
5. Bloom runs at quarter resolution with two blur passes. Soft focus mixes the blurred frame at 0.42. An analytic rim keeps the silhouette sharp while the interior stays soft.
6. The portfolio embed sets a 1728 px drawing buffer cap. The study scales the fluid field and the bloom pass to that cap, so the frame rate holds at desktop and phone width.

**Result.**

- Runs at 59.5 fps at 1440 x 900 and 59.9 fps at 390 x 844 in headless Chrome 156.
- The portfolio embed caps the drawing buffer at 1728 px.
- Chrome reports no console errors at desktop and phone width.
- The still shows the dither veil and the spectral rim. The touch frame shows the dye trail.

**Credits.**

- Design and code: Juan Licerio
- Fluid solver reference: sabosugi, CodePen (adapted; licence not stated)
- Renderer: Three.js r170, MIT

Page: `projects/viscous-orb.html`. Verified report: `pipeline/reports/viscous-orb.json`.
