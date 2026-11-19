import { router, initRouter, navigate } from './core/router.js';
import { maybeShowCookieNotice } from './core/cookieNotice.js';

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  router();
  maybeShowCookieNotice();
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('[data-spa-link]');
    if (!link) return;

    e.preventDefault();
    navigate(link.getAttribute('href'));
  });
});
