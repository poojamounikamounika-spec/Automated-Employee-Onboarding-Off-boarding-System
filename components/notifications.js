// ============================================================
// notifications.js — Toast & in-app notification system
// ============================================================

const NotificationSystem = (() => {
  let container = null;

  function init() {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; top: 80px; right: 20px;
      z-index: 10000; display: flex; flex-direction: column; gap: 12px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  function show(message, type = 'info', duration = 4000) {
    if (!container) init();
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️', approval: '📋', task: '📌' };
    const colors = {
      success: 'linear-gradient(135deg,#10B981,#059669)',
      error: 'linear-gradient(135deg,#F43F5E,#DC2626)',
      warning: 'linear-gradient(135deg,#F59E0B,#D97706)',
      info: 'linear-gradient(135deg,#06B6D4,#0891B2)',
      approval: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
      task: 'linear-gradient(135deg,#3B82F6,#2563EB)',
    };
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${colors[type] || colors.info};
      color: #fff; padding: 14px 20px; border-radius: 12px;
      font-family: 'Inter', sans-serif; font-size: 14px;
      display: flex; align-items: center; gap: 10px;
      min-width: 280px; max-width: 380px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      pointer-events: all; cursor: pointer;
      transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
      backdrop-filter: blur(10px);
    `;
    toast.innerHTML = `<span style="font-size:18px">${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    toast.addEventListener('click', () => removeToast(toast));
    setTimeout(() => removeToast(toast), duration);
    return toast;
  }

  function removeToast(toast) {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 400);
  }

  return { init, show };
})();

window.NotificationSystem = NotificationSystem;
