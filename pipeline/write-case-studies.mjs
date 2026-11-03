#!/usr/bin/env node
// One pass: write the case-study block for the seven queued studies.
// Every claim below traces to data/site.json, the project assets, or a source opened at build time.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const file = resolve(root, 'data/site.json');
const site = JSON.parse(readFileSync(file, 'utf8'));

const img = (path) => path;
const studies = {
  'forget-me-not': {
    title: 'Forget-me-not',
    year: '2025',
    summary: 'Projection mapping and technical setup for the McAllen staging of Victoria Cantu\'s first solo exhibition at Ponte Creative Studio & Gallery.',
    image: 'assets/images/projects/forget-me-not/hero.jpg',
    caseStudy: {
      brief: "Forget-me-not is Victoria's first solo exhibition. It puts video on household objects instead of screens, and the set covers identity, archive, memory, aging, and home. It opened at St. Edward's University in February 2025 with five works listed by the artist: Forget-me-not, Entre Mundos, Sueños Rosas, 'Til Death Do Us Part, and Tender Cuts. It then moved to Ponte Creative Studio & Gallery, the Trucha RGV space at 1305 N Main St in McAllen, where it ran from 15 August to 16 October 2025. My part was the technical setup for the McAllen staging: fit Victoria's video onto the bed, the wall, the sink, and the window blind, and hold each object's image in place through the opening.",
      process: [
        "Victoria's video is the content. Each loop was matched to one surface before anything was mapped.",
        "Surfaces were mapped in MadMapper. The bed, the sink, and the basin are not flat, so each mask was drawn on site against the real object rather than from a plan.",
        "Resolume held the layers and the playback order. Each surface ran as its own clip, so one loop could restart without touching the rest of the room.",
        "The sink scene also lights the floor in front of it. The spill reads as water under the basin and ties the object to the room.",
        "The blind carries an orange figure at full height. The vertical strips in that image come from the blind, not from the video, which sets the scale.",
        "Each work is its own clip on its own surface, so the room reads as a set of objects rather than as one image across the space.",
        "House lights stayed low and the track heads were dimmed during playback, so the projected colour held its own value.",
        "A playback check ran before opening: every clip, its in point, and its surface."
      ],
      result: [
        "Two runs: St. Edward's University in February 2025, then Ponte Creative Studio & Gallery in McAllen, 15 August to 16 October 2025.",
        "Six works in the McAllen show, one more than the first run. The room maps a bed, a wall, a sink, a basin, and a window blind.",
        
        
        "Chrome reports zero console errors at 1440 x 900 and 390 x 844."
      ],
      credits: [
        { role: 'Artist', name: 'Victoria Cantu, they/them (myonlinebedroom.com, @onlinebedroom)' },
        { role: 'Technical setup and projection mapping, McAllen staging', name: 'Juan Licerio' },
        { role: 'Works', name: "Forget-me-not, Entre Mundos, Sueños Rosas, 'Til Death Do Us Part, Tender Cuts" },
        { role: 'First run', name: "St. Edward's University, February 2025. Photographs by Brian Fitzsimmons" },
        { role: 'Second run', name: 'Ponte Creative Studio & Gallery (Trucha RGV), 1305 N Main St, McAllen. 15 August to 16 October 2025' },
        { role: 'Press', name: 'Trucha cover. Photographs Laura Martinez (@acidhaivisuals). Story Abigail Vela. Edited by Santana Peralez and Nina Alegre' },
        { role: 'Support, first run', name: 'The City of Austin Economic Development Department' },
        { role: 'Press, McAllen', name: 'MyRGV, 18 August 2025. Francisco E. Jimenez, photographs Joel Martinez. Gallery run by Trucha RGV' },
        { role: 'McAllen stills', name: 'Photographer unconfirmed. Image rights stay with the artist and the photographer' }
      ],
      images: [
        { src: img('assets/images/projects/forget-me-not/hero.jpg'), alt: 'A bed with a blue flora loop projected onto the sheet', caption: 'Bed with a blue flora loop. The sheet is the surface.' },
        { src: img('assets/images/projects/forget-me-not/process.jpg'), alt: 'A window blind carrying an orange figure at full height', caption: 'Window blind with an orange figure at full height.' },
        { src: img('assets/images/projects/forget-me-not/detail.jpg'), alt: 'A sink with projection spilling onto the wall and floor', caption: 'Sink scene: wall, floor, and basin in one map.' },
        { src: img('assets/images/projects/forget-me-not/extra.jpg'), alt: 'A basin lit by a circular projection on the wall behind it', caption: 'Basin and wall disc, one map across two surfaces.' }
      ]
    }
  },

  triqueta: {
    year: '2023',
    summary: 'AR poster designs, a VR scene built from Michael Flanagan\'s video works, and an immersive installation at the McAllen Creative Incubator.',
    image: 'assets/images/projects/triqueta/hero.jpg',
    caseStudy: {
      brief: "Triqueta ran at the McAllen Creative Incubator in McAllen, Texas. The showcase carried AR poster designs, a VR experience, audio-visual installation, and generative digital art by regional artist and designer _selfsimilar_. Michael Flanagan's paintings and films were the collaborating body of work: his paintings took the AR overlays and his video became the VR scene. My part was development rather than authorship: build the technical layer that lets painted work be entered by a headset and by a phone, without the two reading as separate shows.",
      process: [
        "The work started from Flanagan's existing paintings and video, not from a new image.",
        "Each painting carried an AR overlay. The overlays include AI-generated elements, which sit over the painted surface rather than replacing it.",
        "The VR scene was built in Unreal and holds Flanagan's video works. A visitor in the headset sees the footage as the room, not as a screen on a wall.",
        "Tracking used printed markers fixed to the wall beside each work. The reel shows a marker next to the poster it registers.",
        "The overlays read as objects in the room, not as flat images. A dome sits in front of its poster and casts a shadow; slabs float off a wall.",
        "The phone build and the headset build share one visual vocabulary, so a visitor who only uses the phone still reads the same project.",
        "The room held three kinds of work at once: the AR posters, the headset station, and the generative and audio-visual installation."
      ],
      result: [
        "Two modes in one room: AR on posters in a phone view, and a VR scene on a headset.",
        "Venue: McAllen Creative Incubator, 601 N Main St, McAllen, Texas.",
        "Stills are cut from the exhibition reel: 90 seconds at 720 x 1280.",
        
        "Chrome reports zero console errors at 1440 x 900 and 390 x 844."
      ],
      credits: [
        { role: 'Paintings and films', name: 'Michael Flanagan' },
        { role: 'AR, VR, and show design', name: 'Juan Licerio (_selfsimilar)' },
        { role: 'Engine', name: 'Unreal Engine for the VR build' },
        { role: 'Venue', name: 'McAllen Creative Incubator, McAllen, Texas' },
        { role: 'Reel', name: '90 seconds, 720 x 1280, hosted on the Behance CCV player. Filmmaker unconfirmed' },
        { role: 'Year and run dates', name: '2023. Run dates and painting count unconfirmed' }
      ],
      images: [
        { src: img('assets/images/projects/triqueta/hero.jpg'), alt: 'A visitor standing in the gallery wearing a VR headset and holding controllers', caption: 'Visitor in the VR scene, in the gallery.' },
        { src: img('assets/images/projects/triqueta/process.jpg'), alt: 'A visitor holding a phone that shows the AR poster view', caption: 'Phone build in use on the show floor.' },
        { src: img('assets/images/projects/triqueta/detail.jpg'), alt: 'Yellow slabs and a red plane floating in front of a brick wall with shadows', caption: 'AR slab field over the brick wall.' },
        { src: img('assets/images/projects/triqueta/extra.jpg'), alt: 'A poster with a violet circle and a dark dome overlay sitting in front of it, a printed marker on the wall beside it', caption: 'AR dome anchored to a poster, marker on the wall.' }
      ]
    }
  },

  'river-pierce': {
    year: '2025',
    summary: 'A commissioned AR project for the River Pierce Foundation: a library of Carrizo Comecrudo objects and an 1871 San Ygnacio inscription.',
    image: 'assets/images/projects/river-pierce/hero.jpg',
    caseStudy: {
      brief: "The River Pierce Foundation commissioned an augmented reality project for its 2025 program at the Treviño–Uribe Rancho. The piece debuted on 10 May 2025 as the closing item of The Teaching of the Hands: a free screening of Carolina Caycedo and David de Rozas' documentary, then a panel with Carrizo Comecrudo representatives, then the AR at 3 pm. The content is specific to the place. Each object in the piece carries a panel that names its role in Carrizo Comecrudo practice, and a second reel sets the piece in San Ygnacio with a stone inscription dated 3 December 1871.",
      process: [
        "The brief was the place. San Ygnacio sits on the Rio Grande, and the rancho is a historic building held by the foundation under a Mellon Foundation Humanities in Place grant.",
        "The content is interpretive rather than decorative. The bison skull is described as a symbol of life, sustenance, and respect, and the panel says the animal was not as central to Carrizo daily survival as it was for Plains cultures.",
        "The bear carries its own panel: animals are treated as relatives and sources of strength, and bear skins are worn in a Carrizo Comecrudo ceremony called the Bear Dance.",
        "The poles are named Xie Kua'k Kua̲m. The panel ties them to the four directions and to ceremonial use by the Carrizo.",
        "A peyote cactus sits with a panel that quotes a peyote ceremony account and names Esto'k Gna culture.",
        "The second reel sets five purple glyph discs above a bilingual inscription: La paz de Cristo sea con nosotros, 3 December 1871, S. Ygnacio ruega por nosotros.",
        "The program fixed the schedule: screening at 1 pm, panel at 2 pm, AR debut at 3 pm, food by Malaquite at 3 pm.",
        "The event was free and open to the public, so a visitor with no appointment had to be able to take part."
      ],
      result: [
        "Two AR asset reels: 15.0 seconds at 1208 x 720, and 67.7 seconds at 1280 x 662.",
        "Four objects and one inscription in the reels: bison skull, bear, prayer poles, peyote cactus, and the 1871 San Ygnacio text.",
        "One commissioned AR piece, debuted 10 May 2025 in the 3 to 4 pm slot.",
        "Venue: Treviño–Uribe Rancho, 604 Trevino St, San Ygnacio, TX 78067.",
        
        "Chrome reports zero console errors at 1440 x 900 and 390 x 844."
      ],
      credits: [
        { role: 'Commission', name: 'The River Pierce Foundation' },
        { role: 'AR artist', name: 'Juan Carlos Licerio' },
        { role: 'Program', name: 'The Teaching of the Hands, 10 May 2025, 1 to 4 pm, free and open to the public' },
        { role: 'Film', name: 'Carolina Caycedo and David de Rozas' },
        { role: 'Panel', name: 'Juan Mancias, Christa Mancias, Dr. Christopher Basaldú, Bekah Hinojosa' },
        { role: 'Support', name: 'Mellon Foundation Humanities in Place Grant; Laredo Film Society' },
        { role: 'Culinary concept', name: 'Malaquite' },
        { role: 'Source text', name: 'The interpretation panels inside the reels' },
        { role: 'Reel filmmaker, marker count, attendance', name: 'Unconfirmed' }
      ],
      images: [
        { src: img('assets/images/projects/river-pierce/hero.jpg'), alt: 'A bison skull between two grey interpretation panels on a white floor', caption: 'Bison skull between its two panels.' },
        { src: img('assets/images/projects/river-pierce/process.jpg'), alt: 'Prayer poles, a panel, and a flowering peyote cactus', caption: "Xie Kua'k Kua̲m prayer poles and a peyote cactus." },
        { src: img('assets/images/projects/river-pierce/detail.jpg'), alt: 'Five purple glyph discs above a bilingual inscription panel', caption: 'Five glyph discs above the 1871 San Ygnacio inscription.' },
        { src: img('assets/images/projects/river-pierce/poster.jpg'), alt: 'Event poster for The Teaching of the Hands with the AR slot at 3 pm', caption: 'Event poster, 10 May 2025. The AR slot sits at 3 to 4 pm.' }
      ]
    }
  },

  motion: {
    year: '2022',
    summary: 'Self-set motion graphics studies in After Effects, Photoshop, and Blender: abstract form, procedural animation, and type built from repeating marks.',
    image: 'assets/images/projects/motion/hero.jpg',
    caseStudy: {
      brief: "Motion is a file of self-set studies, not a commission. Each study takes one visual idea and pushes it until the motion breaks: abstract form, procedural movement, and type drawn from repeating marks. The tools were After Effects, Photoshop, and Blender. There was no client brief and no delivery date. The point was to test a technique at speed and keep the result, so the file grew as a set of experiments rather than a body of finished work.",
      process: [
        "Each study opens with one form or one rule, not with a finished frame.",
        "Type and shape were built in After Effects or Blender, then finished in Photoshop for grain and print texture.",
        "The surviving still shows the method: a thin wave line sits above a letterform that fills from the top with a striped field, then turns into a dot grid at the base.",
        "The work is designed as a loop, so the first and last frame have to match before the study counts as done.",
        "The same form was reused at different densities, which is how one idea produced a short series rather than a single frame.",
        "The export is a still. No loop survives in the project file today, so the case shows the still only."
      ],
      result: [
        "One exported still survives in the project file. The number of studies in the set is unconfirmed.",
        "The source still is 720 x 540 pixels and 209 KB on disk, at assets/images/motion.png.",
        "The three case images, the still and two detail crops, total 430 KB.",
        
        
        "Chrome reports zero console errors at 1440 x 900 and 390 x 844."
      ],
      credits: [
        { role: 'Work', name: 'Juan Licerio' },
        { role: 'Tools', name: 'After Effects, Photoshop, Blender' },
        { role: 'Year', name: '2022' },
        { role: 'Study count and run dates', name: 'Unconfirmed' }
      ],
      images: [
        { src: img('assets/images/projects/motion/hero.jpg'), alt: 'Dithered white wave and letterform on a black field', caption: 'Wave and letterform, exported still.' },
        { src: img('assets/images/projects/motion/process.jpg'), alt: 'Detail crop: the wave line above the filled letterform', caption: 'Detail: the wave line and the top of the striped fill.' },
        { src: img('assets/images/projects/motion/detail.jpg'), alt: 'Detail crop: the dot grid at the base of the letterform', caption: 'Detail: the dot grid at the base.' }
      ]
    }
  },

  '9ine5ive6eis': {
    year: '2023',
    summary: 'Visual identity for a limited apparel release: one cloud plate, a three-line lockup, a tee and a tote layout, and a brand motion loop.',
    image: 'assets/images/projects/9ine5ive6eis/hero.jpg',
    caseStudy: {
      brief: "9ine5ive6eis releases apparel in series, and each drop takes its own identity. This assignment covered one release: a cloud graphic, custom typography, a layout for a tee and a tote, and a motion loop for the brand. The run was limited. Other artists shot the product photography, so the identity had to survive their framing rather than a studio setup of our own.",
      process: [
        "The image is one sky photograph, cropped as a square plate. The plate is the whole graphic, with no second element and no frame.",
        "The type is a three-line stack: 9INE, 5IVE, 6EIS, set wide and set small so it reads as a caption rather than a headline.",
        "On the tee the plate sits at chest height and the type stays out. On the tote the plate runs the full width and the type sits inside the cloud at the lower right.",
        "Both products are white, so the plate had to hold without a border to separate it from the garment.",
        "A motion loop carried the same mark for the brand and ran beside the drop.",
        "Product photography by other artists placed the pieces in daylight, on a skateboard and on a rooftop, which tested the plate against direct sun and moving cloth."
      ],
      result: [
        "Two products in the run: a white tee and a white tote.",
        "One three-line lockup, used at two scales.",
        
        "One motion loop and one Instagram reel for the release.",
        "Six product stills survive in the project file, from 130 KB to 660 KB each.",
        "Chrome reports zero console errors at 1440 x 900 and 390 x 844."
      ],
      credits: [
        { role: 'Identity, graphic, and motion', name: 'Juan Licerio' },
        { role: 'Product photography', name: 'Other artists on the release (names unconfirmed)' },
        { role: 'Client', name: '9ine5ive6eis' },
        { role: 'Year', name: '2023' }
      ],
      images: [
        { src: img('assets/images/projects/9ine5ive6eis/hero.jpg'), alt: 'A person sitting on a skateboard wearing the cloud tee', caption: 'Tee in daylight, shot by another artist on the release.' },
        { src: img('assets/images/projects/9ine5ive6eis/process.jpg'), alt: 'Flat lay of the white cloud tee', caption: 'Flat lay: the plate at chest height, type left out.' },
        { src: img('assets/images/projects/9ine5ive6eis/detail.jpg'), alt: 'Detail of the tote with the three-line lockup inside the cloud', caption: 'Tote detail: the lockup inside the cloud.' },
        { src: img('assets/images/projects/9ine5ive6eis/extra.jpg'), alt: 'Three-image product collage from the release', caption: 'Product collage placed by the photography team.' }
      ]
    }
  },

  'tigers-blood': {
    year: '2023',
    summary: 'A commissioned 3D animation of a static 2D logo, finished with a frosted metal material, analog video artefacts, and a print still for the 2023 show syllabus.',
    image: 'assets/images/projects/tigers-blood/hero.jpg',
    caseStudy: {
      brief: "Tigers Blood had a flat 2D logo and a 2023 season to promote. The commission was a moving version of that mark: convert the artwork to 3D, give it a material that reads as metal under a bad signal, and keyframe a move that holds attention in a feed and on a poster. The finished animation ran with the show syllabus for the Rio Grande Valley dates, and the same geometry was shot as a print.",
      process: [
        "The 2D lettering was rebuilt as 3D geometry, keeping the hand-drawn spacing of the original rather than setting it in a typeface.",
        "The glyphs sit on a ring instead of a baseline, so the mark can rotate without losing the word.",
        "The material is a frosted metal with heavy grain. Highlights break up at the edges, which gives the lo-fi chromotype look.",
        "The move is keyframed: a slow orbit that settles, with a small vibration on the settle so the mark never looks still.",
        "A video pass adds analog artefacts: scan lines, chroma offset, and a soft edge.",
        "The same geometry appears on burnt paper in the photograph of the printed sheet, so the animated and printed marks share one shape.",
        "The clip and the printed sheet were produced separately."
      ],
      result: [
        "One animated mark, one digital syllabus still, and one burnt-paper print, all carrying the same mark.",
        "The 2023 syllabus still, 01.jpg at 720 x 1280, lists six dated entries across four venues: McAllen Convention Center, McAllen PAC, The Gremlin, and Cine El Rey.",
        "02.jpg is a burnt-paper print at 1080 x 1350, listing seven dated entries: six at The Gremlin and one at Cine El Rey.",
        "The animated mark is a hosted player clip at 1080 x 1080; its poster frame is assets/images/clips/IdbY_pPbY9G.jpg. No video file is stored in the repo.",
        "Chrome reports zero console errors at 1440 x 900 and 390 x 844."
      ],
      credits: [
        { role: '3D, material, and animation', name: 'Juan Licerio' },
        { role: 'Client', name: 'Tigers Blood' },
        { role: 'Year', name: '2023' },
        { role: 'Venue list', name: 'From the 2023 show syllabus in the project file' }
      ],
      images: [
        { src: img('assets/images/projects/tigers-blood/hero.jpg'), alt: 'The 3D Tigers Blood mark over the 2023 show syllabus', caption: 'The animated mark on the 2023 syllabus frame.' },
        { src: img('assets/images/projects/tigers-blood/process.jpg'), alt: 'The same mark printed in black on burnt paper on a wooden table', caption: 'The same geometry as a print, burned at the edges.' },
        { src: img('assets/images/projects/tigers-blood/detail.jpg'), alt: 'Detail of the burnt print showing the mark and dates', caption: 'Detail: the mark and the date list on burnt paper.' }
      ]
    }
  },

  'collapsed-timelines': {
    title: 'Collapsed Timelines In Felicitous Space',
    year: '2022',
    summary: 'Technical setup for C. Díaz\'s 2022 exhibition at the McAllen Creative Incubator: four-channel video, a projected film, and a bilingual wall text.',
    description: 'Technical setup for the exhibition at the McAllen Creative Incubator. The show paired a projected film with a four-channel video installation on monitors and a bilingual wall text, all inside a brick gallery with a low ceiling.',
    image: 'assets/images/projects/collapsed-timelines/hero.jpg',
    tools: 'Four-channel video playback, monitors on plinths, projection alignment',
    caseStudy: {
      brief: "Collapsed Timelines In Felicitous Space ran from 4 to 26 March 2022 at the McAllen Creative Incubator, 601 N Main St, McAllen. C. Díaz built the show around California landscapes and geographical memory: the film Sacred Landscapes: The Arroyo Seco, the four-channel video installation Compressed Time, and the painting Body Landscapes No. 1. My part was the technical setup: four channels of playback on monitors, the projection, and the wall text that frames the room.",
      process: [
        "The show carried two video paths at once. One film played on the hanging screen, and Compressed Time ran across four monitors as a set rather than a mirror of one source.",
        "Four channels need four sources and four start points, so the monitors were set up as separate players with a sync check before opening.",
        "The monitors sit on white cylindrical plinths along the brick wall, with the cable runs on the floor behind them. That keeps the screens at seated eye height and leaves the floor clear.",
        "The wall carries a bilingual projection of the film notes in Spanish and English. It is the first text a visitor reads on entering.",
        "The projection was aligned to the screen and to the wall, then checked again with the house lights at event level.",
        "The show closed on 26 March with a dialogue with sound artist Jon Almaraz and a deep listening session in the same room, so the space had to work as a screening room and as a listening room."
      ],
      result: [
        "Four channels of Compressed Time on four monitors, one projected film, and one bilingual wall text in a single room.",
        "Run: 4 to 26 March 2022 at the McAllen Creative Incubator, 601 N Main St, McAllen, TX 78501.",
        "Three works in the show: Sacred Landscapes: The Arroyo Seco, Compressed Time, and Body Landscapes No. 1.",
        
        "Chrome reports zero console errors at 1440 x 900 and 390 x 844."
      ],
      credits: [
        { role: 'Artist', name: 'C. Díaz' },
        { role: 'Technical setup', name: 'Juan Licerio' },
        { role: 'Works', name: 'Sacred Landscapes: The Arroyo Seco (film), Compressed Time (four-channel video, diary entries 2014 to 2020), Body Landscapes No. 1 (painting)' },
        { role: 'Venue and dates', name: 'McAllen Creative Incubator, 4 to 26 March 2022' },
        { role: 'Closing event', name: 'Jon Almaraz, dialogue and deep listening session, 26 March 2022' },
        { role: 'Photographs', name: 'Trucha, Spid (@spidspill), and stills from Compressed Time, credited by the artist. Rights unconfirmed' },
        { role: 'Show notes', name: 'English and Spanish PDFs on cdiaz.cargo.site' }
      ],
      images: [
        { src: img('assets/images/projects/collapsed-timelines/hero.jpg'), alt: 'Four monitors on white cylindrical plinths along a brick wall, with a bilingual projection beyond', caption: 'Four channels on plinths, with the wall text beyond.' },
        { src: img('assets/images/projects/collapsed-timelines/process.jpg'), alt: 'A visitor seated in silhouette in front of the projected film Sacred Landscapes', caption: 'The single-channel film on the hanging screen.' },
        { src: img('assets/images/projects/collapsed-timelines/detail.jpg'), alt: 'The opening: a seated audience in front of the projected film, monitors visible at right', caption: 'Opening, 4 March 2022. Monitors sit at right.' }
      ]
    }
  },

  archived: {
    year: '2022–2026',
    summary: 'One index for every study on the site, 2022 to 2026, with a link to each live page.',
    description: 'Older studies and experiments, kept as a record. This page indexes every study on the site by year and links each one to its live page and case study.',
    image: 'assets/images/projects/archived/hero.jpg',
    caseStudy: {
      brief: "This page indexes the studies on the site in one place. It covers 2022 to 2026 and links each entry to its page. The hub exists because the work index only carries the current rotation, so older pieces would otherwise have no route in. Nothing here is a new piece. The value is the map: eleven studies, four years, one link per study, and no dead ends.",
      process: [
        "Every entry is a project already on the site. No image on this page is new.",
        "Rows are grouped by year, newest first: 2026, 2025, 2023, and 2022.",
        "Each row carries a number, a title, a one-line summary, the discipline, the year, and a thumbnail.",
        "The list is static HTML, so it reads without JavaScript and without the site data file.",
        "Rows reuse the work-index component from the Work page, so the type scale, the hover state, and the thumbnail crop match the rest of the site.",
        "A study is added with a record in the site data file, a page from the shared shell, and a row in this list, so the three stay in step by review rather than by build.",
        "The cover photograph is a gallery wall of framed works from the archive. The venue is unconfirmed.",
        "Six clips from the archived pieces sit above the index, each with a poster frame. The player loads only when a clip is pressed.",
        "The page follows the same heading, description, and case-block layout as every other study page."
      ],
      result: [
        "Eleven studies indexed: three from 2026, three from 2025, three from 2023, and two from 2022.",
        "Year range 2022 to 2026, read from the project records.",
        
        
        "Chrome reports zero console errors at 1440 x 900 and 390 x 844."
      ],
      credits: [
        { role: 'Work', name: 'Juan Licerio' },
        { role: 'Cover photograph', name: 'Gallery wall from the archive. Venue unconfirmed' },
        { role: 'Years', name: '2022 to 2026, from the project records' }
      ],
      images: [
        { src: img('assets/images/projects/archived/hero.jpg'), alt: 'Three framed works on a painted brick gallery wall', caption: 'Gallery wall from the archive.' },
        { src: img('assets/images/projects/archived/process.jpg'), alt: 'Two framed prints on the brick wall, detail crop', caption: 'Detail: the left and centre prints in the wall hang.' },
        { src: img('assets/images/projects/archived/detail.jpg'), alt: 'Pink objects on a green table under the painted brick wall', caption: 'Detail: the objects on the table below the hang.' }
      ]
    }
  }
};

const quiet = (items = []) => items.filter((line) => !/^(Chrome reports|Zero console errors)/i.test(String(line).trim()));

let changed = 0;
for (const project of site.projects) {
  const update = studies[project.id];
  if (!update) continue;
  if (update.title) project.title = update.title;
  if (update.year) project.year = update.year;
  if (update.summary) project.summary = update.summary;
  if (update.description) project.description = update.description;
  if (update.image) project.image = update.image;
  update.caseStudy.result = quiet(update.caseStudy.result);
  project.caseStudy = update.caseStudy;
  changed += 1;
}

writeFileSync(file, JSON.stringify(site, null, 2) + '\n');
console.log('updated ' + changed + ' projects');
