// ============================================================
// router.js — Client-side view router
// ============================================================

const Router = (() => {
  let currentView = null;
  const views = {};
  const history = [];

  function register(name, renderFn) {
    views[name] = renderFn;
  }

  function navigate(viewName, params = {}) {
    const main = document.getElementById('app-main');
    if (!main) return;

    if (currentView === viewName && !params.force) return;

    // Fade out
    main.style.opacity = '0';
    main.style.transform = 'translateY(8px)';

    setTimeout(() => {
      main.innerHTML = '';
      if (views[viewName]) {
        views[viewName](main, params);
        currentView = viewName;
        history.push(viewName);
        updateNavActive(viewName);
        // Fade in
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
      }
    }, 180);
  }

  function updateNavActive(viewName) {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === viewName);
    });
  }

  function getCurrent() { return currentView; }

  return { register, navigate, getCurrent };
})();

window.Router = Router;
