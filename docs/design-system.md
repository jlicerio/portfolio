# Design System

Use this file before a new page, component, or builder task.
The live values come from `style.css` and `labs/live.css`.

## Colour

| Token | Dark | Light | Use |
| :--- | :--- | :--- | :--- |
| `--bg` | `#07080a` | `#f2f0ec` | Page background |
| `--ink` | `#f2f0ec` | `#07080a` | Text and rules |
| `--muted` | `#a8a4ad` | `#5f5d62` | Labels and secondary copy |
| `--line` | `rgba(242,240,236,.22)` | `rgba(7,8,10,.22)` | Borders |
| `--soft` | `rgba(242,240,236,.08)` | `rgba(7,8,10,.08)` | Image beds and hover fill |

Do not add a new hue to the site chrome.
Study palettes stay inside the study frame.

## Type

| Role | Family | Size | Notes |
| :--- | :--- | :--- | :--- |
| Display | Space Grotesk | clamp(3rem, 8vw, 6rem) | Hero |
| Page title | Space Grotesk | clamp(4rem, 10vw, 10rem) | Work and project pages |
| Row title | Space Grotesk | clamp(1.5rem, 3vw, 3rem) | Work index |
| Body | Space Grotesk | 16 to 20 px | Line height 1.45 to 1.55 |
| Label | DM Mono | 11 px | Letter spacing .06 to .1em |
| Caption | DM Mono | 11 px | Line height 1.5 |

Use two families only. Use uppercase for labels, never for long body text.

## Layout

- Content width: 1440 px maximum.
- Gutters: 4vw on each side.
- Section separation: one 1 px rule, then 25 px to the label.
- Work index: number, title and summary, discipline, year, preview.
- Project page order: heading, live stage, about, case study, gallery, links.

## Components

### Header

Wordmark left. Work, CV, Contact, and the theme toggle right.
Keep the theme choice in localStorage under `jlicerio-theme`.

### Hero worlds

Four worlds, one active iframe. Each world needs a title, a medium, and a link to its case.
Keep the scrim. Keep the pause control. Stop motion under reduced-motion.

### Work index row

Desktop: five columns with a reserved preview lane. The image appears on hover and focus.
Phone: an 88 px thumbnail, then title, discipline, year, and summary.
Focus must be visible without hover.

### Live stage

Full width on desktop at 16:10, capped at 82svh. Phone uses 3:4.
The iframe fills the stage. The study owns its own canvas size.

### Case study

Four blocks: Brief, Process, Result, Credits.
Then a gallery. Captions use a two-digit number and one sentence.
Target 300 to 900 words. Every result needs a measured number.

### Gallery

Auto-fit columns at 260 px minimum. Images use 4:3 with `object-fit: cover`.
Caption every image. Name the frame size and the moment.

## Motion

- Hover: 200 ms ease.
- World change: 850 ms opacity.
- No decorative loader.
- Reduced motion: no auto movement, no veil animation, keep a still frame.
- Pause must stop the artwork, not only the carousel.

## Content rules

- One sentence per idea. No skill graphs.
- Credit every collaborator, asset, and library.
- Mark an unstated licence as unstated.
- Use measured numbers from `pipeline/reports/`.
- Do not call a study live before a remote fetch.
