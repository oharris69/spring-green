// Curated product cards that reference AEM DAM images by path.
// Content authored as rows: [ image (DAM path) | title | link ].
// DAM assets deliver through EDS once the AEM <-> Edge Delivery connection is
// live; until then a local placeholder is shown so preview stays clean.

const FALLBACK_IMAGE = new URL('./placeholder.svg', import.meta.url).href;

export default function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('div');
  grid.className = 'product-cards-dam-grid';

  rows.forEach((row) => {
    const cells = [...row.children];
    const imgEl = row.querySelector('img');
    const imgSrc = (imgEl && imgEl.getAttribute('src'))
      || (cells[0] && cells[0].textContent.trim());
    const title = cells[1] ? cells[1].textContent.trim() : '';
    const link = row.querySelector('a');
    const href = link ? link.getAttribute('href') : '#';

    const card = document.createElement('div');
    card.className = 'product-cards-dam-item';
    card.innerHTML = `
      <a href="${href}">
        <picture><img loading="lazy" alt="${title}" src="${imgSrc || FALLBACK_IMAGE}"></picture>
        <span>${title}</span>
      </a>`;

    const img = card.querySelector('img');
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

    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
