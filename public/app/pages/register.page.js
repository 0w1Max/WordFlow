import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export function renderRegister() {
  const app = document.getElementById("app");
  render(app, "");
}

function render(app, errorMessage) {
  app.innerHTML = `
    <div class="page">
      <h1>WordFlow</h1>
      <h2>Регистрация</h2>

      ${errorMessage ? `<p class="error">${escapeHtml(errorMessage)}</p>` : ""}

      <form id="registerForm" class="form">
        <label>
          Email
          <input type="email" id="email" required autocomplete="email" />
        </label>

        <label>
          Пароль (минимум 8 символов)
          <input type="password" id="password" required minlength="8" autocomplete="new-password" />
        </label>

        <div class="form-actions">
          <button type="submit" id="submitBtn">Зарегистрироваться</button>
        </div>
      </form>

      <p>Уже есть аккаунт? <a href="/login" id="toLogin">Войти</a></p>
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
    submitBtn.textContent = "Создание аккаунта...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await post("/auth/register", { email, password });
      navigate("/");
    } catch (err) {
      render(app, err.message);
    }
  };
}
