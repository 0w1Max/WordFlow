import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export function renderForgotPassword() {
  const app = document.getElementById("app");
  render(app, "", "");
}

function render(app, message, errorMessage) {
  app.innerHTML = `
    <div class="page">
      <h1>WordFlow</h1>
      <h2>Восстановление пароля</h2>

      ${errorMessage ? `<p class="error">${escapeHtml(errorMessage)}</p>` : ""}
      ${message ? `<p>${escapeHtml(message)}</p>` : ""}

      ${!message ? `
        <form id="forgotForm" class="form">
          <label>
            Email
            <input type="email" id="email" required autocomplete="email" />
          </label>

          <div class="form-actions">
            <button type="submit" id="submitBtn">Отправить ссылку</button>
          </div>
        </form>
      ` : ""}

      <p><a href="/login" id="toLogin">Вернуться ко входу</a></p>
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
    submitBtn.textContent = "Отправка...";

    const email = document.getElementById("email").value.trim();

    try {
      const res = await post("/auth/forgot-password", { email });
      // Бэкенд намеренно отвечает одинаково успешно независимо от того,
      // существует такой email или нет — это защита от перебора адресов.
      render(app, res.message, "");
    } catch (err) {
      render(app, "", err.message);
    }
  };
}
