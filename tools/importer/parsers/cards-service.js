/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-service. Base: cards.
 * Source: https://www.spring-green.com/ (#hero_bottom)
 * Generated: 2026-07-14
 *
 * 3 linked service cards, each an <a class="card"> containing:
 *   h2 (heading), p.shadowed-text (description), span.icon-arrow, img.card-img.
 * Cards model (xwalk): container block, one row per card, 2 cells:
 *   cell 1 = image (field:image)
 *   cell 2 = text (field:text) = heading + description + CTA link (from card href)
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('a.card'));

  // Empty-block guard
  if (!cards.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const href = card.getAttribute('href');
    const heading = card.querySelector('h2, h3, [class*="title"]');
    const description = card.querySelector('p.shadowed-text, p');
    const image = card.querySelector('img');

    // Cell 1: image (field:image)
    const imageCell = document.createDocumentFragment();
    if (image) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(image);
    }

    // Cell 2: text (field:text) = heading + description + CTA link
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (heading) textCell.appendChild(heading);
    if (description) textCell.appendChild(description);
    // The card itself is the link; reconstruct a CTA anchor using the heading label.
    if (href) {
      const cta = document.createElement('a');
      cta.setAttribute('href', href);
      cta.textContent = heading ? heading.textContent.trim() : 'Learn more';
      const ctaWrap = document.createElement('p');
      ctaWrap.appendChild(cta);
      textCell.appendChild(ctaWrap);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-service', cells });
  element.replaceWith(block);
}
