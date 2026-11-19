const STORAGE_KEY = 'wordflow:cookieNoticeSeen';

export function maybeShowCookieNotice() {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
  } catch {
    /* Storage can be disabled by browser privacy settings. */
  }

  const el = document.createElement('div');
  el.className = 'cookie-notice';
  el.setAttribute('role', 'status');

  el.innerHTML = `
    <p style="margin: 0;">
      Мы используем один cookie-файл — чтобы запомнить, что вы вошли в аккаунт.
      Рекламы и слежки за вами на сайте нет.
    </p>
    <div class="cookie-notice-actions">
      <button type="button" class="btn btn-primary" id="cookieNoticeOk">Понятно</button>
    </div>
  `;

  document.body.appendChild(el);

  document.getElementById('cookieNoticeOk').onclick = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* Dismiss for this visit. */
    }
    el.remove();
  };
}
