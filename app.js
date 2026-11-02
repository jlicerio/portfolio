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

function workRow(project, index) {
  const discipline = String(project.discipline || String(project.tools || '').split(',')[0].trim() || '—');
  const number = String(index + 1).padStart(2, '0');
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
  const projects = document.querySelector('[data-home-projects]');
  if (name) name.textContent = site.name;
  if (bio) bio.textContent = site.bio;
  if (projects) projects.innerHTML = visibleProjects(site).slice(0, 6).map(projectRow).join('');
}

function renderWork(site) {
  const list = document.querySelector('[data-work-projects]');
  if (list) list.innerHTML = visibleProjects(site).map(workRow).join('');
}

function renderCv(site) {
  const focus = document.querySelector('[data-cv-focus]');
  const selected = document.querySelector('[data-cv-work]');
  if (focus) focus.innerHTML = site.cv.focus.map((item, index) => `<div class="focus-item"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(item)}</strong></div>`).join('');
  if (selected) selected.innerHTML = site.cv.selectedWork.map(item => `<div class="selected-item">${escapeHtml(item)}</div>`).join('');
}

function renderProject(site) {
  const project = site.projects.find(item => item.id === document.body.dataset.project);
  if (!project) return;
  document.title = `${project.title} — Juan Licerio`;
  document.querySelectorAll('[data-project-title]').forEach(node => node.textContent = project.title);
  document.querySelector('[data-project-year]').textContent = project.year;
  const roleNode = document.querySelector('[data-project-role]');
  if (roleNode) { if (project.role) roleNode.textContent = '[' + project.role.toUpperCase() + ']'; else roleNode.remove(); }
  document.querySelector('[data-project-summary]').textContent = project.summary;
  document.querySelector('[data-project-description]').textContent = project.description || 'Project details are being prepared.';
  const tools = document.querySelector('[data-project-tools]');
  if (project.tools && tools) tools.textContent = `TOOLS / ${project.tools}`;
  else tools?.remove();
  const cover = document.querySelector('[data-project-cover]');
  if (project.image) cover.innerHTML = `<img src="${localUrl(project.image)}" alt="${escapeHtml(project.title)} project cover">`;
  else cover?.remove();

  const mediaSection = document.querySelector('[data-project-media-section]');
  if (mediaSection && project.videos?.length) {
    mediaSection.hidden = false;
    document.querySelector('[data-project-media]').innerHTML = project.videos.map((media, index) => {
      const href = externalUrl(media.url || media.embedUrl);
      const frame = media.embedUrl ? `<iframe src="${externalUrl(media.embedUrl)}" title="${escapeHtml(project.title)} media ${index + 1}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>` : '';
      return `<article class="media-item">${frame}<a class="media-link" href="${href}" target="_blank" rel="noreferrer">OPEN MEDIA ${String(index + 1).padStart(2, '0')} ↗</a></article>`;
    }).join('');
  }

  const gallerySection = document.querySelector('[data-project-gallery-section]');
  if (gallerySection && project.gallery?.length) {
    gallerySection.hidden = false;
    document.querySelector('[data-project-gallery]').innerHTML = project.gallery.map((image, index) => `<figure><img src="${localUrl(image)}" alt="${escapeHtml(project.title)} documentation image ${index + 1}" loading="lazy"></figure>`).join('');
  }

  const linksSection = document.querySelector('[data-project-links-section]');
  if (project.links?.length) {
    linksSection.hidden = false;
    document.querySelector('[data-project-links]').innerHTML = project.links.map(link => `<a href="${externalUrl(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} ↗</a>`).join('');
  }

  renderCaseStudy(project);
}

function renderCaseStudy(project) {
  const study = project.caseStudy;
  if (!study?.brief) return;
  const anchor = document.querySelector('.project-description');
  if (!anchor) return;

  const list = (items = []) => items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  const credits = (items = []) => items.map(item => `<dt>${escapeHtml(item.role)}</dt><dd>${escapeHtml(item.name)}</dd>`).join('');
  const figures = (items = []) => items.map((image, index) => `<figure><img src="${localUrl(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" decoding="async"><figcaption><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(image.caption || '')}</figcaption></figure>`).join('');
  const section = document.createElement('section');
  section.className = 'project-case';
  section.innerHTML = `
    <div class="section-label"><span>CASE STUDY</span><span>${escapeHtml(project.year || '')}</span></div>
    <div class="case-grid">
      <div class="case-block"><h2>Brief</h2><p>${escapeHtml(study.brief)}</p></div>
      <div class="case-block"><h2>Process</h2><ol>${list(study.process)}</ol></div>
      <div class="case-block"><h2>Result</h2><ul>${list(study.result)}</ul></div>
      <div class="case-block"><h2>Credits</h2><dl>${credits(study.credits)}</dl></div>
    </div>
    ${study.images?.length ? `<div class="case-gallery" data-count="${study.images.length}">${figures(study.images)}</div>` : ''}`;
  anchor.after(section);
}

async function init() {
  setupTheme();
  const response = await fetch(`${root}data/site.json?v=2`, { cache: 'no-store' });
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
