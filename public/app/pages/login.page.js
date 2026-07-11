import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export function renderLogin() {
  const app = document.getElementById("app");
  render(app, "");
}

function render(app, errorMessage) {
  app.innerHTML = `
    <div class="page">
      <h1>WordFlow</h1>
      <h2>Вход</h2>

      ${errorMessage ? `<p class="error">${escapeHtml(errorMessage)}</p>` : ""}

      <form id="loginForm" class="form">
        <label>
          Email
          <input type="email" id="email" required autocomplete="email" />
        </label>

        <label>
          Пароль
          <input type="password" id="password" required autocomplete="current-password" />
        </label>

        <div class="form-actions">
          <button type="submit" id="submitBtn">Войти</button>
        </div>
      </form>

      <p>Нет аккаунта? <a href="/register" id="toRegister">Зарегистрироваться</a></p>
    </div>
  `;

  document.getElementById("toRegister").onclick = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Вход...";

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
