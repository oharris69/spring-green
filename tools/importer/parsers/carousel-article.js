/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-article. Base: carousel.
 * Source: https://www.spring-green.com/ (div.green-bend)
 * Generated: 2026-07-14
 *
 * Yardology article carousel. Each unique slide (li.carousel__slide) has a
 * square image + heading + description + 'Learn more' link. The carousel JS
 * generates clone slides (carousel__slide--clone) and empty lazy-load
 * placeholders, so slides are deduped by article href (fallback: heading text).
 *
 * Carousel model (xwalk): container block, one row per slide, 2 cells:
 *   cell 1 = image (field:media_image)
 *   cell 2 = text (field:content_text) = heading + description + CTA link
 */
export default function parse(element, { document }) {
  // All slide list items (includes clones + empty lazy placeholders).
  const slideEls = Array.from(element.querySelectorAll('li.carousel__slide, li'));

  const cells = [];
  const seen = new Set();

  slideEls.forEach((slide) => {
    const heading = slide.querySelector('h2, h3, [class*="title"]');
    // Prefer the article CTA link; the whole slide may also be linked.
    const ctaLink = slide.querySelector('a[href]');
    const description = slide.querySelector('p:not(:has(a))') || slide.querySelector('p');
    const image = slide.querySelector('img');

    // Skip empty lazy-load placeholders (no heading and no link = not a real slide).
    if (!heading && !ctaLink) return;

    // Dedup key: article href first, else heading text.
    const key = (ctaLink && ctaLink.getAttribute('href'))
      || (heading && heading.textContent.trim())
      || (image && image.getAttribute('src'));
    if (!key || seen.has(key)) return;
    seen.add(key);

    // Cell 1: image (field:media_image)
    const imageCell = document.createDocumentFragment();
    if (image) {
      imageCell.appendChild(document.createComment(' field:media_image '));
      imageCell.appendChild(image);
    }

    // Cell 2: text (field:content_text) = heading + description + CTA link
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:content_text '));
    if (heading) textCell.appendChild(heading);
    if (description && description !== heading) textCell.appendChild(description);
    if (ctaLink) {
      // Reconstruct a clean CTA anchor (avoids pulling in wrapping markup).
      const cta = document.createElement('a');
      cta.setAttribute('href', ctaLink.getAttribute('href'));
      cta.textContent = ctaLink.textContent.trim() || 'Learn more';
      const ctaWrap = document.createElement('p');
      ctaWrap.appendChild(cta);
      textCell.appendChild(ctaWrap);
    }

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-article', cells });
  element.replaceWith(block);
}
