// Spring-Green header: simple 2-row nav bar (utility bar + main header).
// Content-first: all links/labels/images come from /content/nav.plain.html.
// Fragment sections (in order):
//   0: utility bar (text + Contact Us link)
//   1: brand/logo
//   2: primary nav links
//   3: tools (Search / My Account / Cart)

const isDesktop = window.matchMedia('(min-width: 900px)');

async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    const navMeta = document.querySelector('meta[name="nav"]');
    const navPath = navMeta ? new URL(navMeta.content, window.location).pathname : '/nav';
    resp = await fetch(`${navPath}.plain.html`);
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

function closeMenuOnEscape(e, nav, hamburger) {
  if (e.code === 'Escape' && !isDesktop.matches) {
    nav.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
  }
}

export default async function decorate(block) {
  const source = await fetchNav();
  block.textContent = '';
  if (!source) return;

  const sections = [...source.children];
  const [utilitySec, brandSec, navSec, toolsSec] = sections;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  nav.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');

  // --- Utility bar (row 0) ---
  if (utilitySec) {
    const utility = document.createElement('div');
    utility.className = 'nav-utility';
    const inner = document.createElement('div');
    inner.className = 'nav-utility-inner';
    while (utilitySec.firstChild) inner.append(utilitySec.firstChild);
    utility.append(inner);
    nav.append(utility);
  }

  // --- Main header (row 1): hamburger + brand + nav links + tools ---
  const main = document.createElement('div');
  main.className = 'nav-main';
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-main-inner';

  // Hamburger toggle (mobile)
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.type = 'button';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', String(!expanded));
    hamburger.setAttribute('aria-expanded', String(!expanded));
    hamburger.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  });
  mainInner.append(hamburger);

  // Brand / logo
  if (brandSec) {
    const brand = document.createElement('div');
    brand.className = 'nav-brand';
    while (brandSec.firstChild) brand.append(brandSec.firstChild);
    mainInner.append(brand);
  }

  // Primary nav links
  if (navSec) {
    const navSections = document.createElement('div');
    navSections.className = 'nav-sections';
    while (navSec.firstChild) navSections.append(navSec.firstChild);
    mainInner.append(navSections);
  }

  // Tools (Search / My Account / Cart)
  if (toolsSec) {
    const tools = document.createElement('div');
    tools.className = 'nav-tools';
    while (toolsSec.firstChild) tools.append(toolsSec.firstChild);
    mainInner.append(tools);
  }

  main.append(mainInner);
  nav.append(main);

  window.addEventListener('keydown', (e) => closeMenuOnEscape(e, nav, hamburger));

  // Reset mobile menu state when crossing to desktop
  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches) {
      nav.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation');
    } else {
      nav.setAttribute('aria-expanded', 'false');
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
