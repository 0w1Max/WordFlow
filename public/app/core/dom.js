// Мелкая, но используется в нескольких страницах (addWord, review) —
// вынесено сюда, чтобы не дублировать одну и ту же функцию в двух файлах.
export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function bookMarkIcon(size = 15) {
  return `<svg width="${size}" height="${size * 0.8}" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 3.4C8.1 1.9 5.4 1.2 1.6 1.6v11.8c3.8-.4 6.5.3 8.4 1.8V3.4z" fill="currentColor" opacity="0.5"/><path d="M10 3.4c1.9-1.5 4.6-2.2 8.4-1.8v11.8c-3.8-.4-6.5.3-8.4 1.8V3.4z" fill="currentColor"/></svg>`;
}

// Водяной знак в hero — намеренно ДРУГОЙ мотив, не тот же значок, что в
// лого: компас-розетка, отсылает к теме "полевого дневника / наблюдений"
// из брифа, а асимметричная стрелка делает вращение (stamp-breathe)
// по-настоящему заметным.
export function compassIcon(size = 15) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M12 12 15.5 6 9 9.5z" fill="currentColor"/><path d="M12 12 8.5 18 15 14.5z" fill="currentColor" opacity="0.45"/></svg>`;
}

// Фирменный штамп — используется и в бренд-марке, и как декоративный
// оттиск в углу каждой карточки-экземпляра, и водяным знаком в hero.
// Один и тот же мотив везде — это то самое "фирменное лицо", которого не
// хватало: убери название "Wordflow" — штамп всё равно узнаётся.
// Минимальные линейные иллюстрации для пустых состояний — без мультяшности,
// в одну линию, тем же языком, что и штамп-логотип.
export function bookmarkIcon() {
  return `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1z"/></svg>`;
}

export function sproutIcon() {
  return `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21V10"/><path d="M12 10C8 10 6 7 6 4c3 0 6 2 6 6z"/><path d="M12 13C16 13 18 10 18 7c-3 0-6 2-6 6z"/></svg>`;
}

export function stampIcon(size = 15) {
  return bookMarkIcon(size);
}

// Фирменный знак WordFlow — штамп-«клеймо» коллекционера образцов вместо
// обычной точки. Используется в шапке каждой страницы и на auth-экранах,
// поэтому вынесен в один переиспользуемый хелпер.
export function brandMark(variant = "masthead") {
  const cls = variant === "auth" ? "auth-mark" : "masthead-mark";
  return `<a href="/" class="${cls}" data-spa-link><span class="brand-icon">${bookMarkIcon()}</span>Wordflow</a>`;
}

const MONTHS_GENITIVE = [
  "янв", "фев", "мар", "апр", "мая", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек"
];

// "Собрано 12 мар 2026" — использует реальную createdAt слова, ничего не
// выдумывает. Короткий формат специально: это подпись на архивной карточке,
// а не полная дата в календаре.
export function formatShortDate(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const day = date.getDate();
  const month = MONTHS_GENITIVE[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

// Пять сегментов, закрашено — сколько раз слово реально повторили
// (reviewCount, максимум 5) — честный прогресс, не декоративная выдумка.
export function progressDotsHtml(reviewCount, max = 5) {
  const filled = Math.min(reviewCount, max);

  return Array.from({ length: max }, (_, i) =>
    `<span class="${i < filled ? "filled" : ""}"></span>`
  ).join("");
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
