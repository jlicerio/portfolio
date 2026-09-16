const root = document.body.dataset.root || './';
const page = document.body.dataset.page || 'home';

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
const localUrl = value => `${root}${String(value || '').replace(/^\.\//, '')}`;
const externalUrl = value => /^https:\/\//i.test(value || '') ? value : '#';

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
  return `<a class="work-row" href="${localUrl(project.href)}"><span class="work-thumb"><img src="${localUrl(project.image)}" alt=""></span><span class="work-row-copy"><span class="work-row-title">${escapeHtml(project.title)}</span><span class="work-row-summary">${escapeHtml(project.summary)}</span></span><span class="work-row-year">${escapeHtml(project.year)} <b>↗</b></span></a>`;
}

function renderHome(site) {
  const name = document.querySelector('[data-name]');
  const bio = document.querySelector('[data-bio]');
  const projects = document.querySelector('[data-home-projects]');
  if (name) name.textContent = site.name;
  if (bio) bio.textContent = site.bio;
  if (projects) projects.innerHTML = site.projects.map(projectRow).join('');
}

function renderWork(site) {
  const list = document.querySelector('[data-work-projects]');
  if (list) list.innerHTML = site.projects.map(projectRow).join('');
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
  document.querySelector('[data-project-summary]').textContent = project.summary;
  document.querySelector('[data-project-description]').textContent = project.description || 'Project details are being prepared.';
  const tools = document.querySelector('[data-project-tools]');
  if (project.tools) tools.textContent = `TOOLS / ${project.tools}`;
  else tools.remove();
  const cover = document.querySelector('[data-project-cover]');
  if (project.image) cover.innerHTML = `<img src="${localUrl(project.image)}" alt="${escapeHtml(project.title)} project cover">`;
  else cover.remove();

  const mediaSection = document.querySelector('[data-project-media-section]');
  if (project.videos?.length) {
    mediaSection.hidden = false;
    document.querySelector('[data-project-media]').innerHTML = project.videos.map((media, index) => {
      const href = externalUrl(media.url || media.embedUrl);
      const frame = media.embedUrl ? `<iframe src="${externalUrl(media.embedUrl)}" title="${escapeHtml(project.title)} media ${index + 1}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>` : '';
      return `<article class="media-item">${frame}<a class="media-link" href="${href}" target="_blank" rel="noreferrer">OPEN MEDIA ${String(index + 1).padStart(2, '0')} ↗</a></article>`;
    }).join('');
  }

  const gallerySection = document.querySelector('[data-project-gallery-section]');
  if (project.gallery?.length) {
    gallerySection.hidden = false;
    document.querySelector('[data-project-gallery]').innerHTML = project.gallery.map((image, index) => `<figure><img src="${localUrl(image)}" alt="${escapeHtml(project.title)} documentation image ${index + 1}" loading="lazy"></figure>`).join('');
  }

  const linksSection = document.querySelector('[data-project-links-section]');
  if (project.links?.length) {
    linksSection.hidden = false;
    document.querySelector('[data-project-links]').innerHTML = project.links.map(link => `<a href="${externalUrl(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} ↗</a>`).join('');
  }
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
