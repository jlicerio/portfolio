# Quarter Turn — System Sheet

**Brief.** Build one system that produces a mark, a pattern, a poster, and a motion loop. Use the Flexible Visual Systems method. Use no stock images.

**Process.** The base form is a quarter disc at radius 0.55 of the cell. Six operators act on it: turn (4 × 90°), mirror (vertical), scale (6 × 0.13 with a 0.11 offset), shift (6 × 0.11), shear (±20°), and field (4 × 4). One JSON file holds those values. The page renders the operator sheet and four outputs from the same file. The poster switches to the light palette and uses a 12 × 12 band. The motion frame draws a 5 × 5 field on a canvas and advances the phase on each frame. The base form, the operators, and the palette are our own. The method is credited.

**Result.** The sheet runs at 60.2 fps at 1440 × 900 and 60.0 fps at 390 × 844. The verify pass reports zero console errors at both sizes. The page is 11.5 KB and the system file is 1.3 KB. The mark is a diamond with a four-pointed hole. The pattern is a 6 × 6 field. The motion frame holds one still frame under reduced motion. The poster shows the same system in the site's light palette. The sheet is a proof, not a final identity. A new base form or palette goes into the JSON, and the renderer stays the same. The operator sheet shows the range before the outputs show the use.

**Credits.** Method: Dr. Martin Lorenz, *Flexible Visual Systems*. Form, code, and writing: Juan Licerio. No Atlas images or course text used.
