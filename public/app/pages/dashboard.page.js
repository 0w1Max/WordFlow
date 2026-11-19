import { navigate } from '../core/router.js';
import { get, post } from '../core/api.js';
import { escapeHtml, brandMark, wordWithAccentHtml } from '../core/dom.js';

export async function renderDashboard() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="page">
      <p class="loading-line">Открываем рабочий стол…</p>
    </div>
  `;

  try {
    const { user } = await get('/auth/me');
    if (!app.isConnected) return;
    const [words, due] = await Promise.all([get('/words'), get('/words/due')]);
    if (!app.isConnected) return;
    const recent = words.slice(0, 3);

    app.innerHTML = `
      <div class="page">
        <div class="masthead">
          ${brandMark()}
          <div class="masthead-user">
            <span>${user.isGuest ? 'Гость' : escapeHtml(user.email)}</span>
            <button id="logoutBtn" class="btn-text">Выйти</button>
          </div>
        </div>

        ${
          user.isGuest
            ? `
          <div class="guest-banner">
            <span>Вы пробуете WordFlow как гость — слова привязаны к этой сессии в браузере и будут потеряны, если выйти без сохранения прогресса.</span>
            <button id="saveProgressBtn" class="btn btn-ghost">Сохранить прогресс</button>
          </div>
        `
            : ''
        }

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
          <button id="reviewBtn" class="btn btn-primary" ${due.length === 0 ? 'disabled' : ''}>
            ${due.length === 0 ? 'Нечего повторять' : `Повторить ${due.length}`}
          </button>
          <button id="addBtn" class="btn btn-ghost">Добавить слово</button>
          <button id="wordsBtn" class="btn btn-ghost">Все слова</button>
        </div>

        ${
          recent.length > 0
            ? `
          <p class="desk-section-title">Недавно собрано</p>
          <ul class="desk-recent-list">
            ${recent
              .map(
                (w) => `
              <li class="desk-recent-item">
                <span class="desk-recent-word">${wordWithAccentHtml(w.text, w.accentIndex)}</span>
                <span class="desk-recent-meaning">${escapeHtml(w.meaning)}</span>
              </li>
            `
              )
              .join('')}
          </ul>
        `
            : ''
        }
      </div>
    `;

    app.querySelector('#reviewBtn').onclick = () => navigate('/review');
    app.querySelector('#addBtn').onclick = () => navigate('/add');
    app.querySelector('#wordsBtn').onclick = () => navigate('/words');
    app
      .querySelector('#saveProgressBtn')
      ?.addEventListener('click', () => navigate('/save-progress'));

    app.querySelector('#logoutBtn').onclick = async () => {
      if (user.isGuest) {
        navigate('/leave');
        return;
      }

      try {
        await post('/auth/logout');
        if (!app.isConnected) return;
      } finally {
        window.location.href = '/';
      }
    };
  } catch (e) {
    if (!app.isConnected) return;
    app.innerHTML = `
      <div class="page">
        ${brandMark()}
        <p class="error-banner" style="margin-top: 20px;">Не удалось загрузить коллекцию: ${escapeHtml(e.message)}</p>
      </div>
    `;
  }
}
function greeting() {
  const hour = new Date().getHours();

  if (hour < 6) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}
