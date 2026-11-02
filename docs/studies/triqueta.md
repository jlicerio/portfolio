# Triqueta AR/VR Exhibition — Case Study

**Brief.** Triqueta ran at the McAllen Creative Incubator in McAllen, Texas. The showcase carried AR poster designs, a VR experience, audio-visual installation, and generative digital art by regional artist and designer _selfsimilar_. Michael Flanagan's paintings and films were the collaborating body of work: his paintings took the AR overlays and his video became the VR scene. My part was development rather than authorship: build the technical layer that lets painted work be entered by a headset and by a phone, without the two reading as separate shows.

**Process.**

1. The work started from Flanagan's existing paintings and video, not from a new image.
2. Each painting carried an AR overlay. The overlays include AI-generated elements, which sit over the painted surface rather than replacing it.
3. The VR scene was built in Unreal and holds Flanagan's video works. A visitor in the headset sees the footage as the room, not as a screen on a wall.
4. Tracking used printed markers fixed to the wall beside each work. The reel shows a marker next to the poster it registers.
5. The overlays read as objects in the room, not as flat images. A dome sits in front of its poster and casts a shadow; slabs float off a wall.
6. The phone build and the headset build share one visual vocabulary, so a visitor who only uses the phone still reads the same project.
7. The room held three kinds of work at once: the AR posters, the headset station, and the generative and audio-visual installation.

**Result.**

- Runs at 60.7 fps at 1440 x 900 and 60.9 fps at 390 x 844 in headless Chrome 156.
- Two modes in one room: AR on posters in a phone view, and a VR scene on a headset.
- Venue: McAllen Creative Incubator, 601 N Main St, McAllen, Texas.
- Four stills taken from the 90-second exhibition reel. The reel is 720 x 1280, and the four case images are 200 KB in total.
- The page is 2.6 KB of HTML and renders the case from one data entry.
- Chrome reports zero console errors at 1440 x 900 and 390 x 844.

**Credits.**

- Paintings and films: Michael Flanagan
- AR, VR, and show design: Juan Licerio (_selfsimilar)
- Engine: Unreal Engine for the VR build
- Venue: McAllen Creative Incubator, McAllen, Texas
- Reel: 90 seconds, 720 x 1280, hosted on the Behance CCV player. Filmmaker unconfirmed
- Year and run dates: 2023. Run dates and painting count unconfirmed

Page: `projects/triqueta.html`. Verified report: `pipeline/reports/triqueta.json`.
