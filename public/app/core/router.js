import { renderDashboard } from "../pages/dashboard.page.js";
import { renderReview } from "../pages/review.page.js";
import { renderAddWord } from "../pages/addWord.page.js";
import { renderWordsList } from "../pages/wordsList.page.js";
import { renderLogin } from "../pages/login.page.js";
import { renderRegister } from "../pages/register.page.js";

const routes = {
  "/": renderDashboard,
  "/review": renderReview,
  "/add": renderAddWord,
  "/words": renderWordsList,
  "/login": renderLogin,
  "/register": renderRegister
};

export function router() {
  const path = window.location.pathname;
  const page = routes[path] || renderDashboard;

  page();
}

export function navigate(path) {
  window.history.pushState({}, "", path);
  router();
}

export function initRouter() {
  window.addEventListener("popstate", router);
}
