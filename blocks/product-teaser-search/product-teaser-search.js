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

function renderItem(product) {
  const image = (product.images && product.images[0] && product.images[0].url) || '';
  const href = `/products/${product.urlKey}/${product.sku.toLowerCase()}`;
  const fig = document.createElement('div');
  fig.className = 'product-teaser-search-item';
  fig.innerHTML = `
    <a href="${href}">
      <picture><img loading="lazy" alt="${product.name}" src="${image}"></picture>
      <span>${product.name}</span>
    </a>`;
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
