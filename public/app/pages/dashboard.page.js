import { navigate } from "../core/router.js";
import { get, post } from "../core/api.js";
import { escapeHtml, brandMark, wordWithStressHtml } from "../core/dom.js";

export async function renderDashboard() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="page">
      <p class="loading-line">Открываем рабочий стол…</p>
    </div>
  `;

  try {
    // Если сессии нет — get("/auth/me") сам уведёт на /login (см. api.js),
    // дальше этот код не выполнится.
    const { user } = await get("/auth/me");
    const [words, due] = await Promise.all([get("/words"), get("/words/due")]);

    // Недавно добавленные — API уже отдаёт слова отсортированными по
    // created_at DESC (см. wordRepository.getAllWords), поэтому первые
    // несколько в списке и есть самые свежие.
    const recent = words.slice(0, 3);

    app.innerHTML = `
      <div class="page">
        <div class="masthead">
          ${brandMark()}
          <div class="masthead-user">
            <span>${user.isGuest ? "Гость" : escapeHtml(user.email)}</span>
            <button id="logoutBtn" class="btn-text">Выйти</button>
          </div>
        </div>

        ${user.isGuest ? `
          <div class="guest-banner">
            <span>Вы пробуете WordFlow как гость — слова привязаны к этой сессии в браузере и будут потеряны, если выйти без сохранения прогресса.</span>
            <button id="saveProgressBtn" class="btn btn-ghost">Сохранить прогресс</button>
          </div>
        ` : ""}

        <p class="desk-greeting">${greeting()}</p>
        <h1 class="headline">Ваш рабочий стол</h1>

        <div class="desk-stats">
          <div class="desk-stat desk-stat-primary">
            <p class="desk-stat-number">${due.length}</p>
            <p class="desk-stat-label">К повторению сегодня</p>
          </div>
          <div class="desk-stat">
            <p class="desk-stat-number">${words.length}</p>
            <p class="desk-stat-label">Всего в коллекции</p>
          </div>
        </div>

        <div class="actions">
          <button id="reviewBtn" class="btn btn-primary" ${due.length === 0 ? "disabled" : ""}>
            ${due.length === 0 ? "Нечего повторять" : `Повторить ${due.length}`}
          </button>
          <button id="addBtn" class="btn btn-ghost">Добавить слово</button>
          <button id="wordsBtn" class="btn btn-ghost">Все слова</button>
        </div>

        ${recent.length > 0 ? `
          <p class="desk-section-title">Недавно собрано</p>
          <ul class="desk-recent-list">
            ${recent.map(w => `
              <li class="desk-recent-item">
                <span class="desk-recent-word">${wordWithStressHtml(w.text, w.stressIndex)}</span>
                <span class="desk-recent-meaning">${escapeHtml(w.meaning)}</span>
              </li>
            `).join("")}
          </ul>
        ` : ""}
      </div>
    `;

    document.getElementById("reviewBtn").onclick = () => navigate("/review");
    document.getElementById("addBtn").onclick = () => navigate("/add");
    document.getElementById("wordsBtn").onclick = () => navigate("/words");
    document.getElementById("saveProgressBtn")?.addEventListener("click", () => navigate("/save-progress"));

    document.getElementById("logoutBtn").onclick = async () => {
      // ВАЖНО: гостевой аккаунт не имеет email/пароля — это просто обычная
      // запись в users со случайным сгенерированным email (см.
      // createGuestSession в services/authService.js). Сессионная cookie —
      // единственное, что связывает браузер с этим аккаунтом. Если её
      // очистить (что и делает logout), вернуться к тем же словам будет
      // нечем: следующий клик "Продолжить как гость" создаст новый, пустой
      // аккаунт. Раньше это происходило молча — человек терял слова, даже
      // не подозревая, что "выйти" для гостя необратимо. Теперь явно
      // предупреждаем и подсказываем путь к "Сохранить прогресс" — то есть
      // к authService.claimAccount, который привязывает email/пароль к
      // ЭТОМУ ЖЕ аккаунту, не создавая новый.
      if (user.isGuest) {
        const wantsToSave = window.confirm(
          "Вы вошли как гость. Слова привязаны только к этой сессии в браузере — если выйти сейчас, не сохранив прогресс, вернуть их будет невозможно.\n\n" +
          "Нажмите «ОК», чтобы сначала сохранить прогресс (указать email и пароль), или «Отмена», чтобы посмотреть другие варианты."
        );

        if (wantsToSave) {
          navigate("/save-progress");
          return;
        }

        const confirmedLoss = window.confirm(
          "Точно выйти без сохранения? Все слова, собранные в этой гостевой сессии, будут потеряны безвозвратно."
        );

        if (!confirmedLoss) return;
      }

      try {
        await post("/auth/logout");
      } finally {
        window.location.href = "/";
      }
    };

  } catch (e) {
    app.innerHTML = `
      <div class="page">
        ${brandMark()}
        <p class="error-banner" style="margin-top: 20px;">Не удалось загрузить коллекцию: ${escapeHtml(e.message)}</p>
      </div>
    `;
  }
}

// "Доброе утро" / "Добрый день" / "Добрый вечер" / "Доброй ночи" — реальное
// локальное время браузера, не выдумка. Мелочь, но именно она превращает
// dashboard из "списка данных" в рабочий стол, который знает, что сейчас.
function greeting() {
  const hour = new Date().getHours();

  if (hour < 6) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}
