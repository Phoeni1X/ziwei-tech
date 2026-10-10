/* Progressive enhancement: content is visible until an observer is ready. */
(function (root) {
  'use strict';

  const doc = root.document;
  if (!doc) return;

  const selectors = [
    '.home-refined .home-section-label',
    '.home-refined .home-about-grid',
    '.home-refined .home-section-heading',
    '.home-refined .home-product-figure',
    '.home-refined .home-product-links > .home-product-link',
    '.home-refined .home-applications-grid > article',
    '.home-refined .home-research-copy',
    '.home-refined .home-research-images > figure',
    '.home-refined .home-news',
    '.home-refined .home-mission-intro',
    '.home-refined .home-mission h2',
    '.home-refined .home-mission-values',
    '.home-refined .home-culture-link',
    '.home-refined .home-contact-grid > *',
    '.about-page .about-article > .about-section:not(.culture-gallery)',
    '.about-page .culture-gallery-heading',
    '.about-page .culture-gallery-card',
    '.about-page .honor-card',
    '.product-page .catalog-row',
    '.product-page .product-specs',
    '.radar-page .radar-introduction',
    '.radar-page .radar-article > .radar-section:not([aria-labelledby="radar-specifications-title"])',
    '.radar-page #radar-specifications-title',
    '.radar-page .radar-spec-grid > .radar-spec-group',
    '.radar-page .radar-spec-grid > .radar-technical-note',
    '.radar-page .radar-installations',
    '.news-center-page .news-entry',
    '.news-center-page .news-account',
    '.careers-page .career-job',
    '.careers-page .careers-contact',
    '.about-page .download-document',
    '.about-page .information-contact',
    '.about-page .about-empty',
    '.customization-page .customization-intro'
  ].join(', ');

  const pending = new Set();
  const tracked = new Set();
  let observer;
  let stopped = false;

  function reveal(element, immediately = false, delay = 0) {
    if (!pending.has(element) && !immediately) return;
    if (immediately) {
      element.classList.remove('pmt-reveal-pending', 'pmt-reveal');
      element.style.removeProperty('--pmt-reveal-delay');
    } else {
      element.style.setProperty('--pmt-reveal-delay', `${delay}ms`);
      element.classList.remove('pmt-reveal-pending');
    }
    pending.delete(element);
    if (observer) observer.unobserve(element);
    if (!pending.size && observer) observer.disconnect();
  }

  function stop() {
    stopped = true;
    // Clear visual state before disconnecting so an observer failure cannot hide content.
    for (const element of tracked) {
      element.classList.remove('pmt-reveal-pending', 'pmt-reveal');
      element.style.removeProperty('--pmt-reveal-delay');
    }
    pending.clear();
    if (observer) observer.disconnect();
  }

  function guarded(callback) {
    return function (...args) {
      if (stopped) return;
      try { callback(...args); } catch (_) { stop(); }
    };
  }

  function hashTarget() {
    const raw = root.location.hash.slice(1);
    if (!raw) return null;
    let id = raw;
    try { id = decodeURIComponent(raw); } catch (_) { /* Keep malformed fragments harmless. */ }
    return doc.getElementById(id);
  }

  function relatedToTarget(element, target, includeChildren) {
    return target && (element === target || element.contains(target) || (includeChildren && target.contains(element)));
  }

  function revealTarget(target, includeChildren = false) {
    if (!target || target.nodeType !== 1) return;
    for (const element of tracked) {
      if (relatedToTarget(element, target, includeChildren)) reveal(element, true);
    }
  }

  function viewportHeight() {
    return root.innerHeight || doc.documentElement.clientHeight;
  }

  function onIntersect(entries) {
    const visible = entries.filter(entry => entry.isIntersecting && pending.has(entry.target))
      .map(entry => ({ element: entry.target, rect: entry.target.getBoundingClientRect() }))
      .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left);
    let rowTop = -Infinity;
    let column = 0;
    for (const item of visible) {
      if (Math.abs(item.rect.top - rowTop) > 12) { rowTop = item.rect.top; column = 0; }
      reveal(item.element, false, Math.min(column * 60, 120));
      column += 1;
    }
  }

  function init() {
    if (!root.IntersectionObserver || !root.matchMedia) return;
    const reduced = root.matchMedia('(prefers-reduced-motion: reduce)');
    const print = root.matchMedia('print');
    if (reduced.matches || print.matches) return;

    observer = new root.IntersectionObserver(guarded(onIntersect), {
      root: null,
      rootMargin: '0px 0px -24px 0px',
      threshold: 0
    });

    const eligible = Array.from(doc.querySelectorAll(selectors)).filter(element =>
      !element.closest('header, nav, form, .hero, .about-hero, .careers-hero, [hidden], [data-reveal-ignore]'));
    const candidateSet = new Set(eligible);
    const candidates = eligible.filter(element => {
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        if (candidateSet.has(parent)) return false;
      }
      return true;
    });
    const anchor = hashTarget();
    const height = viewportHeight();
    for (const element of candidates) {
      const rect = element.getBoundingClientRect();
      if (rect.top < height || rect.height <= 0 || rect.width <= 0 ||
          relatedToTarget(element, anchor, true) || relatedToTarget(element, doc.activeElement, false)) continue;
      tracked.add(element);
      observer.observe(element);
      pending.add(element);
      element.classList.add('pmt-reveal', 'pmt-reveal-pending');
    }

    doc.addEventListener('focusin', guarded(event => revealTarget(event.target)), true);
    root.addEventListener('hashchange', guarded(() => revealTarget(hashTarget(), true)));
    root.addEventListener('beforeprint', guarded(stop));
    root.addEventListener('pageshow', guarded(() => {
      revealTarget(hashTarget(), true);
      for (const element of pending) {
        const rect = element.getBoundingClientRect();
        if (rect.top < viewportHeight() && rect.bottom > 0) reveal(element, true);
      }
    }));
    const preferenceChanged = guarded(() => { if (reduced.matches || print.matches) stop(); });
    for (const query of [reduced, print]) {
      if (query.addEventListener) query.addEventListener('change', preferenceChanged);
      else if (query.addListener) query.addListener(preferenceChanged);
    }
    if (!pending.size) observer.disconnect();
  }

  // Defer integration normally calls this after i18n has settled the initial page text.
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', guarded(init), { once: true });
  else guarded(init)();
})(window);
