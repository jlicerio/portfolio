# Surveillance Status — Case Study

**Brief.** Two public squares run through one browser pipeline. The Zócalo in Mexico City and Times Square in New York are already watched by cameras, phones, and algorithms. The piece adds a narrator. A vision model tracks each person and object, and a small language model writes one line for each. The line appears beside the box, in the language of the place. The feed is live, so each pass is a new cut. The overlay is the work: boxes, IDs, velocities, and a line of prose over a live street.

**Process.**

1. A public camera feed runs in the browser. The overlay prints its own log: objects tracked, motion level, and a velocity vector per object.
2. The vision pass assigns an ID to each person and object. Boxes and labels sit over the feed. The tracker keeps position and velocity for each ID.
3. Each label reports class, speed, and distance. The status panel prints the model, frame rate, object count, and a live list of IDs. The panel is part of the image, not a debug view.
4. A small language model writes one line for each tracked object. The prompt asks for one sentence in the language of the place. Mexico City writes in Spanish; New York writes in English.
5. The line sits beside the box. Long lines wrap; short lines leave space. The overlay stays legible at phone width.
6. The piece runs as one take. There is no narration, no cutaway, and no post-production overlay. The text arrives while the crowd moves.
7. The web cut is silent. The original post carries a soundtrack.

**Result.**

- Two cities, two languages, one pipeline.
- One logged frame reports 24 tracked objects, with a motion level and a velocity vector per object.
- 33.2 s Mexico City; 64.7 s New York.
- The text is generated per object, not scripted per scene.
- Each pass produces a different set of lines.

**Credits.**

- Concept, code, camera pipeline: Juan Licerio
- Vision: YOLOv8n (Ultralytics); licence terms apply
- Language model: Small local model
- Audio: Original post soundtrack, removed for the web cut

Page: `projects/surveillance-status.html`. Verified report: `pipeline/reports/surveillance-status.json`.
