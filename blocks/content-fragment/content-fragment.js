/*
 * Content Fragment block
 * Renders an AEM Content Fragment (Spring Green "Service" model) headlessly.
 * Model fields: name, slug, description (rich text), image.
 *
 * Data source, in priority order:
 *   1. AEM GraphQL persisted query (serviceBySlug) — production/headless.
 *   2. Local sample JSON in this block folder — demo/preview fallback used when
 *      the AEM author endpoint is unreachable (auth gate / CORS).
 *
 * Authored config rows (all optional):
 *   endpoint : AEM GraphQL persisted-query base (has a default)
 *   slug     : which Service fragment to render (e.g. lawn-care-services)
 *
 * When the AEM <-> Edge Delivery connection is live, the GraphQL fetch succeeds
 * and the fallback is never used — no code change required.
 */
import { readBlockConfig } from '../../scripts/aem.js';

const DEFAULT_ENDPOINT = 'https://author-p7954-e1482380.adobeaemcloud.com/graphql/execute.json/spring-green/serviceBySlug';
const SAMPLE_DATA = new URL('./sample-services.json', import.meta.url).href;

async function fetchFromGraphQL(endpoint, slug) {
  const url = `${endpoint};slug=${encodeURIComponent(slug)}`;
  const resp = await fetch(url, { headers: { accept: 'application/json' } });
  if (!resp.ok) throw new Error(`GraphQL ${resp.status}`);
  const json = await resp.json();
  const items = json?.data?.serviceList?.items || [];
  const item = items[0];
  if (!item) return null;
  // GraphQL returns rich text under description.html (multiline/RTE).
  return {
    name: item.name,
    slug: item.slug,
    description: item.description?.html || item.description || '',
    // eslint-disable-next-line no-underscore-dangle
    image: item.image?._path || item.image || '',
  };
}

async function fetchFromSample(slug) {
  const resp = await fetch(SAMPLE_DATA);
  if (!resp.ok) throw new Error(`sample ${resp.status}`);
  const list = await resp.json();
  return list.find((s) => s.slug === slug) || list[0] || null;
}

function render(block, service, source) {
  if (!service) {
    block.textContent = '';
    return;
  }
  const article = document.createElement('article');
  article.className = 'cf-service';
  article.innerHTML = `
    <div class="cf-service-media">
      ${service.image ? `<picture><img loading="lazy" alt="${service.name || ''}" src="${service.image}"></picture>` : ''}
    </div>
    <div class="cf-service-body">
      <h2>${service.name || ''}</h2>
      ${service.description ? `<div class="cf-service-desc">${service.description}</div>` : ''}
    </div>`;
  block.textContent = '';
  block.append(article);
  block.dataset.cfSource = source; // 'graphql' | 'sample' — handy for the demo
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const slug = config.slug || 'lawn-care-services';
  const endpoint = config.endpoint || DEFAULT_ENDPOINT;

  block.textContent = '';

  let service = null;
  let source = 'sample';
  try {
    service = await fetchFromGraphQL(endpoint, slug);
    source = 'graphql';
  } catch (e) {
    try {
      service = await fetchFromSample(slug);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('content-fragment: no data source available', err);
    }
  }
  render(block, service, source);
}
