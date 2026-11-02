# Triqueta AR/VR Exhibition — Case Study

**Brief.** Triqueta pairs two media in one room. Michael Flanagan's paintings get augmented reality overlays, and his video works become a virtual reality scene. The project ran at the McAllen Creative Incubator in 2023. My part was development rather than authorship: build the technical layer that lets a painter's work be entered by a headset and by a phone, without the two reading as separate shows.

**Process.**

1. The work started from Flanagan's existing paintings and video, not from a new image.
2. Each painting carried an AR overlay. The overlays include AI-generated elements, which sit over the painted surface rather than replacing it.
3. The VR scene was built in Unreal and holds Flanagan's video works. A visitor in the headset sees the footage as the room, not as a screen on a wall.
4. The two builds share one visual vocabulary, so a visitor who sees only the phone overlays still recognises the same project.
5. Development covered tracking, placement, playback, and the headset build.
6. The room had to hold the paintings, a tracking position per work, and a headset station at the same time.

**Result.**

- Runs at 60.7 fps at 1440 x 900 and 61.2 fps at 390 x 844 in headless Chrome 156.
- Two modes in one exhibition: AR on paintings and a VR headset scene.
- One collaborator and one venue: the McAllen Creative Incubator, 2023.
- One still survives in the project file. The painting count, the marker count, and the run dates are unconfirmed.
- The page is 2.6 KB of HTML, and the three case images are 399 KB in total.
- Chrome reports zero console errors at 1440 x 900 and 390 x 844.

**Credits.**

- Artist: Michael Flanagan
- AR and VR development: Juan Licerio
- Engine: Unreal Engine for the VR build
- Venue: McAllen Creative Incubator
- Year: 2023. Run dates unconfirmed
- Additional stills: None in the project file

Page: `projects/triqueta.html`. Verified report: `pipeline/reports/triqueta.json`.
