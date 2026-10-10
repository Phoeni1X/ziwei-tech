(function (root) {
  'use strict';

  function normalizeLanguage(value) {
    return value === 'en' ? 'en' : 'zh';
  }

  function translateText(value, language, dictionary) {
    if (language !== 'en' || !value) return value;
    const parts = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const source = parts[2];
    let translated = Object.prototype.hasOwnProperty.call(dictionary, source) ? dictionary[source] : null;
    if (translated === null) {
      const lengthLimit = source.match(/^请将内容控制在 (\d+) 个字符以内。$/);
      if (lengthLimit && dictionary['请将内容控制在 {max} 个字符以内。']) {
        translated = dictionary['请将内容控制在 {max} 个字符以内。'].replace('{max}', lengthLimit[1]);
      }
    }
    return translated === null ? value : parts[1] + translated + parts[3];
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { normalizeLanguage, translateText };
  if (!root.document) return;

  const dictionary = root.PMT_TRANSLATIONS_EN || {};
  const storageKey = 'pmt-language';
  const button = document.querySelector('.language-toggle');
  const textRecords = new WeakMap();
  const attributeRecords = new WeakMap();
  const translatedAttributes = ['alt', 'title', 'aria-label', 'placeholder'];
  const skipSelector = 'script, style, noscript, textarea, [data-i18n-ignore]';
  let language = 'zh';
  let scheduled = false;

  try { language = normalizeLanguage(root.localStorage.getItem(storageKey)); } catch (_) { /* Private browsers can disable storage. */ }

  function convert(current, record) {
    const source = record && current === record.last ? record.source : current;
    return { source, last: translateText(source, language, dictionary) };
  }

  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement || node.parentElement.closest(skipSelector)) return;
      const record = convert(node.nodeValue, textRecords.get(node));
      textRecords.set(node, record);
      if (node.nodeValue !== record.last) node.nodeValue = record.last;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || node.closest(skipSelector)) return;
    const names = [...translatedAttributes];
    if (node.tagName === 'META' && ['description', 'og:title', 'og:description'].includes(node.getAttribute('name') || node.getAttribute('property'))) names.push('content');
    let records = attributeRecords.get(node);
    if (!records) { records = {}; attributeRecords.set(node, records); }
    for (const name of names) {
      if (!node.hasAttribute(name)) continue;
      const value = node.getAttribute(name);
      const record = convert(value, records[name]);
      records[name] = record;
      if (value !== record.last) node.setAttribute(name, record.last);
    }
  }

  const observer = new MutationObserver(() => {
    if (language !== 'en' || scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; render(); });
  });

  function render() {
    observer.disconnect();
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateNode(node);
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    if (button) {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(language === 'en'));
      button.setAttribute('aria-label', language === 'en' ? '切换至中文' : 'Switch to English');
    }
    observer.observe(document.documentElement, {
      subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: [...translatedAttributes, 'content']
    });
  }

  function setLanguage(next, persist = true) {
    language = normalizeLanguage(next);
    if (persist) {
      try { root.localStorage.setItem(storageKey, language); } catch (_) { /* Switching still works in this page. */ }
    }
    render();
    root.dispatchEvent(new CustomEvent('pmt:languagechange', { detail: { language } }));
  }

  root.PMTI18n = {
    t(value) { return translateText(value, language, dictionary); },
    get language() { return language; },
    setLanguage
  };
  if (button) button.addEventListener('click', () => setLanguage(language === 'en' ? 'zh' : 'en'));
  root.addEventListener('storage', event => {
    if (event.key === storageKey) setLanguage(event.newValue, false);
  });
  render();
})(typeof window === 'undefined' ? globalThis : window);
