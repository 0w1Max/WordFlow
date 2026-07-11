import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export function renderResetPassword() {
  const app = document.getElementById("app");

  // Токен приходит из ссылки в письме как query-параметр — путь маршрута
  // остаётся "/reset-password" независимо от него, роутер это не трогает.
  const token = new URLSearchParams(window.location.search).get("token");

  if (!token) {
    app.innerHTML = `
      <div class="page">
        <h1>WordFlow</h1>
        <p class="error">Ссылка неполная — отсутствует токен сброса пароля.</p>
        <p><a href="/login" id="toLogin">Вернуться ко входу</a></p>
      </div>
    `;
    document.getElementById("toLogin").onclick = (e) => {
      e.preventDefault();
      navigate("/login");
    };
    return;
  }

  render(app, token, "");
}

function render(app, token, errorMessage) {
  app.innerHTML = `
    <div class="page">
      <h1>WordFlow</h1>
      <h2>Новый пароль</h2>

      ${errorMessage ? `<p class="error">${escapeHtml(errorMessage)}</p>` : ""}

      <form id="resetForm" class="form">
        <label>
          Новый пароль (минимум 8 символов)
          <input type="password" id="password" required minlength="8" autocomplete="new-password" />
        </label>

        <div class="form-actions">
          <button type="submit" id="submitBtn">Сохранить пароль</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById("resetForm").onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Сохранение...";

    const password = document.getElementById("password").value;

    try {
      await post("/auth/reset-password", { token, password });
      navigate("/login");
    } catch (err) {
      render(app, token, err.message);
    }
  };
}
