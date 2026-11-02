# Quarter Turn — Case Study

**Brief.** Build one system that produces a mark, a pattern, a poster, and a motion loop. Use the Flexible Visual Systems method. Use no stock images. The system had to stay readable as a set, not as four unrelated pieces, and the renderer had to survive a change of base form without an edit.

**Process.**

1. The base form is a quarter disc at radius 0.55 of the cell. One JSON file holds it, the six operators, the grid, the palette, and the seed.
2. Six operators act on the form: turn at 4 × 90°, mirror on the vertical, scale at 6 steps of 0.13 with a 0.11 offset, shift at 6 steps of 0.11, shear at ±20°, and a 4 × 4 field. Each cell shows one operator and its rule.
3. The mark is the turn operator alone. Four quarter discs meet and leave a four-pointed hole, so the base form stays visible in the result.
4. The pattern repeats the field operator on a 6 × 6 grid. The poster switches to the light palette, runs a 12 × 12 band, and carries the system name.
5. The motion frame draws a 5 × 5 field on a canvas and advances the phase each frame. Under reduced motion it holds one still frame.
6. The renderer reads the JSON and draws every output. A new base form or palette goes into the file, and the page stays the same.

**Result.**

- Case media: 2 stills at 107 KB.
- Six operators and four outputs render from one 1,344-byte system file, in a page of 11,504 bytes.
- Zero console errors at both widths.
- The phone layout reflows to 2 × 3 operator cells and 2 × 2 outputs with no clipping.
- The sheet is a proof, not a final identity. It shows the range before it shows the use.

**Credits.**

- Method: Dr. Martin Lorenz, Flexible Visual Systems (Slanted, 2021)
- Form, code, and writing: Juan Licerio
- Source material: No Atlas images and no paid course text used

Page: `projects/quarter-turn.html`. Verified report: `pipeline/reports/quarter-turn.json`.
