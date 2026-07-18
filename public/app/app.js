import { router, initRouter, navigate } from "./core/router.js";
import { maybeShowCookieNotice } from "./core/cookieNotice.js";

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
  router();
  maybeShowCookieNotice();

  // Логотип (brandMark из core/dom.js) рендерится как <a href="/"> на
  // каждой странице — семантично и доступно с клавиатуры. Но переход по
  // нему должен идти через клиентский роутер, а не перезагружать страницу
  // (это SPA) — поэтому один делегированный обработчик на весь документ,
  // а не подписка на каждой странице по отдельности.
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("[data-spa-link]");
    if (!link) return;

    e.preventDefault();
    navigate(link.getAttribute("href"));
  });
});
