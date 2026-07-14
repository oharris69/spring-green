/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Spring-Green section breaks + section metadata.
 *
 * Runs in afterTransform only. Uses payload.template.sections to insert a
 * section break (<hr>) before every section except the first, and a
 * Section Metadata block for every section that declares a `style`.
 *
 * IMPORTANT: This runs AFTER the block parsers, which have already replaced
 * the source section elements (div.hero-top, #hero_bottom, div.grey-bend,
 * etc.) with WebImporter block tables (`<table>` whose first row is the
 * block title, e.g. "Hero Banner", "Hero Cta"). The original source
 * selectors no longer exist, so we anchor each section on its block table,
 * located by the table header text derived from the block name.
 *
 * Section -> block mapping (one block per section on this template):
 *   1. hero-banner       style: null
 *   2. cards-service     style: null
 *   3. columns-media     style: null
 *   4. hero-cta          style: "grey"
 *   5. carousel-article  style: null
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// "hero-banner" -> "hero banner" (WebImporter renders the block title from
// the block name; the table header text is the space-separated form).
function blockTitle(name) {
  return String(name).replace(/-/g, ' ').trim().toLowerCase();
}

// Find the block table for a section by matching its header row text.
function findSectionAnchor(element, section) {
  const blockName = (section.blocks && section.blocks[0]) || section.id;
  const wanted = blockTitle(blockName);
  const tables = element.querySelectorAll('table');
  for (let i = 0; i < tables.length; i += 1) {
    const headerCell = tables[i].querySelector('tr th, tr td');
    if (headerCell && headerCell.textContent.trim().toLowerCase() === wanted) {
      return tables[i];
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const template = payload && payload.template;
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;

    const doc = element.ownerDocument;

    // Process in reverse so inserted nodes never shift the anchors of
    // sections we have not handled yet.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section) continue;

      const sectionEl = findSectionAnchor(element, section);
      if (!sectionEl) continue;

      // Section Metadata block: only for sections that declare a style.
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        if (sectionEl.nextSibling) {
          sectionEl.parentNode.insertBefore(metadataBlock, sectionEl.nextSibling);
        } else {
          sectionEl.parentNode.appendChild(metadataBlock);
        }
      }

      // Section break: before every section except the first.
      if (i > 0) {
        const hr = doc.createElement('hr');
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }
}
