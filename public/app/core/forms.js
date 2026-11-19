import { escapeHtml } from './html.js';

export function fieldWrapClass(name, errorField) {
  return errorField === name ? 'field has-error' : 'field';
}
export function fieldErrorHtml(name, errorField, errorMessage) {
  if (errorField !== name || !errorMessage) return '';
  return `<p class="field-error-text">${escapeHtml(errorMessage)}</p>`;
}
function eyeIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function eyeOffIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a21.7 21.7 0 0 1-2.61 3.94M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}
export function passwordFieldHtml(id, labelText, extraAttrs = '', errorMessage = '') {
  const hasError = Boolean(errorMessage);

  return `
    <div class="field${hasError ? ' has-error' : ''}">
      <label class="field-label" for="${id}">${labelText}</label>
      <div class="password-field">
        <input type="password" id="${id}" ${extraAttrs} />
        <button type="button" class="password-toggle" data-target="${id}" aria-label="Показать пароль" aria-pressed="false">
          ${eyeIcon()}
        </button>
      </div>
      ${hasError ? `<p class="field-error-text">${escapeHtml(errorMessage)}</p>` : ''}
    </div>
  `;
}

export function attachPasswordToggles(root = document) {
  root.querySelectorAll('.password-toggle').forEach((btn) => {
    btn.onclick = () => {
      const input = document.getElementById(btn.dataset.target);
      const isHidden = input.type === 'password';

      input.type = isHidden ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(isHidden));
      btn.setAttribute('aria-label', isHidden ? 'Скрыть пароль' : 'Показать пароль');
      btn.innerHTML = isHidden ? eyeOffIcon() : eyeIcon();
    };
  });
}
export function wireRequiredFieldsToggle(button, inputs) {
  function update() {
    const allFilled = inputs.every((input) => input.value.trim() !== '');
    button.disabled = !allFilled;
  }

  inputs.forEach((input) => input.addEventListener('input', update));
  update();
}
