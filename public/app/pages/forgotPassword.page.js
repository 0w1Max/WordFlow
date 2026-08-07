import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml, brandMark, fieldWrapClass, fieldErrorHtml } from "../core/dom.js";

export function renderForgotPassword() {
  const app = document.getElementById("app");
  render(app, "", "", null, "");
}

function render(app, message, errorMessage, errorField, emailValue) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark("auth")}
        <h1 class="headline">Восстановление пароля</h1>

        ${errorMessage && !errorField ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ""}
        ${message ? `<p class="notice-banner">${escapeHtml(message)}</p>` : ""}

        ${!message ? `
          <form id="forgotForm" class="form">
            <div class="${fieldWrapClass("email", errorField)}">
              <label class="field-label" for="email">Email</label>
              <input type="email" id="email" required autocomplete="email" value="${escapeHtml(emailValue)}" />
              ${fieldErrorHtml("email", errorField, errorMessage)}
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
      render(app, res.message, "", null, email);
    } catch (err) {
      render(app, "", err.message, err.field, email);
    }
  };
}
