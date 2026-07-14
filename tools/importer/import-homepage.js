/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsServiceParser from './parsers/cards-service.js';
import columnsMediaParser from './parsers/columns-media.js';
import heroCtaParser from './parsers/hero-cta.js';
import carouselArticleParser from './parsers/carousel-article.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/spring-green-cleanup.js';
import sectionsTransformer from './transformers/spring-green-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: "Spring-Green homepage: hero with service quote form, three service cards (Lawn Care, Pest Control, Tree Care), 'The Green in SpringGreen' about section with satisfaction guarantee, service provider locator, and a Yardology article carousel.",
  urls: [
    'https://www.spring-green.com/',
  ],
  blocks: [
    { name: 'hero-banner', instances: ['div.hero-top'] },
    { name: 'cards-service', instances: ['#hero_bottom'] },
    { name: 'columns-media', instances: ['#satisfaction_guarantee'] },
    { name: 'hero-cta', instances: ['div.grey-bend'] },
    { name: 'carousel-article', instances: ['div.green-bend'] },
  ],
  sections: [
    { id: 'hero', name: 'Hero', selector: '.hero-banner', style: null, blocks: ['hero-banner'], defaultContent: [] },
    { id: 'service-cards', name: 'Service Cards', selector: '.cards-service', style: null, blocks: ['cards-service'], defaultContent: [] },
    { id: 'about-satisfaction', name: 'About / Satisfaction', selector: '.columns-media', style: null, blocks: ['columns-media'], defaultContent: [] },
    { id: 'locator', name: 'Service Provider Locator', selector: '.hero-cta', style: 'grey', blocks: ['hero-cta'], defaultContent: [] },
    { id: 'yardology-carousel', name: 'Yardology Carousel', selector: '.carousel-article', style: null, blocks: ['carousel-article'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-service': cardsServiceParser,
  'columns-media': columnsMediaParser,
  'hero-cta': heroCtaParser,
  'carousel-article': carouselArticleParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
