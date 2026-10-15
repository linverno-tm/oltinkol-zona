(() => {
  const toast = t => { let el = document.querySelector('.demo-toast'); if (!el) { el = document.createElement('div'); el.className = 'demo-toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = t; clearTimeout(toast.h); toast.h = setTimeout(() => el.remove(), 3200); };
  document.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    if (f.querySelector('[name=parol]') && f.querySelector('[name=login]')) { location.href = '/oltinkol-zona/panel/'; return; }
    if (f.action && f.action.endsWith('/chiqish/')) { location.href = '/oltinkol-zona/panel/kirish/'; return; }
    toast('Namuna: haqiqiy panelda bu saqlanadi va sayt bir necha soniyada yangilanadi');
  }, true);
})();
