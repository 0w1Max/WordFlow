import { navigate } from "../core/router.js";
import { get, post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export async function renderReview() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="page">
      <h2>Повторение</h2>
      <p>Загрузка слов...</p>
    </div>
  `;

  try {
    const words = await get("/words");
    startReview(app, words);
  } catch (e) {
    app.innerHTML = `
      <div class="page">
        <h2>Повторение</h2>
        <p class="error">Не удалось загрузить слова: ${escapeHtml(e.message)}</p>
        <button id="back">Назад</button>
      </div>
    `;
    document.getElementById("back").onclick = () => navigate("/");
  }
}

// Настоящего алгоритма интервального повторения (SM-2 и т.п.) пока нет —
// это осознанно оставлено на следующий этап (см. роадмап). Сейчас
// повторяются все сохранённые слова по очереди, но каждое нажатие
// "Вспомнил" уже пишет в базу review_count/last_review — данные,
// на которых будущий алгоритм сможет строить расписание повторений.
function startReview(app, words) {
  const state = {
    words,
    index: 0,
    revealed: false,
    reviewedCount: 0
  };

  render(app, state);
}

function render(app, state) {
  const { words, index } = state;

  if (words.length === 0) {
    app.innerHTML = `
      <div class="page">
        <h2>Повторение</h2>
        <p>Пока нечего повторять — сначала добавьте хотя бы одно слово.</p>
        <button id="addBtn">Добавить слово</button>
        <button id="back">Назад</button>
      </div>
    `;
    document.getElementById("addBtn").onclick = () => navigate("/add");
    document.getElementById("back").onclick = () => navigate("/");
    return;
  }

  if (index >= words.length) {
    app.innerHTML = `
      <div class="page">
        <h2>Повторение завершено</h2>
        <p>Вы прошли ${words.length} слов(а), из них отмечено как «вспомнил»: ${state.reviewedCount}.</p>
        <button id="back">На главную</button>
      </div>
    `;
    document.getElementById("back").onclick = () => navigate("/");
    return;
  }

  const word = words[index];

  app.innerHTML = `
    <div class="page">
      <h2>Повторение</h2>
      <p class="progress">Слово ${index + 1} из ${words.length}</p>

      <div class="card">
        <p class="card-word">${escapeHtml(word.text)}</p>

        ${state.revealed ? `
          <p class="card-meaning">${escapeHtml(word.meaning)}</p>
          ${word.example ? `<p class="card-example">«${escapeHtml(word.example)}»</p>` : ""}
        ` : ""}
      </div>

      <div class="form-actions">
        ${state.revealed ? `
          <button id="rememberedBtn">Вспомнил</button>
          <button id="skipBtn">Не вспомнил</button>
        ` : `
          <button id="revealBtn">Показать ответ</button>
        `}
        <button id="back">Прервать</button>
      </div>
    </div>
  `;

  document.getElementById("back").onclick = () => navigate("/");

  if (!state.revealed) {
    document.getElementById("revealBtn").onclick = () => {
      state.revealed = true;
      render(app, state);
    };
    return;
  }

  document.getElementById("rememberedBtn").onclick = async () => {
    try {
      await post(`/words/${word.id}/review`);
      state.reviewedCount += 1;
    } catch (e) {
      // Не удалось сохранить отметку о повторении — не блокируем сам
      // процесс повторения, просто идём дальше без учёта этого слова.
    }

    goToNext(app, state);
  };

  document.getElementById("skipBtn").onclick = () => {
    goToNext(app, state);
  };
}

function goToNext(app, state) {
  state.index += 1;
  state.revealed = false;
  render(app, state);
}
