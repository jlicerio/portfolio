# Jlicerio Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and publish a monochrome, Hypergraphia-inspired personal portfolio from the Desktop archive.

**Architecture:** Use a static HTML site with a shared stylesheet and small JavaScript modules. Copy archive content and media into a new project directory, then publish that directory with a GitHub Actions Pages workflow.

**Tech Stack:** Semantic HTML, CSS, vanilla JavaScript modules, local image assets, GitHub Actions Pages.

**Spec:** `docs/superpowers/specs/2026-09-16-jlicerio-portfolio-design.md`

## Global Constraints

- Keep the archive at `/Users/selfsim/Desktop/Projects/portfolio details/site/` unchanged.
- Use `jlicerio/portfolio` as a public GitHub repository.
- Use relative URLs for GitHub Pages project hosting.
- Hide empty media sections.
- Do not add invented project details or placeholder images.
- Verify local and deployed routes before completion.

---

### Task 1: Create the portfolio project and copy verified archive content

**Files:**
- Create: `index.html`, `work.html`, `cv.html`, `contact.html`
- Create: `projects/*.html`
- Create: `assets/images/**`
- Create: `content/projects.js`
- Create: `.nojekyll`
- Create: `.github/workflows/pages.yml`

**Interfaces:**
- Consumes: archive files under `/Users/selfsim/Desktop/Projects/portfolio details/site/`.
- Produces: a standalone static site with no dependency on the archive path.

- [ ] Copy archive image files into the new project.
- [ ] Extract project records from `data/site.json` into a local content module.
- [ ] Preserve the seven project IDs and their descriptions.
- [ ] Add only media paths that exist locally.
- [ ] Add only external media URLs present in the archive data.
- [ ] Add `.nojekyll` and the Pages workflow shell.

### Task 2: Build the shared page shell and visual system

**Files:**
- Create: `style.css`
- Create: `app.js`
- Modify: `index.html`, `work.html`, `cv.html`, `contact.html`

**Interfaces:**
- Consumes: `content/projects.js`.
- Produces: shared header, theme toggle, project rows, CV content, and contact content.

- [ ] Define dark and light tokens with the approved colors.
- [ ] Define Space Grotesk display typography and DM Mono utility typography.
- [ ] Implement shared navigation with relative links.
- [ ] Implement theme persistence with `localStorage`.
- [ ] Render the home project list from the content module.
- [ ] Render the work index from the same records.
- [ ] Render CV focus areas and selected work.
- [ ] Render contact content without empty link lists.

### Task 3: Build project pages with real media and safe empty states

**Files:**
- Create: `projects/*.html`
- Modify: `app.js`, `style.css`, `content/projects.js`

**Interfaces:**
- Consumes: project records, local images, and verified external media URLs.
- Produces: project hero, description, tools, media section, gallery section, and related links.

- [ ] Render the cover image only when the file exists.
- [ ] Render each local gallery image with an alt description.
- [ ] Render each external media item with a stable frame and direct link.
- [ ] Hide empty gallery, video, and link sections.
- [ ] Add a visible fallback link for every external embed.
- [ ] Confirm all project navigation returns to `work.html`.

### Task 4: Run local browser QA and repair visual issues

**Files:**
- Modify: `style.css`, `app.js`, or affected HTML pages.

**Interfaces:**
- Consumes: the complete local static site.
- Produces: a verified desktop and mobile rendering.

- [ ] Serve the project through `python3 -m http.server`.
- [ ] Open the homepage in Browser/IAB.
- [ ] Check Work, CV, Contact, and every project link.
- [ ] Check image requests and console warnings.
- [ ] Check theme switching.
- [ ] Check a mobile-sized viewport for overflow and clipped media.
- [ ] Capture a final browser screenshot.

### Task 5: Publish GitHub Pages and verify the live site

**Files:**
- Modify: `.github/workflows/pages.yml` if deployment needs correction.

**Interfaces:**
- Consumes: the verified static project.
- Produces: `https://jlicerio.github.io/portfolio/`.

- [ ] Initialize git with `main` as the default branch.
- [ ] Create public repository `jlicerio/portfolio`.
- [ ] Push the site and wait for the Pages workflow.
- [ ] Enable Pages with the Actions source.
- [ ] Verify HTTP 200 for the homepage and project pages.
- [ ] Verify the browser loads the live homepage without console errors.
- [ ] Mark the live portfolio page as deliverable.
