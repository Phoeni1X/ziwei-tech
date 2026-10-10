const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const desktopNavigation = window.matchMedia('(min-width: 1001px)');
const dropdowns = Array.from(navigation.querySelectorAll('.nav-dropdown')).map(element => ({
  element,
  button: element.querySelector('.nav-dropdown-toggle'),
  panel: element.querySelector('.nav-submenu'),
  pinned: false,
  closeTimer: null,
}));

function closeDropdown(dropdown) {
  clearTimeout(dropdown.closeTimer);
  dropdown.button.setAttribute('aria-expanded', 'false');
  dropdown.panel.hidden = true;
  dropdown.pinned = false;
}

function openDropdown(dropdown, pinned = false) {
  dropdowns.forEach(other => {
    if (other !== dropdown) closeDropdown(other);
  });
  clearTimeout(dropdown.closeTimer);
  dropdown.pinned = pinned;
  dropdown.button.setAttribute('aria-expanded', 'true');
  dropdown.panel.hidden = false;
}

function closeNavigation() {
  dropdowns.forEach(closeDropdown);
  navigation.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', '打开导航菜单');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  closeNavigation();
  if (open) {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', '关闭导航菜单');
    navigation.classList.add('open');
  }
});

dropdowns.forEach(dropdown => {
  const { element, button, panel } = dropdown;
  const links = Array.from(panel.querySelectorAll('a[href]'));

  button.addEventListener('click', () => {
    // The first click keeps a hover-open menu open; the second closes it.
    if (!panel.hidden && dropdown.pinned) closeDropdown(dropdown);
    else openDropdown(dropdown, true);
  });

  element.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !desktopNavigation.matches) return;
    clearTimeout(dropdown.closeTimer);
    if (panel.hidden) openDropdown(dropdown);
  });

  element.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse' || !desktopNavigation.matches) return;
    dropdown.closeTimer = setTimeout(() => {
      if (!dropdown.pinned && !panel.contains(document.activeElement)) closeDropdown(dropdown);
    }, 180);
  });

  element.addEventListener('focusout', event => {
    if (!element.contains(event.relatedTarget)) closeDropdown(dropdown);
  });

  element.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    openDropdown(dropdown, true);
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const current = links.indexOf(document.activeElement);
    const next = current === -1 ? (direction === 1 ? 0 : links.length - 1)
      : (current + direction + links.length) % links.length;
    links[next]?.focus();
  });
});

navigation.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', closeNavigation));

document.addEventListener('pointerdown', event => {
  if (!event.target.closest('.header')) closeNavigation();
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const expanded = dropdowns.find(dropdown => !dropdown.panel.hidden);
  if (expanded) {
    event.preventDefault();
    closeDropdown(expanded);
    expanded.button.focus();
  } else if (toggle.getAttribute('aria-expanded') === 'true') {
    closeNavigation();
    toggle.focus();
  }
});
desktopNavigation.addEventListener('change', closeNavigation);
window.addEventListener('pageshow', closeNavigation);
document.querySelector('#year').textContent = new Date().getFullYear();
