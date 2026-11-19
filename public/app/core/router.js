import { renderLanding } from '../pages/landing.page.js';
import { renderDashboard } from '../pages/dashboard.page.js';
import { renderReview } from '../pages/review.page.js';
import { renderAddWord } from '../pages/addWord.page.js';
import { renderWordsList } from '../pages/wordsList.page.js';
import { renderLogin } from '../pages/login.page.js';
import { renderRegister } from '../pages/register.page.js';
import { renderForgotPassword } from '../pages/forgotPassword.page.js';
import { renderResetPassword } from '../pages/resetPassword.page.js';
import { renderSaveProgress } from '../pages/saveProgress.page.js';
import { renderConfirmLogout } from '../pages/confirmLogout.page.js';
import { escapeHtml } from './html.js';

const routes = {
  '/': renderLanding,
  '/dashboard': renderDashboard,
  '/review': renderReview,
  '/add': renderAddWord,
  '/words': renderWordsList,
  '/login': renderLogin,
  '/register': renderRegister,
  '/forgot-password': renderForgotPassword,
  '/reset-password': renderResetPassword,
  '/save-progress': renderSaveProgress,
  '/leave': renderConfirmLogout
};

export async function router() {
  const path = window.location.pathname;
  const page = routes[path] || renderLanding;
  const previous = document.getElementById('app');
  const current = previous.cloneNode(false);
  previous.replaceWith(current);

  try {
    await page();
  } catch (error) {
    if (!current.isConnected) return;
    document.getElementById('app').innerHTML =
      `<div class="page"><p class="error-banner">${escapeHtml(error.message)}</p><a href="/" data-spa-link>На главную</a></div>`;
  }
}

export function navigate(path) {
  window.history.pushState({}, '', path);
  router();
}

export function initRouter() {
  window.addEventListener('popstate', router);
}
