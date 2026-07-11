import { navigate } from "../core/router.js";
import { get, post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export async function renderDashboard() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="page">
      <h1>WordFlow</h1>
      <p>Загрузка...</p>
    </div>
  `;

  try {
    // Если сессии нет — get("/auth/me") сам уведёт на /login (см. api.js),
    // дальше этот код не выполнится.
    const { user } = await get("/auth/me");
    const words = await get("/words");

    app.innerHTML = `
      <div class="page">
        <div class="topbar">
          <h1>WordFlow</h1>
          <button id="logoutBtn" class="link-btn">Выйти (${escapeHtml(user.email)})</button>
        </div>

        <p>Слов в базе: ${words.length}</p>

        <div class="form-actions">
          <button id="reviewBtn" ${words.length === 0 ? "disabled" : ""}>Повторить слова</button>
          <button id="addBtn">Добавить слово</button>
          <button id="wordsBtn">Мои слова</button>
        </div>
      </div>
    `;

    document.getElementById("reviewBtn").onclick = () => navigate("/review");
    document.getElementById("addBtn").onclick = () => navigate("/add");
    document.getElementById("wordsBtn").onclick = () => navigate("/words");

    document.getElementById("logoutBtn").onclick = async () => {
      try {
        await post("/auth/logout");
      } finally {
        window.location.href = "/login";
      }
    };

  } catch (e) {
    app.innerHTML = `
      <div class="page">
        <h1>WordFlow</h1>
        <p class="error">Не удалось загрузить данные: ${escapeHtml(e.message)}</p>
      </div>
    `;
  }
}
