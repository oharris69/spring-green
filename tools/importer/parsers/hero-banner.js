/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.spring-green.com/ (div.hero-top)
 * Generated: 2026-07-14
 *
 * Full-bleed banner: background image, eyebrow heading (h2), H1, address lookup form.
 * Hero model (xwalk): 1 column, 3 rows -> [name], [image], [text].
 *   Row 2 cell: background image (field:image)
 *   Row 3 cell: eyebrow + H1 as richtext (field:text)
 * The JS-driven address lookup form is interactive and not preserved as static content.
 */
export default function parse(element, { document }) {
  // Background image: may be a real <img> (scraped) or a CSS background-image
  // (live DOM sets background-image:url(...) on .hero-top-inner).
  let bgImage = element.querySelector('img');
  if (!bgImage) {
    const bgHost = element.querySelector('[style*="background-image"]')
      || (element.getAttribute('style') && /background-image/.test(element.getAttribute('style')) ? element : null);
    if (bgHost) {
      const style = bgHost.getAttribute('style') || '';
      const match = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
      if (match && match[2]) {
        bgImage = document.createElement('img');
        bgImage.src = match[2];
      }
    }
  }

  // Text content: eyebrow heading (h2) and main heading (h1)
  const eyebrow = element.querySelector('.hero-leaf-reverse h2, h2');
  const heading = element.querySelector('.hero-leaf-reverse h1, h1');

  // Empty-block guard
  if (!bgImage && !eyebrow && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image cell (field:image)
  const imageCell = document.createDocumentFragment();
  if (bgImage) {
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(bgImage);
  }
  cells.push([imageCell]);

  // Row 3: text cell (field:text) - eyebrow + heading as richtext
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (eyebrow) textCell.appendChild(eyebrow);
  if (heading) textCell.appendChild(heading);
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
