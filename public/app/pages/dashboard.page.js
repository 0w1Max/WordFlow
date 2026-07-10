import { navigate } from "../core/router.js";
import { get } from "../core/api.js";
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
    const words = await get("/words");

    app.innerHTML = `
      <div class="page">
        <h1>WordFlow</h1>

        <p>Слов в базе: ${words.length}</p>

        <div class="form-actions">
          <button id="reviewBtn" ${words.length === 0 ? "disabled" : ""}>Повторить слова</button>
          <button id="addBtn">Добавить слово</button>
        </div>
      </div>
    `;

    document.getElementById("reviewBtn").onclick = () => {
      navigate("/review");
    };

    document.getElementById("addBtn").onclick = () => {
      navigate("/add");
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