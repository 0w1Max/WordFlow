import { navigate } from '../core/router.js';
import { post } from '../core/api.js';
import {
  escapeHtml,
  passwordFieldHtml,
  attachPasswordToggles,
  brandMark,
  fieldWrapClass,
  fieldErrorHtml,
  wireRequiredFieldsToggle
} from '../core/dom.js';

export function renderRegister() {
  const app = document.getElementById('app');
  render(app, '', null, '');
}
function render(app, errorMessage, errorField, emailValue) {
  if (!app.isConnected) return;
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark('auth')}
        <h1 class="headline">Регистрация</h1>

        ${errorMessage && !errorField ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ''}

        <form id="registerForm" class="form">
          <div class="${fieldWrapClass('email', errorField)}">
            <label class="field-label" for="email">Email</label>
            <input type="email" id="email" required autocomplete="email" value="${escapeHtml(emailValue)}" />
            ${fieldErrorHtml('email', errorField, errorMessage)}
          </div>

          ${passwordFieldHtml('password', 'Пароль (минимум 8 символов)', 'required minlength="8" autocomplete="new-password"', errorField === 'password' ? errorMessage : '')}

          <div class="actions">
            <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%;">Создать аккаунт</button>
          </div>
        </form>

        <div class="auth-links">
          <span>Уже есть аккаунт? <a href="/login" id="toLogin">Войти</a></span>
        </div>
      </div>
    </div>
  `;

  app.querySelector('#toLogin').onclick = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  attachPasswordToggles(app);

  wireRequiredFieldsToggle(app.querySelector('#submitBtn'), [
    app.querySelector('#email'),
    app.querySelector('#password')
  ]);

  app.querySelector('#registerForm').onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = app.querySelector('#submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Создаём аккаунт…';

    const email = app.querySelector('#email').value.trim();
    const password = app.querySelector('#password').value;

    try {
      await post('/auth/register', { email, password });
      if (!app.isConnected) return;
      navigate('/dashboard');
    } catch (err) {
      if (!app.isConnected) return;
      render(app, err.message, err.field, email);
    }
  };
}
