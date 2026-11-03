const root = document.body.dataset.root || './';
const page = document.body.dataset.page || 'home';

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
const localUrl = value => `${root}${String(value || '').replace(/^\.\//, '')}`;
const externalUrl = value => /^https?:\/\//i.test(value || '') ? value : '#';
const roleTag = (project) => project.role ? `<span class="role-tag">[${escapeHtml(project.role)}]</span>` : '';

function applyTheme(theme) {
  const selected = theme === 'light' ? 'light' : 'dark';
  document.body.dataset.theme = selected === 'light' ? 'light' : 'dark';
  document.querySelectorAll('.theme-toggle').forEach(button => {
    const light = selected === 'light';
    button.setAttribute('aria-pressed', String(light));
    button.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    const label = button.querySelector('.theme-label');
    if (label) label.textContent = light ? 'DARK' : 'LIGHT';
  });
}

function setupTheme() {
  applyTheme(localStorage.getItem('jlicerio-theme') || 'dark');
  document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
    const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('jlicerio-theme', next);
    applyTheme(next);
  }));
}

function projectRow(project) {
  return `<a class="work-row" href="${localUrl(project.href)}"><span class="work-thumb"><img src="${localUrl(project.image)}" alt=""></span><span class="work-row-copy"><span class="work-row-title">${escapeHtml(project.title)}${roleTag(project)}</span><span class="work-row-summary">${escapeHtml(project.summary)}</span></span><span class="work-row-year">${escapeHtml(project.year)} <b>↗</b></span></a>`;
}

function visibleProjects(site) {
  return site.projects.filter(project => !project.archived && project.id !== 'archived');
}

function siteSections(site) {
  return Array.isArray(site.sections) && site.sections.length ? site.sections : [{ id: 'work', label: 'WORK' }];
}

// One number per study, shared by the work index, the archive index, and the study page.
function indexedProjects(site) {
  const visible = visibleProjects(site);
  const ordered = siteSections(site).flatMap(section => visible.filter(project => (project.section || 'work') === section.id));
  const rest = visible.filter(project => !ordered.includes(project));
  return [...ordered, ...rest].map((project, index) => ({ project, number: String(index + 1).padStart(2, '0') }));
}

// The intro headline takes one muted word, the way work.html does.
function titleMarkup(title) {
  const words = String(title || '').trim().split(/\s+/);
  if (words.length < 2) return escapeHtml(words[0] || '');
  const last = words.pop();
  return `${escapeHtml(words.join(' '))} <em>${escapeHtml(last)}</em>`;
}

function workRow(project, number) {
  const discipline = String(project.discipline || String(project.tools || '').split(',')[0].trim() || '—');
  return `<li class="work-index-item"><a class="work-index-row" href="${localUrl(project.href)}">
    <span class="work-index-number">${number}</span>
    <span class="work-index-copy"><span class="work-index-title">${escapeHtml(project.title)}${roleTag(project)}</span><span class="work-index-summary">${escapeHtml(project.summary)}</span></span>
    <span class="work-index-discipline">${escapeHtml(discipline)}</span>
    <span class="work-index-year">${escapeHtml(project.year)}</span>
    <span class="work-index-preview" aria-hidden="true"><img src="${escapeHtml(localUrl(project.image))}" alt="" loading="lazy" decoding="async"></span>
  </a></li>`;
}

function renderHome(site) {
  const name = document.querySelector('[data-name]');
  const bio = document.querySelector('[data-bio]');
  const bioDetail = document.querySelector('[data-bio-detail]');
  if (bioDetail) {
    const parts = Array.isArray(site.bioDetails) ? site.bioDetails.filter(Boolean) : [];
    if (parts.length) bioDetail.innerHTML = parts.map((part) => `<p>${escapeHtml(part)}</p>`).join('');
    else bioDetail.remove();
  }
  const projects = document.querySelector('[data-home-projects]');
  if (name) name.textContent = site.name;
  if (bio) bio.textContent = site.bio;
  if (projects) projects.innerHTML = visibleProjects(site).slice(0, 6).map(projectRow).join('');
}

function renderWork(site) {
  const list = document.querySelector('[data-work-projects]');
  if (!list) return;
  const indexed = indexedProjects(site);
  list.innerHTML = siteSections(site).map((section) => {
    const rows = indexed.filter(({ project }) => (project.section || 'work') === section.id);
    if (!rows.length) return '';
    const count = String(rows.length).padStart(2, '0');
    return `<section class="work-section" aria-label="${escapeHtml(section.label)}">
      <div class="work-section-head"><span class="work-section-label">${escapeHtml(section.label)}</span><span class="work-section-note">${escapeHtml(section.note || '')}</span><span class="work-section-count">${count}</span></div>
      <ul class="work-index-list">${rows.map(({ project, number }) => workRow(project, number)).join('')}</ul>
    </section>`;
  }).join('');
}

function renderArchiveIndex(site) {
  const holder = document.querySelector('[data-archive]');
  if (!holder) return;
  const indexed = indexedProjects(site);
  const years = [...new Set(indexed.map(({ project }) => project.year).filter(Boolean))].sort().reverse();
  let position = 0;
  holder.innerHTML = years.map((year) => {
    const rows = indexed.filter(({ project }) => project.year === year);
    return `<h2 class="archive-year">${escapeHtml(year)}</h2>
      <ul class="work-index-list">${rows.map(({ project }) => {
        position += 1;
        return workRow(project, String(position).padStart(2, '0'));
      }).join('')}</ul>`;
  }).join('');
}

function renderCv(site) {
  const focus = document.querySelector('[data-cv-focus]');
  const selected = document.querySelector('[data-cv-work]');
  if (focus) focus.innerHTML = site.cv.focus.map((item, index) => `<div class="focus-item"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(item)}</strong></div>`).join('');
  if (selected) selected.innerHTML = site.cv.selectedWork.map(item => `<div class="selected-item">${escapeHtml(item)}</div>`).join('');
  const contact = document.querySelector('[data-cv-contact]');
  if (contact) {
    const links = Array.isArray(site.cv.contact) ? site.cv.contact : [];
    if (links.length) contact.innerHTML = links.map((link) => `<a href="${externalUrl(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} ↗</a>`).join('');
    else contact.closest('section')?.remove();
  }
}

function clipMarkup(project) {
  const clips = project.videos || [];
  return clips.map((media, index) => {
    const href = externalUrl(media.url || media.embedUrl);
    const embed = media.embedUrl ? externalUrl(media.embedUrl) : '';
    const ratio = media.width && media.height && media.width > 2
      ? media.width + ' / ' + media.height
      : '16 / 10';
    const number = String(index + 1).padStart(2, '0');
    const poster = media.poster
      ? `<img src="${localUrl(media.poster)}" alt="${escapeHtml(project.title)} clip ${number}" loading="lazy" decoding="async">`
      : `<span class="clip-plate">${escapeHtml((media.type || 'clip').replace(/-/g, ' ').toUpperCase())}</span>`;
    return `<figure class="clip" style="--clip-ratio:${ratio}">
        ${poster}
        ${embed ? `<button class="clip-play" type="button" data-clip-embed="${embed}" data-clip-ratio="${ratio}"><span>PLAY</span><em>${number}</em></button>` : ''}
        <figcaption><span>${number}</span><a href="${href}" target="_blank" rel="noreferrer">OPEN ↗</a></figcaption>
      </figure>`;
  }).join('');
}

function caseRow({ title, note = '', content = '', wide = false }) {
  return `<section class="case-row${wide ? ' case-row--wide' : ''}">
    <span class="case-row-number" aria-hidden="true"></span>
    <div class="case-row-main">
      <div class="case-row-head"><h2>${escapeHtml(title)}</h2>${note ? `<span class="case-row-note">${escapeHtml(note)}</span>` : ''}</div>
      ${content}
    </div>
  </section>`;
}

function buildCaseBody(project) {
  const body = document.querySelector('[data-case-body]');
  if (!body) return;
  const study = project.caseStudy || {};
  const rows = [];
  const list = (items = []) => items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  const credits = (items = []) => items.map(item => `<dt>${escapeHtml(item.role)}</dt><dd>${escapeHtml(item.name)}</dd>`).join('');

  const about = [project.description || 'Project details are being prepared.'];
  rows.push(caseRow({
    title: 'About',
    note: project.tools || '',
    content: about.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join(''),
  }));

  if (study.brief) rows.push(caseRow({ title: 'Brief', content: `<p>${escapeHtml(study.brief)}</p>` }));
  if (study.process?.length) rows.push(caseRow({
    title: 'Process',
    note: `${String(study.process.length).padStart(2, '0')} STEPS`,
    content: `<ol>${list(study.process)}</ol>`,
  }));
  if (study.result?.length) rows.push(caseRow({
    title: 'Result',
    note: `${String(study.result.length).padStart(2, '0')} NOTES`,
    content: `<ul>${list(study.result)}</ul>`,
  }));
  if (study.credits?.length) rows.push(caseRow({
    title: 'Credits',
    note: `${String(study.credits.length).padStart(2, '0')} ROLES`,
    content: `<dl class="case-credits">${credits(study.credits)}</dl>`,
  }));

  const clips = project.videos?.length ? clipMarkup(project) : '';
  if (clips) rows.push(caseRow({
    title: 'Media',
    note: `${String(project.videos.length).padStart(2, '0')} CLIP${project.videos.length === 1 ? '' : 'S'}`,
    content: `<div class="project-media-grid">${clips}</div>`,
    wide: true,
  }));

  const studyFrames = (study.images || []).filter(image => image.src !== project.image);
  const frames = studyFrames.length
    ? studyFrames.map(image => ({ src: image.src, alt: image.alt, caption: image.caption || '' }))
    : (project.gallery || []).map((src, index) => ({ src, alt: `${project.title} documentation image ${index + 1}`, caption: '' }));

  if (frames.length) rows.push(caseRow({
    title: 'Documentation',
    note: `${String(frames.length).padStart(2, '0')} IMAGES`,
    content: `<div class="case-gallery" data-count="${frames.length}">${frames.map((image, index) => `<figure><img src="${localUrl(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async"><figcaption><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(image.caption)}</figcaption></figure>`).join('')}</div>`,
    wide: true,
  }));

  if (project.links?.length) rows.push(caseRow({
    title: 'Links',
    note: `${String(project.links.length).padStart(2, '0')} LINK${project.links.length === 1 ? '' : 'S'}`,
    content: `<div class="project-links">${project.links.map(link => `<a href="${externalUrl(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} ↗</a>`).join('')}</div>`,
    wide: true,
  }));

  body.innerHTML = rows.join('');
}

function renderProject(site) {
  const project = site.projects.find(item => item.id === document.body.dataset.project);
  if (!project) return;
  const isIndex = project.id === 'archived';
  const entry = indexedProjects(site).find(item => item.project.id === project.id);
  const number = entry ? entry.number : '—';
  const discipline = project.discipline || '';

  document.title = `${project.title} — Juan Licerio`;
  document.querySelectorAll('[data-project-kicker]').forEach(node => node.textContent = isIndex ? 'ARCHIVE' : 'STUDY');
  document.querySelectorAll('[data-project-number]').forEach(node => node.textContent = isIndex ? (project.year || '') : number);
  document.querySelectorAll('[data-project-discipline]').forEach(node => node.textContent = discipline);
  document.querySelectorAll('[data-project-title]').forEach(node => node.innerHTML = titleMarkup(project.title));
  document.querySelectorAll('[data-project-summary]').forEach(node => node.textContent = project.summary || '');

  const meta = document.querySelector('[data-case-meta]');
  if (meta) {
    meta.innerHTML = `<li class="work-index-item"><div class="work-index-row case-meta-row">
      <span class="work-index-number">${isIndex ? '—' : number}</span>
      <span class="work-index-copy"><span class="work-index-title">${escapeHtml(project.title)}${roleTag(project)}</span></span>
      <span class="work-index-discipline">${escapeHtml(discipline)}</span>
      <span class="work-index-year">${escapeHtml(project.year || '')}</span>
      <span class="work-index-preview" aria-hidden="true"><img src="${escapeHtml(localUrl(project.image))}" alt=""></span>
    </div></li>`;
  }

  buildCaseBody(project);
  renderArchiveIndex(site);
}

function setupClipPlayers() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-clip-embed]');
    if (!button) return;
    const figure = button.closest('.clip');
    if (!figure) return;
    const src = button.dataset.clipEmbed;
    const ratio = button.dataset.clipRatio || '16 / 10';
    figure.innerHTML = `<iframe style="aspect-ratio:${ratio}" src="${src}" title="Clip player" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    figure.classList.add('is-playing');
  });
}

async function init() {
  setupTheme();
  setupClipPlayers();
  const response = await fetch(`${root}data/site.json?v=3`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Portfolio data request failed: ${response.status}`);
  const site = await response.json();
  if (page === 'home') renderHome(site);
  if (page === 'work') renderWork(site);
  if (page === 'cv') renderCv(site);
  if (page === 'project') renderProject(site);
}

init().catch(error => {
  console.error(error);
  document.body.dataset.error = 'true';
});
