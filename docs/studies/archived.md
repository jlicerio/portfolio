# Archived Works — Index Hub

**Brief.** This page indexes the studies on the site in one place. It covers 2022 to 2026 and links each entry to its page. The hub exists because the work index only carries the current rotation, so older pieces would otherwise have no route in. Nothing here is a new piece. The value is the map: ten studies, four years, one link per study, and no dead ends.

**Process.**

1. Every entry is a project already on the site. No image on this page is new.
2. Rows are grouped by year, newest first: 2026, 2025, 2023, and 2022.
3. Each row carries a number, a title, a one-line summary, the discipline, the year, and a thumbnail.
4. The list is static HTML, so it reads without JavaScript and without the site data file.
5. Rows reuse the work-index component from the Work page, so the type scale, the hover state, and the thumbnail crop match the rest of the site.
6. A study is added by one record in the site data file and one page built from the shared shell, so the index cannot drift from the work page.
7. The cover photograph is a gallery wall of framed works from the archive. The venue is unconfirmed.
8. The page follows the same heading, description, and case-block layout as every other study page.

**Result.**

- Runs at 60.9 fps at 1440 x 900 and 60.2 fps at 390 x 844 in headless Chrome 156.
- Ten studies indexed: three from 2026, three from 2025, three from 2023, and one from 2022.
- Year range 2022 to 2026, read from the project records.
- The page is 9.9 KB of static HTML, and the three case images total 230 KB.
- The index and the Work page read from the same records, so a study cannot appear in one and not in the other.
- Chrome reports zero console errors at 1440 x 900 and 390 x 844.

**Credits.**

- Work: Juan Licerio
- Cover photograph: Gallery wall from the archive. Venue unconfirmed
- Years: 2022 to 2026, from the project records

Page: `projects/archived.html`. Verified report: `pipeline/reports/archived.json`.
