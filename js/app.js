(function () {
  var STORAGE_KEY = 'theme-preference';
  var docEl = document.documentElement;
  var header = document.querySelector('.site-header');
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('[data-nav-link]')) : [];
  var themeToggle = document.getElementById('theme-toggle');
  var prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var storedPreference = null;
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  function getStoredTheme() {
    if (storedPreference !== null) return storedPreference;
    try {
      storedPreference = localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      storedPreference = null;
    }
    return storedPreference;
  }

  function saveTheme(value) {
    storedPreference = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (err) {
      /* no-op */
    }
  }

  function currentSystemTheme() {
    return prefersDark && prefersDark.matches ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    docEl.setAttribute('data-theme', theme);
    if (!themeToggle) return;
    themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    themeToggle.setAttribute('data-theme', theme);
    var titleText = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggle.setAttribute('title', titleText);
    if (persist) {
      saveTheme(theme);
    }
  }

  function initTheme() {
    var stored = getStoredTheme();
    var startingTheme = stored || currentSystemTheme();
    applyTheme(startingTheme, Boolean(stored));
    if (!stored && prefersDark && typeof prefersDark.addEventListener === 'function') {
      prefersDark.addEventListener('change', function (event) {
        applyTheme(event.matches ? 'dark' : 'light', false);
      });
    }
  }

  function toggleNav(forceClose) {
    if (!nav || !navToggle) return;
    var isOpen = typeof forceClose === 'boolean' ? !forceClose : navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', forceClose ? 'false' : (!isOpen).toString());
    if (forceClose) {
      header && header.classList.remove('is-open');
    } else {
      header && header.classList.toggle('is-open', !isOpen);
    }
  }

  function closeNav() {
    if (!navToggle || navToggle.getAttribute('aria-expanded') === 'false') return;
    navToggle.setAttribute('aria-expanded', 'false');
    header && header.classList.remove('is-open');
  }

  function handleScroll() {
    if (!header) return;
    if (window.scrollY > 10) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    updateActiveSection();
  }

  function activateNavLink(id) {
    if (!navLinks.length) return;
    navLinks.forEach(function (link) {
      var target = link.getAttribute('href');
      if (target && target === '#' + id) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  function setupScrollSpy() {
    updateActiveSection();
  }

  function updateActiveSection() {
    if (!sections.length) return;
    var headerOffset = header ? header.offsetHeight : 0;
    var scrollPosition = window.scrollY + headerOffset + 120;
    var currentId = sections[0].id;

    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      if (section.offsetTop <= scrollPosition) {
        currentId = section.id;
      }
    }

    activateNavLink(currentId);
  }

  initTheme();
  handleScroll();
  setupScrollSpy();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = docEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', (!expanded).toString());
      header && header.classList.toggle('is-open', !expanded);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeNav();
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeNav();
      });
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', updateActiveSection);

  var yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
})();
