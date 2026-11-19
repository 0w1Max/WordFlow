import { navigate } from '../core/router.js';
import { post } from '../core/api.js';
import {
  escapeHtml,
  passwordFieldHtml,
  attachPasswordToggles,
  brandMark,
  wireRequiredFieldsToggle
} from '../core/dom.js';

export function renderResetPassword() {
  const app = document.getElementById('app');
  const token = new URLSearchParams(window.location.search).get('token');

  if (!token) {
    app.innerHTML = `
      <div class="auth-shell">
        <div class="auth-card">
          ${brandMark('auth')}
          <p class="error-banner">Ссылка неполная — отсутствует токен сброса пароля.</p>
          <div class="auth-links">
            <a href="/login" id="toLogin">Вернуться ко входу</a>
          </div>
        </div>
      </div>
    `;
    app.querySelector('#toLogin').onclick = (e) => {
      e.preventDefault();
      navigate('/login');
    };
    return;
  }

  render(app, token, '', null);
}
function render(app, token, errorMessage, errorField) {
  if (!app.isConnected) return;
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark('auth')}
        <h1 class="headline">Новый пароль</h1>

        ${errorMessage && !errorField ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ''}

        <form id="resetForm" class="form">
          ${passwordFieldHtml('password', 'Новый пароль (минимум 8 символов)', 'required minlength="8" autocomplete="new-password"', errorField === 'password' ? errorMessage : '')}

          <div class="actions">
            <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%;">Сохранить пароль</button>
          </div>
        </form>
      </div>
    </div>
  `;

  attachPasswordToggles(app);

  wireRequiredFieldsToggle(app.querySelector('#submitBtn'), [app.querySelector('#password')]);

  app.querySelector('#resetForm').onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = app.querySelector('#submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Сохраняем…';

    const password = app.querySelector('#password').value;

    try {
      await post('/auth/reset-password', { token, password });
      if (!app.isConnected) return;
      navigate('/login');
    } catch (err) {
      if (!app.isConnected) return;
      render(app, token, err.message, err.field);
    }
  };
}
