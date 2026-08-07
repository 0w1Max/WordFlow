import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml, passwordFieldHtml, attachPasswordToggles, brandMark, fieldWrapClass, fieldErrorHtml } from "../core/dom.js";

export function renderLogin() {
  const app = document.getElementById("app");
  render(app, "", null, "");
}

// emailValue сохраняет введённый email при повторной отрисовке после ошибки —
// раньше форма перерисовывалась с нуля и человеку приходилось вводить email
// заново, потеряв всего лишь из-за опечатки в пароле. Пароль сознательно не
// восстанавливаем — это стандартная практика после неудачного входа.
//
// errorField — если сервер указал, к какому полю относится ошибка (см.
// err.field в core/api.js), подсвечиваем именно его. Общий баннер сверху
// остаётся для ошибок без привязки к полю (например, "неверный email или
// пароль" — намеренно не уточняет, какое из двух).
function render(app, errorMessage, errorField, emailValue) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark("auth")}
        <h1 class="headline">Вход</h1>

        ${errorMessage && !errorField ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ""}

        <form id="loginForm" class="form">
          <div class="${fieldWrapClass("email", errorField)}">
            <label class="field-label" for="email">Email</label>
            <input type="email" id="email" required autocomplete="email" value="${escapeHtml(emailValue)}" />
            ${fieldErrorHtml("email", errorField, errorMessage)}
          </div>

          ${passwordFieldHtml("password", "Пароль", 'required autocomplete="current-password"', errorField === "password" ? errorMessage : "")}

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

  attachPasswordToggles(app);

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
      navigate("/dashboard");
    } catch (err) {
      render(app, err.message, err.field, email);
    }
  };
}
