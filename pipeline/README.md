# Study Engine Pipeline

This pipeline turns one reference into one shipped study and one written case study.
It uses the site data file as the only content source.

## Stages

| Stage | Output | Gate |
| :--- | :--- | :--- |
| 0. Board | Component board or mood board in `labs/embed/` | Every component named, every rule written, one seed fixed |
| 1. Reference | Three claims from the board | One reference and one target image |
| 2. Concept | Premise, interaction, palette, budget | One sentence and one interaction |
| 3. Build | Study page under `labs/embed/` | Runs with no console error |
| 4. Verify | Screenshots and report | 1440x900 and 390x844 pass |
| 5. Case study | Brief, process, result, credits | Three images and one measured result |
| 6. Ship | Live URL | User approval, then remote fetch |

## The board gate

Every study starts with a board, not with a build. The board is a bento page of components drawn from the systems we have studied: Generative Gestaltung for rule-based modules, Flexible Visual Systems for components and operators, the Refik corpus method for data and provenance.

A board passes when all five are true:

1. It holds 6 to 12 components, each in its own cell.
2. Each cell prints its rule in one line, with the parameters named.
3. One seed is fixed and printed, and the board reproduces exactly from it.
4. At least three components come from a studied system, with that system named in the caption.
5. It runs at 1440x900 and 390x844 with no console error.

The product is then assembled from the board: a study picks components, not styles. Two worked examples: `labs/embed/component-board.html` and `labs/embed/forms-3d.html`.

## How Flexible Visual Systems fits the board

The board and FVS do different jobs, and both are needed.

- **The board is the inventory.** It lists the parts and writes down each rule. It answers "what exists".
- **FVS is the grammar.** It names the base form, the operators, and the parameter ranges, and it requires a series. It answers "how do the parts combine and vary".

| FVS role | Where it lives in a board | Example in `component-board.html` |
| :--- | :--- | :--- |
| Base form, held constant | One cell that never changes across outputs | 04 biomorphic outline |
| Operator | A transformation applied to the base | 02 resonance (combine), 05 division, 03 orbit |
| Parameter with a range | A value with a min and a max | 01 harmonic amplitudes, 09 sweep |
| Grid or field | The layout rule | 05 disc grid, 06 ramp |
| Surface treatment | How the form is rendered | 06 dither, 07 ASCII |
| Colour system | Palette as a parameter set | 08 combinations |
| Series | The same rule at N parameter steps | 09 harmonic series |

Three things FVS demands that a board alone does not:

1. **One base form stays constant.** If every cell is free, there is no identity, only a collection.
2. **Operators are named and bounded.** Turn 4 x 90 degrees, mirror, scale 6 x 0.13, shear plus or minus 20 degrees, field 4 x 4. A new output is then a decision, not a mood.
3. **A series, with a stop rule.** At least three valid variants, and a stated reason to stop when variation stops carrying meaning.

Worked pattern already in the repo: Quarter Turn. Base form is a quarter disc at radius 0.55; six operators; four outputs from one JSON file. The component board supplies the modules for the next one; FVS supplies the operator list.

## When generation joins FVS

Three layers, each with one job:

```mermaid
flowchart LR
  B[Board<br/>parts and rules] --> F[FVS<br/>base form, operators, ranges]
  F --> G[Generation<br/>seed, noise, phase]
  G --> S[Series<br/>N outputs, curated]
  S --> C[Case study<br/>measured, reproducible]
```

| Layer | Owns | Does not own |
| :--- | :--- | :--- |
| Board | Which components exist | How they vary |
| FVS | The base form, the operator list, the bounds | Which value a given output takes |
| Generation | The value, from a seed | The bounds, or the operator list |

The division of labour is the whole point:

- **FVS without generation** produces only the outputs a person can produce one at a time. Nothing here is drawn by hand, so the real limit is how many variants the system is asked for, not hours.
- **Generation without FVS** produces range without identity. Every output is a new accident.
- **Together** the designer writes the operator set and the bounds once, the seed draws a valid output every time, and the designer curates. Identity stays, range multiplies.

Four rules follow, and they belong in the board gate:

1. **Generation never sets a bound.** It only picks a value inside a bound that FVS wrote down.
2. **Every output is reproducible.** Seed in, same output out. The seed is printed on the piece.
3. **The series is curated, not exhausted.** Ship three to six chosen outputs from the draws, not all of them.
4. **One operator list, many subjects.** Change the base form, keep the operators. That is how one system covers a poster, a loop, a print, and an AR placement.

Worked example already in the repo: Quarter Turn holds the operator list (turn, mirror, scale, shift, shear, field) with explicit ranges in a 1,344-byte JSON. Add a seed and a noise field and the same file draws an unlimited series.

## Two modes of work

Every component in this practice is computational: a three.js module, a Blender node graph, or a parametric vector file. Nothing is drawn by hand. That changes what FVS is doing in each mode.

| Mode | What is fixed | What the system produces | FVS role |
| :--- | :--- | :--- | :--- |
| **Procedural practice** | The operator list and the bounds | A series of outputs from one base form | The order that keeps generation from becoming chaos |
| **Identity and branding** | The mark, the reproduction limits, the clear space, the one-colour version | A family that stays legible around that fixed mark | The constraint set: it decides what may vary and what may not |

The rule for both: **the constraints are written down before the first output.** In procedural work the constraints are the operator ranges and the seed. In identity work they are also external: client limits, minimum sizes, single-colour reproduction, motion limits, and the mark itself.

A constraint ledger belongs in every identity board:

- Elements that cannot change: the mark, the wordmark, the spacing.
- Elements that may change: rotation, field, texture, palette, motion.
- Hard limits: minimum size in mm, single-colour reproduction, contrast floor, file formats.

When the constraints are absent, the board is a mood. When they are written down, the board is a system.

## Commands

```bash
# Verify a study at desktop and phone width.
node pipeline/verify.mjs --slug viscous-orb \
  --url http://127.0.0.1:8142/projects/viscous-orb.html

# Verify at three sizes and set a frame budget.
node pipeline/verify.mjs --slug viscous-orb \
  --url http://127.0.0.1:8142/projects/viscous-orb.html \
  --sizes desktop:1440x900,phone:390x844,portrait:1350x1800 --min-fps 55

# Check a page with no canvas (video or static page).
node pipeline/verify.mjs --slug surveillance-status \
  --url http://127.0.0.1:8142/projects/surveillance-status.html --page

# Build the status table.
node pipeline/status.mjs
```

Add `--full` to capture the whole page height. Use it to check a case study below the fold.

## Artifacts

- `pipeline/reports/<slug>.json` holds the last verification result.
- `pipeline/reports/<slug>/*.png` holds the screenshots.
- `pipeline/status.md` holds the current stage of every project.
- `data/site.json` holds the case study text and credits.

Reports are local artifacts. `.gitignore` keeps them out of the repository.

## Case study fields

```json
"caseStudy": {
  "brief": "One paragraph. The problem and the constraint.",
  "process": ["Step one.", "Step two.", "Step three."],
  "result": ["Measured result one.", "Measured result two."],
  "credits": [{"role": "Design and code", "name": "Juan Licerio"}]
}
```

## Rules

- Use measured numbers. Do not write "fast" or "smooth".
- Name the tool, the frame budget, and the input.
- Credit every collaborator and every library licence.
- Do not mark a study shipped before a remote fetch succeeds.

## Flow

```mermaid
flowchart LR
  A[Reference] --> B[Concept]
  B --> C[Build]
  C --> D[Verify]
  D -->|fail| C
  D -->|pass| E[Case study]
  E --> F[User approval]
  F --> G[Deploy]
  G --> H[Remote fetch]
```
