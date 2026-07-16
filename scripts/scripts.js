import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Converts links that point at an image URL into <picture><img> elements.
 * xwalk renders external image references (not DAM assets) as plain anchors;
 * blocks expect real images, so normalize them before decoration.
 * @param {Element} main The container element
 */
function normalizeImageLinks(main) {
  const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|avif|bmp)(\?.*)?$/i;
  main.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    // A link whose href is an image URL is always a rendered image, never a
    // real CTA. Use any descriptive link text as the alt (parsers emit the
    // image alt as the anchor text); ignore text that just repeats the URL.
    if (!IMAGE_EXT.test(href)) return;
    const text = a.textContent.trim();
    const img = document.createElement('img');
    img.src = href;
    img.alt = (text && text !== href && text !== a.href) ? text : '';
    img.loading = 'lazy';
    const picture = document.createElement('picture');
    picture.append(img);
    a.replaceWith(picture);
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    normalizeImageLinks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function a11yLinks(main) {
  const links = main.querySelectorAll('a');
  links.forEach((link) => {
    let label = link.textContent;
    if (!label && link.querySelector('span.icon')) {
      const icon = link.querySelector('span.icon');
      label = icon ? icon.classList[1]?.split('-')[1] : label;
    }
    link.setAttribute('aria-label', label);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  // add aria-label to links
  a11yLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = getMetadata('lang') || 'en';
  decorateTemplateAndTheme();
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    doc.body.dataset.breadcrumbs = true;
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Adds LocalBusiness structured data (JSON-LD) to the document head for SEO.
 * Sourced from page metadata where available, with sensible fallbacks.
 */
function buildStructuredData() {
  if (document.querySelector('script[type="application/ld+json"]')) return;
  const desc = getMetadata('description')
    || 'Neighborhood lawn care, pest control, and tree care experts since 1977.';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: 'SpringGreen',
    legalName: 'Spring - Green Lawn Care Corp.',
    url: 'https://www.spring-green.com/',
    description: desc,
    foundingDate: '1977',
    areaServed: 'US',
    knowsAbout: ['Lawn Care', 'Pest Control', 'Tree Care'],
    sameAs: [
      'https://www.facebook.com/SpringGreen',
      'https://twitter.com/springgreenlawn',
      'https://www.youtube.com/user/SpringGreenLawnCare',
      'https://www.linkedin.com/company/spring-green-lawn-care/',
    ],
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
  buildStructuredData();

  // Load Universal Editor support only when the page is opened in the editor.
  if (document.querySelector('[data-aue-resource]') || window.location.href.includes('.adobeaemcloud.')) {
    // eslint-disable-next-line import/no-cycle
    import('./editor-support.js');
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
