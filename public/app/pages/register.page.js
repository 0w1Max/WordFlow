import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export function renderRegister() {
  const app = document.getElementById("app");
  render(app, "", "");
}

// emailValue сохраняет введённый email при повторной отрисовке после ошибки
// (например, "такой email уже занят") — без этого пришлось бы вводить его
// заново только из-за проблемы в отдельном поле.
function render(app, errorMessage, emailValue) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        <span class="auth-mark">Wordflow</span>
        <h1 class="headline">Регистрация</h1>

        ${errorMessage ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ""}

        <form id="registerForm" class="form">
          <div class="field">
            <label class="field-label" for="email">Email</label>
            <input type="email" id="email" required autocomplete="email" value="${escapeHtml(emailValue)}" />
          </div>

          <div class="field">
            <label class="field-label" for="password">Пароль (минимум 8 символов)</label>
            <input type="password" id="password" required minlength="8" autocomplete="new-password" />
          </div>

          <div class="actions">
            <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%;">Создать аккаунт</button>
          </div>
        </form>

        <div class="auth-links">
          <span>Уже есть аккаунт? <a href="/login" id="toLogin">Войти</a></span>
        </div>
      </div>
    </div>
  `;

  document.getElementById("toLogin").onclick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  document.getElementById("registerForm").onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Создаём аккаунт…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await post("/auth/register", { email, password });
      navigate("/");
    } catch (err) {
      render(app, err.message, email);
    }
  };
}
