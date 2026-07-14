/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: https://www.spring-green.com/ (#satisfaction_guarantee)
 * Generated: 2026-07-14
 *
 * Two side-by-side text/image rows inside #satisfaction_text:
 *   Row 1: text (h2 + p, col-span-2) + image
 *   Row 2 (after <hr>): image + text (p, col-span-2)
 * Columns model (xwalk): NO field hints. First row = block name;
 * each subsequent row = one grid row with 2 cells (2 columns).
 * Decorative curve images (curveBottomLeft / midCurve bg / curveTopLeft) are
 * section styling artifacts and are excluded.
 */
export default function parse(element, { document }) {
  // Content lives inside the satisfaction text area, laid out as grid rows.
  const textArea = element.querySelector('#satisfaction_text, .satisfaction-text') || element;
  const gridRows = Array.from(textArea.querySelectorAll(':scope > div.grid, :scope div.grid'));

  // Empty-block guard
  if (!gridRows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  gridRows.forEach((grid) => {
    // Each direct child of the grid becomes a column cell (text block or image).
    const columns = Array.from(grid.children).filter((child) => {
      // keep elements that carry content (text wrappers or images)
      if (child.tagName === 'IMG') return true;
      return child.textContent.trim().length > 0 || child.querySelector('img');
    });
    if (columns.length) {
      cells.push(columns);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
