import { readBlockConfig } from '../../scripts/aem.js';
// eslint-disable-next-line import/no-cycle
import { performCatalogServiceQuery } from '../../scripts/commerce.js';

const productSearchQuery = `query ProductTeaserSearch($phrase: String!, $pageSize: Int!) {
  productSearch(phrase: $phrase, page_size: $pageSize) {
    items {
      productView {
        name
        sku
        urlKey
        images(roles: ["thumbnail"]) {
          url
          label
        }
      }
    }
  }
}`;

const FALLBACK_IMAGE = new URL('./placeholder.svg', import.meta.url).href;

function renderItem(product) {
  const image = (product.images && product.images[0] && product.images[0].url) || FALLBACK_IMAGE;
  const href = `/products/${product.urlKey}/${product.sku.toLowerCase()}`;
  const fig = document.createElement('div');
  fig.className = 'product-teaser-search-item';
  fig.innerHTML = `
    <a href="${href}">
      <picture><img loading="lazy" alt="${product.name}" src="${image}"></picture>
      <span>${product.name}</span>
    </a>`;
  // Swap to the local placeholder if the catalog image fails to load or
  // stalls (e.g. sandbox media host unreachable cross-origin — the request
  // hangs rather than firing an error, so also use a load timeout).
  const img = fig.querySelector('img');
  const useFallback = () => {
    if (img.src !== FALLBACK_IMAGE && !(img.complete && img.naturalWidth > 0)) {
      img.src = FALLBACK_IMAGE;
    }
  };
  img.addEventListener('error', useFallback);
  const timer = setTimeout(useFallback, 3000);
  img.addEventListener('load', () => {
    if (img.naturalWidth > 0) clearTimeout(timer);
  });
  return fig;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const phrase = config.phrase || '';
  const pageSize = parseInt(config.count, 10) || 4;

  block.textContent = '';
  const grid = document.createElement('div');
  grid.className = 'product-teaser-search-grid';
  block.append(grid);

  try {
    const data = await performCatalogServiceQuery(productSearchQuery, { phrase, pageSize });
    const items = (data && data.productSearch && data.productSearch.items) || [];
    if (!items.length) {
      block.textContent = '';
      return;
    }
    items.forEach(({ productView }) => {
      if (productView) grid.append(renderItem(productView));
    });
  } catch (e) {
    // Commerce backend unavailable — leave the block empty rather than error.
    block.textContent = '';
  }
}
