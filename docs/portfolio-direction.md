# Portfolio Direction

Evidence date: 31 October 2026.

Sources: 12 Awwwards portfolio winners, 8 It's Nice That features, 8 Motion Design Awards winners.
The full reports sit in the Project Studio workspace under `research/`.

## Decision

Keep the WebGPU worlds. They are the differentiator.
Change their role: they become a numbered index, not a hidden demo.
Add one case study template. Use it for every project.

## Benchmarks

| Signal | Benchmark | Current site |
| :--- | :--- | :--- |
| Work items on the index | 6 to 19 | 9 |
| Case study length | 306 to 1123 words | 120 words |
| Images per case | 4 to 20 | 1 cover |
| Labeled case sections | 2 to 8 | 0 |
| Top-level nav items | 3 to 4 | 3 |
| Display type | 72 to 264 px | 160 px |
| Body type | 14 to 18 px | 18 px |
| Label type | 10 to 13 px | 11 px |
| Motion systems | one scroll, one cursor, one transition | four world loops |
| Sound | off by default | none |

## Case study shape

Use six sections. Target 500 to 900 words and 6 to 10 images.

1. Result line. One sentence with a measured number.
2. Brief. The constraint, in 60 to 90 words.
3. Method. Three to six steps. Name one tool step and one failed route.
4. Evidence. Stills at the real frame size. Caption each one.
5. Recognition. Award, show, client, or none.
6. Credits. Person, role, library, licence.

## Motion budget

Keep one scroll model, one pointer change, one page transition, and one preloader under two seconds.
Start sound off. Give the visitor a sound control.
Use posters for every video.

## Study slate

| Study | Medium | Role | Stage |
| :--- | :--- | :--- | :--- |
| Viscous Orb | WebGL2 fluid | Entry world | Case study written |
| Fluid Ramp | WebGPU MLS-MPM | Wide hero | Study built |
| Caustic Volume | WebGL2 caustics | Object study | Study built |
| Warp and Weft | WebGPU meadow | Existing world | Case study missing |

## Production order

```mermaid
flowchart LR
  A[Reference] --> B[Study brief]
  B --> C[Build]
  C --> D[Verify]
  D -->|fail| C
  D -->|pass| E[Case study]
  E --> F[Slate review]
  F --> G[User approval]
  G --> H[Deploy]
```

## Next three moves

1. Write the Warp and Weft case study. It already has a live embed and a cover.
2. Add Fluid Ramp as the fifth world. It fills the hero width and holds 56.8 fps.
3. Record a 30 second reel. Use three cuts: hook, main, long.
