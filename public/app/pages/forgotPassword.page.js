import { navigate } from '../core/router.js';
import { post } from '../core/api.js';
import {
  escapeHtml,
  brandMark,
  fieldWrapClass,
  fieldErrorHtml,
  wireRequiredFieldsToggle
} from '../core/dom.js';

export function renderForgotPassword() {
  const app = document.getElementById('app');
  render(app, '', '', null, '');
}

function render(app, message, errorMessage, errorField, emailValue) {
  if (!app.isConnected) return;
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark('auth')}
        <h1 class="headline">Восстановление пароля</h1>

        ${errorMessage && !errorField ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ''}
        ${message ? `<p class="notice-banner">${escapeHtml(message)}</p>` : ''}

        ${
          !message
            ? `
          <form id="forgotForm" class="form">
            <div class="${fieldWrapClass('email', errorField)}">
              <label class="field-label" for="email">Email</label>
              <input type="email" id="email" required autocomplete="email" value="${escapeHtml(emailValue)}" />
              ${fieldErrorHtml('email', errorField, errorMessage)}
            </div>

            <div class="actions">
              <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%;">Отправить ссылку</button>
            </div>
          </form>
        `
            : ''
        }

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

  const form = app.querySelector('#forgotForm');
  if (!form) return;

  wireRequiredFieldsToggle(app.querySelector('#submitBtn'), [app.querySelector('#email')]);

  form.onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = app.querySelector('#submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';

    const email = app.querySelector('#email').value.trim();

    try {
      const res = await post('/auth/forgot-password', { email });
      if (!app.isConnected) return;
      render(app, res.message, '', null, email);
    } catch (err) {
      if (!app.isConnected) return;
      render(app, '', err.message, err.field, email);
    }
  };
}
