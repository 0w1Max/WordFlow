import { navigate } from '../core/router.js';
import { get, post } from '../core/api.js';
import {
  escapeHtml,
  passwordFieldHtml,
  attachPasswordToggles,
  brandMark,
  fieldWrapClass,
  fieldErrorHtml,
  wireRequiredFieldsToggle
} from '../core/dom.js';

export async function renderSaveProgress() {
  const app = document.getElementById('app');

  app.innerHTML = `<div class="page"><p class="loading-line">Проверяем аккаунт…</p></div>`;
  const { user } = await get('/auth/me');
  if (!app.isConnected) return;

  if (!user.isGuest) {
    navigate('/dashboard');
    return;
  }

  render(app, '', null);
}

function render(app, errorMessage, errorField) {
  if (!app.isConnected) return;
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark('auth')}
        <h1 class="headline">Сохранить прогресс</h1>
        <p class="meta-line" style="margin-bottom: 20px;">
          Привяжите email и пароль к этому аккаунту — все уже собранные слова останутся на месте.
        </p>

        ${errorMessage && !errorField ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ''}

        <form id="claimForm" class="form">
          <div class="${fieldWrapClass('email', errorField)}">
            <label class="field-label" for="email">Email</label>
            <input type="email" id="email" required autocomplete="email" />
            ${fieldErrorHtml('email', errorField, errorMessage)}
          </div>

          ${passwordFieldHtml('password', 'Пароль (минимум 8 символов)', 'required minlength="8" autocomplete="new-password"', errorField === 'password' ? errorMessage : '')}

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

  wireRequiredFieldsToggle(app.querySelector('#submitBtn'), [
    app.querySelector('#email'),
    app.querySelector('#password')
  ]);

  app.querySelector('#skipLink').onclick = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };
  app.querySelector('#logoutWithoutSavingLink').onclick = async (e) => {
    e.preventDefault();

    try {
      await post('/auth/logout');
      if (!app.isConnected) return;
    } finally {
      window.location.href = '/';
    }
  };

  app.querySelector('#claimForm').onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = app.querySelector('#submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Сохраняем…';

    const email = app.querySelector('#email').value.trim();
    const password = app.querySelector('#password').value;

    try {
      await post('/auth/claim', { email, password });
      if (!app.isConnected) return;
      navigate('/dashboard');
    } catch (err) {
      if (!app.isConnected) return;
      render(app, err.message, err.field);
    }
  };
}
