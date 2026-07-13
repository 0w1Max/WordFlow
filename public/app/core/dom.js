// Мелкая, но используется в нескольких страницах (addWord, review) —
// вынесено сюда, чтобы не дублировать одну и ту же функцию в двух файлах.
export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function sprigIcon() {
  return `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.3"/><path d="M8 12V5M8 5C6.5 5 5.5 6.2 5.5 7.8M8 5C9.5 5 10.6 6.3 10.2 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;
}

// Фирменный знак WordFlow — штамп-«клеймо» коллекционера образцов вместо
// обычной точки. Используется в шапке каждой страницы и на auth-экранах,
// поэтому вынесен в один переиспользуемый хелпер.
export function brandMark(variant = "masthead") {
  const cls = variant === "auth" ? "auth-mark" : "masthead-mark";
  return `<span class="${cls}"><span class="brand-icon">${sprigIcon()}</span>Wordflow</span>`;
}

function eyeIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function eyeOffIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a21.7 21.7 0 0 1-2.61 3.94M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

// Поле пароля со значком «показать/скрыть» — используется на логине,
// регистрации, сбросе пароля и сохранении гостевого прогресса. Возвращает
// готовую разметку; после вставки в DOM нужно один раз вызвать
// attachPasswordToggles(), чтобы повесить обработчик клика на глазок.
export function passwordFieldHtml(id, labelText, extraAttrs = "") {
  return `
    <div class="field">
      <label class="field-label" for="${id}">${labelText}</label>
      <div class="password-field">
        <input type="password" id="${id}" ${extraAttrs} />
        <button type="button" class="password-toggle" data-target="${id}" aria-label="Показать пароль" aria-pressed="false">
          ${eyeIcon()}
        </button>
      </div>
    </div>
  `;
}

export function attachPasswordToggles(root = document) {
  root.querySelectorAll(".password-toggle").forEach(btn => {
    btn.onclick = () => {
      const input = document.getElementById(btn.dataset.target);
      const isHidden = input.type === "password";

      input.type = isHidden ? "text" : "password";
      btn.setAttribute("aria-pressed", String(isHidden));
      btn.setAttribute("aria-label", isHidden ? "Скрыть пароль" : "Показать пароль");
      btn.innerHTML = isHidden ? eyeOffIcon() : eyeIcon();
    };
  });
}
