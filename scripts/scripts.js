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
// eslint-disable-next-line import/no-cycle
import initializeDropins from './dropins.js';

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
  // Initialize commerce dropins, but never let a config/network issue block
  // rendering — the page must still appear if commerce init fails.
  try {
    await initializeDropins();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Commerce dropins init failed; continuing to render page.', e);
  }
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

const SITE_URL = 'https://www.spring-green.com/';

/**
 * Appends one JSON-LD schema object to the document head.
 * @param {object} schema schema.org object
 */
function appendJsonLd(schema) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/** LocalBusiness — core organization facts. */
function buildLocalBusinessSchema() {
  const desc = getMetadata('description')
    || 'Neighborhood lawn care, pest control, and tree care experts since 1977.';
  appendJsonLd({
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: 'SpringGreen',
    legalName: 'Spring - Green Lawn Care Corp.',
    url: SITE_URL,
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
  });
}

/** WebSite + SearchAction — enables sitelinks search box. */
function buildWebSiteSchema() {
  appendJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SpringGreen',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  });
}

/**
 * BreadcrumbList — derived from the current URL path so agents understand
 * where the page sits in the site hierarchy.
 */
function buildBreadcrumbSchema() {
  const segments = window.location.pathname.split('/').filter((s) => s && !s.endsWith('.html'));
  if (!segments.length) return; // homepage — no breadcrumb needed
  const items = [{
    '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL,
  }];
  let path = '';
  segments.forEach((seg, i) => {
    path += `/${seg}`;
    const name = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name,
      item: `${SITE_URL.replace(/\/$/, '')}${path}/`,
    });
  });
  appendJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  });
}

/**
 * FAQPage — auto-built from an accordion block on the page. Reads each
 * accordion row's summary (question) and body (answer). Only emitted when
 * an accordion with content exists, so it never produces empty schema.
 */
function buildFaqSchema(doc) {
  const details = [...doc.querySelectorAll('.accordion details, .accordion .accordion-item')];
  const entries = details.map((d) => {
    const q = d.querySelector('summary, [class*="label"], h2, h3, h4');
    const a = d.querySelector('[class*="body"], [class*="content"], div:last-child, p');
    if (!q || !a) return null;
    const question = q.textContent.trim();
    const answer = a.textContent.trim();
    if (!question || !answer || question === answer) return null;
    return {
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    };
  }).filter(Boolean);
  if (!entries.length) return;
  appendJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries,
  });
}

/**
 * Adds all structured data (JSON-LD) to the document head for SEO / GEO.
 * @param {Element} doc The container element
 */
function buildStructuredData(doc) {
  if (document.querySelector('script[type="application/ld+json"]')) return;
  buildLocalBusinessSchema();
  buildWebSiteSchema();
  buildBreadcrumbSchema();
  buildFaqSchema(doc);
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
  buildStructuredData(doc);

  // Load Universal Editor support only when the page is opened in the editor.
  if (document.querySelector('[data-aue-resource]') || window.location.href.includes('.adobeaemcloud.')) {
    // eslint-disable-next-line import/no-cycle
    import('./editor-support.js');
  }
}

/**
 * Check if consent was given for a specific topic. Used by commerce.js.
 * @param {*} topic Topic identifier
 * @returns {boolean} True if consent was given
 */
// eslint-disable-next-line no-unused-vars
export function getConsent(topic) {
  return true;
}

/**
 * Builds an accordion element. Used by the product-details (PDP) block.
 * @param {string} header Accordion header HTML
 * @param {string} content Accordion body HTML
 * @param {boolean} expanded Whether the accordion starts open
 * @returns {Array} [container element, updateContent function]
 */
export function createAccordion(header, content, expanded = false) {
  const container = document.createElement('div');
  container.classList.add('accordion');
  const accordionContainer = document.createElement('details');
  accordionContainer.classList.add('accordion-item');

  const accordionHeader = document.createElement('summary');
  accordionHeader.classList.add('accordion-item-label');
  accordionHeader.innerHTML = `<div>${header}</div>`;

  const accordionContent = document.createElement('div');
  accordionContent.classList.add('accordion-item-body');
  accordionContent.innerHTML = content;

  accordionContainer.append(accordionHeader, accordionContent);
  container.append(accordionContainer);

  if (expanded) {
    accordionContent.classList.toggle('active');
    accordionHeader.classList.add('open-default');
    accordionContainer.setAttribute('open', true);
  }

  function updateContent(newContent) {
    accordionContent.innerHTML = newContent;
  }

  return [container, updateContent];
}

/**
 * Builds a simple list from data. Used by the product-details (PDP) block.
 * @param {Array} data Array of { label, value }
 * @returns {string} List HTML
 */
export function generateListHTML(data) {
  let html = '<ul>';
  data.forEach((item) => {
    html += `<li>${item.label}: <span>${item.value}</span></li>`;
  });
  html += '</ul>';
  return html;
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
