import { navigate } from "../core/router.js";
import { post } from "../core/api.js";
import { escapeHtml, passwordFieldHtml, attachPasswordToggles, brandMark, fieldWrapClass, fieldErrorHtml } from "../core/dom.js";

export function renderRegister() {
  const app = document.getElementById("app");
  render(app, "", null, "");
}

// emailValue сохраняет введённый email при повторной отрисовке после ошибки
// (например, "такой email уже занят") — без этого пришлось бы вводить его
// заново только из-за проблемы в отдельном поле.
//
// errorField — "такой email уже занят" (ConflictError) не приходит с полем,
// поэтому останется в общем баннере; а вот "укажите корректный email" или
// "пароль короче 8 символов" (ValidationError с field) подсветят нужный
// инпут напрямую.
function render(app, errorMessage, errorField, emailValue) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark("auth")}
        <h1 class="headline">Регистрация</h1>

        ${errorMessage && !errorField ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ""}

        <form id="registerForm" class="form">
          <div class="${fieldWrapClass("email", errorField)}">
            <label class="field-label" for="email">Email</label>
            <input type="email" id="email" required autocomplete="email" value="${escapeHtml(emailValue)}" />
            ${fieldErrorHtml("email", errorField, errorMessage)}
          </div>

          ${passwordFieldHtml("password", "Пароль (минимум 8 символов)", 'required minlength="8" autocomplete="new-password"', errorField === "password" ? errorMessage : "")}

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

  attachPasswordToggles(app);

  document.getElementById("registerForm").onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Создаём аккаунт…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await post("/auth/register", { email, password });
      navigate("/dashboard");
    } catch (err) {
      render(app, err.message, err.field, email);
    }
  };
}
