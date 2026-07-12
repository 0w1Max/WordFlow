import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export function renderForgotPassword() {
  const app = document.getElementById("app");
  render(app, "", "", "");
}

function render(app, message, errorMessage, emailValue) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        <span class="auth-mark">Wordflow</span>
        <h1 class="headline">Восстановление пароля</h1>

        ${errorMessage ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ""}
        ${message ? `<p class="notice-banner">${escapeHtml(message)}</p>` : ""}

        ${!message ? `
          <form id="forgotForm" class="form">
            <div class="field">
              <label class="field-label" for="email">Email</label>
              <input type="email" id="email" required autocomplete="email" value="${escapeHtml(emailValue)}" />
            </div>

            <div class="actions">
              <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%;">Отправить ссылку</button>
            </div>
          </form>
        ` : ""}

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

  const form = document.getElementById("forgotForm");
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправляем…";

    const email = document.getElementById("email").value.trim();

    try {
      const res = await post("/auth/forgot-password", { email });
      // Бэкенд намеренно отвечает одинаково успешно независимо от того,
      // существует такой email или нет — это защита от перебора адресов.
      render(app, res.message, "", email);
    } catch (err) {
      render(app, "", err.message, email);
    }
  };
}
