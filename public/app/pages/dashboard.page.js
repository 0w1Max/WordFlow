import { navigate } from "../core/router.js";
import { get, post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export async function renderDashboard() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="page">
      <p class="loading-line">Открываем коллекцию…</p>
    </div>
  `;

  try {
    // Если сессии нет — get("/auth/me") сам уведёт на /login (см. api.js),
    // дальше этот код не выполнится.
    const { user } = await get("/auth/me");
    const [words, due] = await Promise.all([get("/words"), get("/words/due")]);

    app.innerHTML = `
      <div class="page">
        <div class="masthead">
          <span class="masthead-mark">Wordflow</span>
          <div class="masthead-user">
            <span>${escapeHtml(user.email)}</span>
            <button id="logoutBtn" class="btn-text">Выйти</button>
          </div>
        </div>

        <h1 class="headline">Ваша коллекция</h1>
        <p class="meta-line"><strong>${words.length}</strong> слов${wordSuffix(words.length)} собрано · <strong>${due.length}</strong> на сегодня</p>

        <div class="actions">
          <button id="reviewBtn" class="btn btn-primary" ${due.length === 0 ? "disabled" : ""}>
            ${due.length === 0 ? "Нечего повторять" : `Повторить ${due.length}`}
          </button>
          <button id="addBtn" class="btn btn-ghost">Добавить слово</button>
          <button id="wordsBtn" class="btn btn-ghost">Все слова</button>
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
        <span class="masthead-mark">Wordflow</span>
        <p class="error-banner" style="margin-top: 20px;">Не удалось загрузить коллекцию: ${escapeHtml(e.message)}</p>
      </div>
    `;
  }
}

// "1 слово", "2 слова", "5 слов" — родительный/именительный падеж по числу,
// мелочь, но именно из таких мелочей складывается ощущение, что интерфейс
// написан для человека, а не сгенерирован.
function wordSuffix(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "о";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "а";
  return "";
}
