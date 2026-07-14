/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Spring-Green site-wide cleanup.
 *
 * Removes non-authorable SPA chrome and scaffolding so the import contains only
 * the page-level authorable content that lives under .container.bg-white
 * (hero-top, hero_bottom, satisfaction_guarantee, grey-bend, green-bend).
 *
 * All selectors below were verified against migration-work/cleaned.html:
 *   - Top utility bar:      <div class="bg-gray-200 pt-2" id="index">   (line 6)
 *   - Sticky header/nav:    <div class="header ... is-sticky" id="index"> (line 33)
 *   - Desktop menu nav:     <nav class="hidden lg:block ... menu ...">    (line 49)
 *   - Mobile menu nav:      <nav class="mobile max-h-96 overflow-y-scroll"> (line 395)
 *   - Search overlay:       <div id="search-bar" ...>                     (line 595)
 *   - Footer:               <footer class="py-4 md:py-8">                 (line 2076)
 *   - Vue teleport root:    <div id="teleports">                          (line 2169)
 *   - reCAPTCHA badge/logo: <div class="grecaptcha-badge"> etc.           (lines 2172-2177)
 *   - reCAPTCHA iframe:     <iframe title="reCAPTCHA" ...>                (line 2174)
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // SPA overlays / scaffolding that can interfere with block parsing.
    // reCAPTCHA badge + iframe and the Vue teleport root are injected chrome.
    WebImporter.DOMUtils.remove(element, [
      '#teleports',
      '.grecaptcha-badge',
      '.grecaptcha-logo',
      '.grecaptcha-error',
      'iframe[title="reCAPTCHA"]',
      '#search-bar',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome: header/utility bar, navigation, footer,
    // and any residual iframes / links / noscript.
    WebImporter.DOMUtils.remove(element, [
      '#index.bg-gray-200', // top utility bar (Proudly Serving / Contact Us)
      '.header.is-sticky',  // sticky header wrapper (logo + desktop nav)
      'nav',                // desktop + mobile menus
      'footer',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
