import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export function renderLogin() {
  const app = document.getElementById("app");
  render(app, "");
}

function render(app, errorMessage) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        <span class="auth-mark">Wordflow</span>
        <h1 class="headline">Вход</h1>

        ${errorMessage ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ""}

        <form id="loginForm" class="form">
          <div class="field">
            <label class="field-label" for="email">Email</label>
            <input type="email" id="email" required autocomplete="email" />
          </div>

          <div class="field">
            <label class="field-label" for="password">Пароль</label>
            <input type="password" id="password" required autocomplete="current-password" />
          </div>

          <div class="actions">
            <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%;">Войти</button>
          </div>
        </form>

        <div class="auth-links">
          <span>Нет аккаунта? <a href="/register" id="toRegister">Зарегистрироваться</a></span>
          <a href="/forgot-password" id="toForgot">Забыли пароль?</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById("toRegister").onclick = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  document.getElementById("toForgot").onclick = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Входим…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await post("/auth/login", { email, password });
      navigate("/");
    } catch (err) {
      render(app, err.message);
    }
  };
}
