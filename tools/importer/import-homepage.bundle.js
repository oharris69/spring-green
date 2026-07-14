/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    let bgImage = element.querySelector("img");
    if (!bgImage) {
      const bgHost = element.querySelector('[style*="background-image"]') || (element.getAttribute("style") && /background-image/.test(element.getAttribute("style")) ? element : null);
      if (bgHost) {
        const style = bgHost.getAttribute("style") || "";
        const match = style.match(/background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i);
        if (match && match[2]) {
          bgImage = document.createElement("img");
          bgImage.src = match[2];
        }
      }
    }
    const eyebrow = element.querySelector(".hero-leaf-reverse h2, h2");
    const heading = element.querySelector(".hero-leaf-reverse h1, h1");
    if (!bgImage && !eyebrow && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = document.createDocumentFragment();
    if (bgImage) {
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(bgImage);
    }
    cells.push([imageCell]);
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (eyebrow) textCell.appendChild(eyebrow);
    if (heading) textCell.appendChild(heading);
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-service.js
  function parse2(element, { document }) {
    const cards = Array.from(element.querySelectorAll("a.card"));
    if (!cards.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const href = card.getAttribute("href");
      const heading = card.querySelector('h2, h3, [class*="title"]');
      const description = card.querySelector("p.shadowed-text, p");
      const image = card.querySelector("img");
      const imageCell = document.createDocumentFragment();
      if (image) {
        imageCell.appendChild(document.createComment(" field:image "));
        imageCell.appendChild(image);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (heading) textCell.appendChild(heading);
      if (description) textCell.appendChild(description);
      if (href) {
        const cta = document.createElement("a");
        cta.setAttribute("href", href);
        cta.textContent = heading ? heading.textContent.trim() : "Learn more";
        const ctaWrap = document.createElement("p");
        ctaWrap.appendChild(cta);
        textCell.appendChild(ctaWrap);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-service", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function parse3(element, { document }) {
    const textArea = element.querySelector("#satisfaction_text, .satisfaction-text") || element;
    const gridRows = Array.from(textArea.querySelectorAll(":scope > div.grid, :scope div.grid"));
    if (!gridRows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    gridRows.forEach((grid) => {
      const columns = Array.from(grid.children).filter((child) => {
        if (child.tagName === "IMG") return true;
        return child.textContent.trim().length > 0 || child.querySelector("img");
      });
      if (columns.length) {
        cells.push(columns);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-cta.js
  function parse4(element, { document }) {
    const content = element.querySelector(".thin") || element;
    const heading = content.querySelector('h1, h2, h3, [class*="title"]');
    const paragraphs = Array.from(content.querySelectorAll("p"));
    if (!heading && !paragraphs.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([""]);
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (heading) textCell.appendChild(heading);
    paragraphs.forEach((p) => textCell.appendChild(p));
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-article.js
  function parse5(element, { document }) {
    const slideEls = Array.from(element.querySelectorAll("li.carousel__slide, li"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    slideEls.forEach((slide) => {
      const heading = slide.querySelector('h2, h3, [class*="title"]');
      const ctaLink = slide.querySelector("a[href]");
      const description = slide.querySelector("p:not(:has(a))") || slide.querySelector("p");
      const image = slide.querySelector("img");
      if (!heading && !ctaLink) return;
      const key = ctaLink && ctaLink.getAttribute("href") || heading && heading.textContent.trim() || image && image.getAttribute("src");
      if (!key || seen.has(key)) return;
      seen.add(key);
      const imageCell = document.createDocumentFragment();
      if (image) {
        imageCell.appendChild(document.createComment(" field:media_image "));
        imageCell.appendChild(image);
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:content_text "));
      if (heading) textCell.appendChild(heading);
      if (description && description !== heading) textCell.appendChild(description);
      if (ctaLink) {
        const cta = document.createElement("a");
        cta.setAttribute("href", ctaLink.getAttribute("href"));
        cta.textContent = ctaLink.textContent.trim() || "Learn more";
        const ctaWrap = document.createElement("p");
        ctaWrap.appendChild(cta);
        textCell.appendChild(ctaWrap);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/spring-green-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#teleports",
        ".grecaptcha-badge",
        ".grecaptcha-logo",
        ".grecaptcha-error",
        'iframe[title="reCAPTCHA"]',
        "#search-bar"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#index.bg-gray-200",
        // top utility bar (Proudly Serving / Contact Us)
        ".header.is-sticky",
        // sticky header wrapper (logo + desktop nav)
        "nav",
        // desktop + mobile menus
        "footer",
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/spring-green-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function blockTitle(name) {
    return String(name).replace(/-/g, " ").trim().toLowerCase();
  }
  function findSectionAnchor(element, section) {
    const blockName = section.blocks && section.blocks[0] || section.id;
    const wanted = blockTitle(blockName);
    const tables = element.querySelectorAll("table");
    for (let i = 0; i < tables.length; i += 1) {
      const headerCell = tables[i].querySelector("tr th, tr td");
      if (headerCell && headerCell.textContent.trim().toLowerCase() === wanted) {
        return tables[i];
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const template = payload && payload.template;
      const sections = template && template.sections;
      if (!sections || sections.length < 2) return;
      const doc = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section) continue;
        const sectionEl = findSectionAnchor(element, section);
        if (!sectionEl) continue;
        if (section.style) {
          const metadataBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          if (sectionEl.nextSibling) {
            sectionEl.parentNode.insertBefore(metadataBlock, sectionEl.nextSibling);
          } else {
            sectionEl.parentNode.appendChild(metadataBlock);
          }
        }
        if (i > 0) {
          const hr = doc.createElement("hr");
          sectionEl.parentNode.insertBefore(hr, sectionEl);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Spring-Green homepage: hero with service quote form, three service cards (Lawn Care, Pest Control, Tree Care), 'The Green in SpringGreen' about section with satisfaction guarantee, service provider locator, and a Yardology article carousel.",
    urls: [
      "https://www.spring-green.com/"
    ],
    blocks: [
      { name: "hero-banner", instances: ["div.hero-top"] },
      { name: "cards-service", instances: ["#hero_bottom"] },
      { name: "columns-media", instances: ["#satisfaction_guarantee"] },
      { name: "hero-cta", instances: ["div.grey-bend"] },
      { name: "carousel-article", instances: ["div.green-bend"] }
    ],
    sections: [
      { id: "hero", name: "Hero", selector: ".hero-banner", style: null, blocks: ["hero-banner"], defaultContent: [] },
      { id: "service-cards", name: "Service Cards", selector: ".cards-service", style: null, blocks: ["cards-service"], defaultContent: [] },
      { id: "about-satisfaction", name: "About / Satisfaction", selector: ".columns-media", style: null, blocks: ["columns-media"], defaultContent: [] },
      { id: "locator", name: "Service Provider Locator", selector: ".hero-cta", style: "grey", blocks: ["hero-cta"], defaultContent: [] },
      { id: "yardology-carousel", name: "Yardology Carousel", selector: ".carousel-article", style: null, blocks: ["carousel-article"], defaultContent: [] }
    ]
  };
  var parsers = {
    "hero-banner": parse,
    "cards-service": parse2,
    "columns-media": parse3,
    "hero-cta": parse4,
    "carousel-article": parse5
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
