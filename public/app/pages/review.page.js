import { navigate } from '../core/router.js';
import { get, post } from '../core/api.js';
import { escapeHtml, brandMark, sproutIcon, wordWithAccentHtml } from '../core/dom.js';

export async function renderReview() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="page">
      <p class="loading-line">Собираем слова на сегодня…</p>
    </div>
  `;

  try {
    const words = await get('/words/due');
    if (!app.isConnected) return;
    startReview(app, words);
  } catch (e) {
    if (!app.isConnected) return;
    app.innerHTML = `
      <div class="page">
        ${brandMark()}
        <p class="error-banner" style="margin-top: 20px;">Не удалось загрузить слова: ${escapeHtml(e.message)}</p>
        <div class="actions"><button id="back" class="btn btn-ghost">Назад</button></div>
      </div>
    `;
    app.querySelector('#back').onclick = () => navigate('/dashboard');
  }
}

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
  if (!app.isConnected) return;
  const { words, index } = state;

  if (words.length === 0) {
    app.innerHTML = `
      <div class="page">
        ${brandMark()}
        <h1 class="headline" style="margin-top: 18px;">Повторение</h1>
        <div class="empty-state">
          <div class="empty-state-icon">${sproutIcon()}</div>
          <p>На сегодня наблюдений нет — всё уже показано по расписанию.</p>
          <div class="actions" style="justify-content: center;">
            <button id="addBtn" class="btn btn-primary">Добавить слово</button>
            <button id="back" class="btn btn-ghost">На главную</button>
          </div>
        </div>
      </div>
    `;
    app.querySelector('#addBtn').onclick = () => navigate('/add');
    app.querySelector('#back').onclick = () => navigate('/dashboard');
    return;
  }

  if (index >= words.length) {
    app.innerHTML = `
      <div class="page">
        ${brandMark()}
        <h1 class="headline" style="margin-top: 18px;">Повторение завершено</h1>
        <p class="meta-line">Пройдено <strong>${words.length}</strong> · вспомнено <strong>${state.reviewedCount}</strong></p>
        <div class="actions"><button id="back" class="btn btn-primary">На главную</button></div>
      </div>
    `;
    app.querySelector('#back').onclick = () => navigate('/dashboard');
    return;
  }

  const word = words[index];

  app.innerHTML = `
    <div class="page">
      ${brandMark()}
      <p class="flashcard-progress" style="margin-top: 18px;">Слово ${index + 1} из ${words.length}</p>

      <div class="flashcard">
        <p class="flashcard-word">${wordWithAccentHtml(word.text, word.accentIndex)}</p>

        ${
          state.revealed
            ? `
          <div class="flashcard-answer">
            <p class="flashcard-meaning">${escapeHtml(word.meaning)}</p>
            ${word.example ? `<p class="flashcard-example">«${escapeHtml(word.example)}»</p>` : ''}
          </div>
        `
            : ''
        }
      </div>

      <div class="actions">
        ${
          state.revealed
            ? `
          <button id="rememberedBtn" class="btn btn-primary">Вспомнил</button>
          <button id="forgotBtn" class="btn btn-ghost">Не вспомнил</button>
        `
            : `
          <button id="revealBtn" class="btn btn-primary">Показать ответ</button>
        `
        }
        <button id="back" class="btn-text">Прервать</button>
      </div>
    </div>
  `;

  app.querySelector('#back').onclick = () => navigate('/dashboard');

  if (!state.revealed) {
    app.querySelector('#revealBtn').onclick = () => {
      state.revealed = true;
      render(app, state);
    };
    return;
  }

  app.querySelector('#rememberedBtn').onclick = () => submitReview(app, state, word, true);
  app.querySelector('#forgotBtn').onclick = () => submitReview(app, state, word, false);
}
async function submitReview(app, state, word, remembered) {
  if (state.saving) return;
  state.saving = true;
  try {
    await post(`/words/${word.id}/review`, { remembered });
    if (!app.isConnected) return;
    if (remembered) state.reviewedCount += 1;
  } catch (e) {
    if (!app.isConnected) return;
    window.alert(`Не удалось сохранить повторение: ${e.message}`);
    return;
  } finally {
    state.saving = false;
  }

  state.index += 1;
  state.revealed = false;
  render(app, state);
}
