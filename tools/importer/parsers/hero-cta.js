/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-cta. Base: hero.
 * Source: https://www.spring-green.com/ (div.grey-bend)
 * Generated: 2026-07-14
 *
 * Text-only CTA panel: heading (h2.h3) + paragraph + 'See Service Area' button.
 * No background image.
 * Hero model (xwalk): 1 column, 3 rows -> [name], [image], [text].
 *   Row 2 cell: image (empty here -> no field hint on empty cell)
 *   Row 3 cell: heading + paragraph + CTA as richtext (field:text)
 */
export default function parse(element, { document }) {
  const content = element.querySelector('.thin') || element;

  const heading = content.querySelector('h1, h2, h3, [class*="title"]');
  const paragraphs = Array.from(content.querySelectorAll('p'));

  // Empty-block guard
  if (!heading && !paragraphs.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image cell (empty for this variant - no hint on empty cell)
  cells.push(['']);

  // Row 3: text cell (field:text) = heading + paragraphs (incl. CTA button)
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  paragraphs.forEach((p) => textCell.appendChild(p));
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-cta', cells });
  element.replaceWith(block);
}
