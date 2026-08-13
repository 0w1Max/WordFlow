import { navigate } from "../core/router.js";
import { get, post } from "../core/api.js";
import { escapeHtml, passwordFieldHtml, attachPasswordToggles, brandMark, fieldWrapClass, fieldErrorHtml, wireRequiredFieldsToggle } from "../core/dom.js";

export async function renderSaveProgress() {
  const app = document.getElementById("app");

  app.innerHTML = `<div class="page"><p class="loading-line">Проверяем аккаунт…</p></div>`;

  // get() сам уведёт на /login, если сессии нет вообще — сюда можно
  // попасть только уже с какой-то сессией (гостевой или обычной).
  const { user } = await get("/auth/me");

  if (!user.isGuest) {
    // Обычному пользователю тут нечего делать — email и пароль уже есть.
    navigate("/dashboard");
    return;
  }

  render(app, "", null);
}

function render(app, errorMessage, errorField) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark("auth")}
        <h1 class="headline">Сохранить прогресс</h1>
        <p class="meta-line" style="margin-bottom: 20px;">
          Привяжите email и пароль к этому аккаунту — все уже собранные слова останутся на месте.
        </p>

        ${errorMessage && !errorField ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ""}

        <form id="claimForm" class="form">
          <div class="${fieldWrapClass("email", errorField)}">
            <label class="field-label" for="email">Email</label>
            <input type="email" id="email" required autocomplete="email" />
            ${fieldErrorHtml("email", errorField, errorMessage)}
          </div>

          ${passwordFieldHtml("password", "Пароль (минимум 8 символов)", 'required minlength="8" autocomplete="new-password"', errorField === "password" ? errorMessage : "")}

          <div class="actions">
            <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%;">Сохранить аккаунт</button>
          </div>
        </form>

        <div class="auth-links">
          <a href="/dashboard" id="skipLink">Пропустить, вернуться позже</a>
          <a href="/" id="logoutWithoutSavingLink" class="auth-link-danger">Выйти без сохранения</a>
        </div>
      </div>
    </div>
  `;

  attachPasswordToggles(app);

  wireRequiredFieldsToggle(
    document.getElementById("submitBtn"),
    [document.getElementById("email"), document.getElementById("password")]
  );

  document.getElementById("skipLink").onclick = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  // БАГ, который чинит эта ссылка: раньше единственным способом покинуть
  // этот экран было "Пропустить" — а оно ведёт обратно на /dashboard, а
  // не разлогинивает. Человек, который специально пришёл сюда, чтобы
  // выйти, утыкался в замкнутый круг: dashboard → сюда → "Пропустить" →
  // снова dashboard, без реальной возможности прервать гостевую сессию.
  // Эта ссылка — настоящий logout, а не переход назад; сразу выполняет
  // выход, без всплывающих окон — сам её текст и приглушённый цвет
  // (.auth-link-danger, см. components.css) уже дают понять, что это
  // другое, необратимое действие, а не рядовая навигация.
  document.getElementById("logoutWithoutSavingLink").onclick = async (e) => {
    e.preventDefault();

    try {
      await post("/auth/logout");
    } finally {
      window.location.href = "/";
    }
  };

  document.getElementById("claimForm").onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Сохраняем…";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await post("/auth/claim", { email, password });
      navigate("/dashboard");
    } catch (err) {
      render(app, err.message, err.field);
    }
  };
}
