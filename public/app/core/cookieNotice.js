// Единственный cookie, который использует WordFlow, — сессия входа
// (httpOnly, этому скрипту вообще не видна). Никакой рекламы, аналитики
// или слежки за пользователем сайт не ведёт. Поэтому это не запрос
// разрешения "принять/отклонить" (нечего отклонять — cookie строго
// необходима для входа и не требует согласия по GDPR), а короткое,
// честное уведомление для прозрачности, показанное один раз.
const STORAGE_KEY = "wordflow:cookieNoticeSeen";

export function maybeShowCookieNotice() {
  if (localStorage.getItem(STORAGE_KEY)) return;

  const el = document.createElement("div");
  el.className = "cookie-notice";
  el.setAttribute("role", "status");

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

  document.getElementById("cookieNoticeOk").onclick = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    el.remove();
  };
}
