import { router, initRouter } from "./core/router.js";
import { maybeShowCookieNotice } from "./core/cookieNotice.js";

document.addEventListener("DOMContentLoaded", () => {
  initRouter();
  router();
  maybeShowCookieNotice();
});
