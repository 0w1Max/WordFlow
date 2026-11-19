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

export function renderLogin() {
  const app = document.getElementById('app');
  render(app, '', null, '');
}
function render(app, errorMessage, errorField, emailValue) {
  if (!app.isConnected) return;
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark('auth')}
        <h1 class="headline">Вход</h1>

        ${errorMessage && !errorField ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ''}

        <form id="loginForm" class="form">
          <div class="${fieldWrapClass('email', errorField)}">
            <label class="field-label" for="email">Email</label>
            <input type="email" id="email" required autocomplete="email" value="${escapeHtml(emailValue)}" />
            ${fieldErrorHtml('email', errorField, errorMessage)}
          </div>

          ${passwordFieldHtml('password', 'Пароль', 'required autocomplete="current-password"', errorField === 'password' ? errorMessage : '')}

          <div class="actions">
            <button type="submit" id="submitBtn" class="btn btn-primary" style="width: 100%;">Войти</button>
          </div>
        </form>

        <div class="auth-links">
          <span>Нет аккаунта? <a href="/register" id="toRegister">Зарегистрироваться</a></span>
          <a href="/forgot-password" id="toForgot">Забыли пароль?</a>
        </div>
      </div>
    </div>
  `;

  app.querySelector('#toRegister').onclick = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  attachPasswordToggles(app);

  wireRequiredFieldsToggle(app.querySelector('#submitBtn'), [
    app.querySelector('#email'),
    app.querySelector('#password')
  ]);

  app.querySelector('#toForgot').onclick = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  app.querySelector('#loginForm').onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = app.querySelector('#submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Входим…';

    const email = app.querySelector('#email').value.trim();
    const password = app.querySelector('#password').value;

    try {
      await post('/auth/login', { email, password });
      if (!app.isConnected) return;
      navigate('/dashboard');
    } catch (err) {
      if (!app.isConnected) return;
      render(app, err.message, err.field, email);
    }
  };
}
