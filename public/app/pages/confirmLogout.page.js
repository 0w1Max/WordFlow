import { navigate } from '../core/router.js';
import { get, post } from '../core/api.js';
import { brandMark } from '../core/dom.js';
export async function renderConfirmLogout() {
  const app = document.getElementById('app');

  app.innerHTML = `<div class="page"><p class="loading-line">Проверяем аккаунт…</p></div>`;
  const { user } = await get('/auth/me');
  if (!app.isConnected) return;

  if (!user.isGuest) {
    navigate('/dashboard');
    return;
  }

  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark('auth')}
        <h1 class="headline">Выйти из аккаунта?</h1>

        <p class="meta-line" style="margin-bottom: 24px;">
          Сейчас вы работаете в WordFlow как гость: все собранные слова привязаны только к этой сессии в этом браузере.
          Если выйти, не сохранив прогресс, восстановить их будет уже нельзя.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="saveAndLeaveBtn" class="btn btn-primary" style="width: 100%;">Зарегистрироваться и сохранить слова</button>
          <button id="leaveWithoutSavingBtn" class="btn-danger-text" style="align-self: center;">Выйти и потерять данные</button>
        </div>

        <div class="auth-links">
          <a href="/dashboard" id="stayLink">Остаться на рабочем столе</a>
        </div>
      </div>
    </div>
  `;

  app.querySelector('#saveAndLeaveBtn').onclick = () => {
    navigate('/save-progress');
  };

  app.querySelector('#leaveWithoutSavingBtn').onclick = async () => {
    try {
      await post('/auth/logout');
      if (!app.isConnected) return;
    } finally {
      window.location.href = '/';
    }
  };

  app.querySelector('#stayLink').onclick = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };
}
