(function() {
  var KEY = 'theme-preference';
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
  }

  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var initial = stored || (prefersDark ? 'dark' : 'light');
  apply(initial);

  window.addEventListener('DOMContentLoaded', function() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      apply(current === 'dark' ? 'light' : 'dark');
    });
    // Graceful fallback if LinkedIn badge script is blocked
    try {
      var badge = document.querySelector('.badge-base.LI-profile-badge');
      if (badge) {
        setTimeout(function(){
          var hasIframe = badge.querySelector('iframe');
          if (!hasIframe) {
            var a = document.createElement('a');
            a.className = 'btn btn-sm btn-outline-primary mt-2';
            a.href = 'https://linkedin.com/in/daniel-ishimwe-k';
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = 'View LinkedIn Profile';
            badge.appendChild(a);
          }
        }, 1500);
      }
    } catch (e) {}
  });
})();
