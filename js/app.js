(function () {
  var STORAGE_KEY = 'theme-preference';
  var ROUTE_BY_SECTION = {
    home: '/',
    profile: '/profile',
    expertise: '/expertise',
    experience: '/experience',
    practice: '/practice',
    contact: '/contact'
  };
  var docEl = document.documentElement;
  var header = document.querySelector('.site-header');
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('[data-nav-link]')) : [];
  var sectionLinks = Array.prototype.slice.call(document.querySelectorAll('a[data-section]'));
  var themeToggle = document.getElementById('theme-toggle');
  var prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var storedPreference = null;
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var hasSectionRoutes = Boolean(document.getElementById('home'));
  var hasInitializedRoute = false;

  function normalizePath(path) {
    var normalized = path || '/';
    if (normalized.indexOf('http') === 0) {
      normalized = normalized.replace(window.location.origin, '');
    }
    if (normalized.charAt(0) !== '/') {
      normalized = '/' + normalized;
    }
    if (normalized.length > 1 && normalized.charAt(normalized.length - 1) === '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized || '/';
  }

  function getInitialPath() {
    try {
      var params = new URLSearchParams(window.location.search);
      var redirectedRoute = params.get('route');
      if (redirectedRoute) {
        return normalizePath(redirectedRoute.split('?')[0].split('#')[0]);
      }
    } catch (err) {
      /* no-op */
    }
    return normalizePath(window.location.pathname);
  }

  function routeForSection(id) {
    return ROUTE_BY_SECTION[id] || null;
  }

  function sectionForPath(path) {
    var normalized = normalizePath(path);
    var sectionIds = Object.keys(ROUTE_BY_SECTION);
    for (var i = 0; i < sectionIds.length; i++) {
      var id = sectionIds[i];
      if (normalizePath(ROUTE_BY_SECTION[id]) === normalized) {
        return id;
      }
    }
    return normalized === '/' ? 'home' : null;
  }

  function getSectionById(id) {
    return id ? document.getElementById(id) : null;
  }

  function scrollToSection(id, smooth) {
    var section = getSectionById(id);
    if (!section) return;
    var headerOffset = header ? header.offsetHeight : 0;
    var top = section.getBoundingClientRect().top + window.pageYOffset - headerOffset - 16;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  function syncPathToSection(id, mode) {
    var targetPath = routeForSection(id);
    if (!targetPath || !window.history || typeof window.history.replaceState !== 'function') return;
    if (normalizePath(window.location.pathname) === normalizePath(targetPath) && window.location.search.indexOf('route=') === -1) {
      return;
    }
    if (mode === 'push' && typeof window.history.pushState === 'function') {
      window.history.pushState({ section: id }, '', targetPath);
      return;
    }
    window.history.replaceState({ section: id }, '', targetPath);
  }

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
      var target = link.getAttribute('data-section');
      if (target && target === id) {
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
    if (hasSectionRoutes && hasInitializedRoute) {
      syncPathToSection(currentId, 'replace');
    }
  }

  function handleInitialRoute() {
    if (!hasSectionRoutes) return;
    var initialSection = sectionForPath(getInitialPath()) || 'home';
    syncPathToSection(initialSection, 'replace');
    scrollToSection(initialSection, false);
    activateNavLink(initialSection);
    hasInitializedRoute = true;
  }

  initTheme();
  handleScroll();
  setupScrollSpy();
  handleInitialRoute();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = docEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });
  }

  sectionLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var targetId = link.getAttribute('data-section');
      if (targetId && getSectionById(targetId)) {
        event.preventDefault();
        scrollToSection(targetId, true);
        syncPathToSection(targetId, 'push');
        activateNavLink(targetId);
      }
      closeNav();
    });
  });

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
  }

  if (hasSectionRoutes) {
    window.addEventListener('popstate', function () {
      var targetId = sectionForPath(window.location.pathname) || 'home';
      scrollToSection(targetId, false);
      activateNavLink(targetId);
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', updateActiveSection);

  var yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
})();
