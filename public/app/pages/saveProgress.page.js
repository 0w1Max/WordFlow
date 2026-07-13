import { navigate } from "../core/router.js";
import { get, post } from "../core/api.js";
import { escapeHtml, passwordFieldHtml, attachPasswordToggles, brandMark } from "../core/dom.js";

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

  render(app, "");
}

function render(app, errorMessage) {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark("auth")}
        <h1 class="headline">Сохранить прогресс</h1>
        <p class="meta-line" style="margin-bottom: 20px;">
          Привяжите email и пароль к этому аккаунту — все уже собранные слова останутся на месте.
        </p>

        ${errorMessage ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ""}

        <form id="claimForm" class="form">
          <div class="field">
            <label class="field-label" for="email">Email</label>
            <input type="email" id="email" required autocomplete="email" />
          </div>

          ${passwordFieldHtml("password", "Пароль (минимум 8 символов)", 'required minlength="8" autocomplete="new-password"')}

          <div class="actions">
            <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%;">Сохранить аккаунт</button>
          </div>
        </form>

        <div class="auth-links">
          <a href="/dashboard" id="skipLink">Пропустить, вернуться позже</a>
        </div>
      </div>
    </div>
  `;

  attachPasswordToggles(app);

  document.getElementById("skipLink").onclick = (e) => {
    e.preventDefault();
    navigate("/dashboard");
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
      render(app, err.message);
    }
  };
}
