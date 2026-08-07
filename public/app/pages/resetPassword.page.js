import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml, passwordFieldHtml, attachPasswordToggles, brandMark } from "../core/dom.js";

export function renderResetPassword() {
  const app = document.getElementById("app");

  // Токен приходит из ссылки в письме как query-параметр — путь маршрута
  // остаётся "/reset-password" независимо от него, роутер это не трогает.
  const token = new URLSearchParams(window.location.search).get("token");

  if (!token) {
    app.innerHTML = `
      <div class="auth-shell">
        <div class="auth-card">
          ${brandMark("auth")}
          <p class="error-banner">Ссылка неполная — отсутствует токен сброса пароля.</p>
          <div class="auth-links">
            <a href="/login" id="toLogin">Вернуться ко входу</a>
          </div>
        </div>
      </div>
    `;
    document.getElementById("toLogin").onclick = (e) => {
      e.preventDefault();
      navigate("/login");
    };
    return;
  }

  render(app, token, "", null);
}

// errorField — "пароль короче 8 символов" приходит с field: "password" и
// подсвечивает сам инпут; "ссылка недействительна/устарела" — без field,
// остаётся общим баннером сверху (это не проблема введённого пароля).
function render(app, token, errorMessage, errorField) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark("auth")}
        <h1 class="headline">Новый пароль</h1>

        ${errorMessage && !errorField ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ""}

        <form id="resetForm" class="form">
          ${passwordFieldHtml("password", "Новый пароль (минимум 8 символов)", 'required minlength="8" autocomplete="new-password"', errorField === "password" ? errorMessage : "")}

          <div class="actions">
            <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%;">Сохранить пароль</button>
          </div>
        </form>
      </div>
    </div>
  `;

  attachPasswordToggles(app);

  document.getElementById("resetForm").onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Сохраняем…";

    const password = document.getElementById("password").value;

    try {
      await post("/auth/reset-password", { token, password });
      navigate("/login");
    } catch (err) {
      render(app, token, err.message, err.field);
    }
  };
}
