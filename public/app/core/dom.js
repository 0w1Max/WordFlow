// Подсветка конкретного поля формы, к которому относится ошибка валидации
// (см. err.field в core/api.js и ValidationError.field на бэкенде).
// Раньше любая ошибка формы показывалась только общим баннером сверху —
// человек должен был сам догадываться, какое поле не понравилось серверу.
//
// fieldWrapClass — класс на обёртку .field: добавляет "has-error", если имя
// поля совпадает с полем ошибки (красная линия под инпутом, см. CSS).
export function fieldWrapClass(name, errorField) {
  return errorField === name ? "field has-error" : "field";
}

// fieldErrorHtml — подпись под конкретным инпутом с текстом ошибки, только
// если ошибка относится именно к этому полю. Для ошибок без привязки к полю
// (например, "такой email уже занят") остаётся общий баннер сверху формы.
export function fieldErrorHtml(name, errorField, errorMessage) {
  if (errorField !== name || !errorMessage) return "";
  return `<p class="field-error-text">${escapeHtml(errorMessage)}</p>`;
}

// ---------- Ударение (см. миграцию stress_index в db/db.js) ----------
//
// Индекс считается по конкретному символу в исходной, ещё не обрезанной
// строке (см. normalizeStressIndex в models/word.js на бэкенде — там же
// подробно объяснено, зачем именно "исходной, не обрезанной").

// Гласные, на которые может физически падать ударение — заглавные и
// строчные. Используется, чтобы в интерактивном выборе (stressPickerHtml)
// кликабельными были только они: согласная или пробел не могут быть
// ударными, и незачем позволять по ним промахнуться кликом.
export const STRESSABLE_LETTERS = "аеёиоуыэюяАЕЁИОУЫЭЮЯ";

// Показ уже сохранённого слова с ударением. ВАЖНО: раньше здесь вставлялся
// настоящий юникодовский комбинированный акут (U+0301) сразу после буквы —
// корректный типографский приём в теории, но в части браузеров/шрифтов он
// не "садится" на предыдущую букву, а получает свою собственную ширину,
// из-за чего справа от ударной буквы визуально появлялся лишний пробел.
// Комбинирующие символы полагаются на поддержку конкретным шрифтом
// отрисовки диакритики поверх буквы, а это не гарантировано. Поэтому
// засечка теперь рисуется самим CSS (.stress-mark::after, см.
// components.css) — абсолютно спозиционированный элемент не занимает
// места в потоке текста и никогда не раздвигает соседние буквы, независимо
// от шрифта и браузера. Здесь остаётся только оборачивание буквы в span —
// сам штрих полностью на стороне CSS.
export function wordWithStressHtml(text, stressIndex) {
  if (
    stressIndex === null ||
    stressIndex === undefined ||
    stressIndex < 0 ||
    stressIndex >= text.length
  ) {
    return escapeHtml(text);
  }

  const before = text.slice(0, stressIndex);
  const letter = text[stressIndex];
  const after = text.slice(stressIndex + 1);

  return `${escapeHtml(before)}<span class="stress-mark">${escapeHtml(letter)}</span>${escapeHtml(after)}`;
}

// Интерактивный выбор ударения при вводе/редактировании слова: каждая
// гласная буква — кликабельная кнопка; выбранная буква сразу подсвечивается
// тем же CSS-штрихом и тем же цветом, что и в финальном рендере (см.
// wordWithStressHtml выше и .stress-picker-letter.is-selected::after в
// components.css) — то, что человек видит при выборе, это уже живое
// превью того, как слово будет выглядеть в коллекции.
export function stressPickerHtml(text, stressIndex) {
  if (!text) {
    return `<p class="stress-picker-hint">Начните вводить слово, чтобы отметить ударение</p>`;
  }

  const letters = [...text]
    .map((char, i) => {
      const isVowel = STRESSABLE_LETTERS.includes(char);
      const isSelected = i === stressIndex;

      if (!isVowel) {
        return `<span class="stress-picker-letter is-inert">${escapeHtml(char)}</span>`;
      }

      return `<button type="button" class="stress-picker-letter${isSelected ? " is-selected" : ""}" data-index="${i}" aria-pressed="${isSelected}" aria-label="Отметить ударение на букве ${escapeHtml(char)}">${escapeHtml(char)}</button>`;
    })
    .join("");

  return `
    <p class="stress-picker-hint">Отметьте ударение — необязательно, но карточка будет понятнее</p>
    <div class="stress-picker">${letters}</div>
  `;
}

// Навешивает обработчик клика на кнопки stressPickerHtml внутри containerEl.
// onSelect(index) получает индекс выбранной буквы; повторный клик по уже
// выбранной букве снимает отметку (передаёт null) — чтобы можно было
// передумать, не перепечатывая всё слово заново.
export function attachStressPicker(containerEl, currentIndex, onSelect) {
  containerEl.querySelectorAll(".stress-picker-letter[data-index]").forEach((btn) => {
    btn.onclick = () => {
      const index = Number(btn.dataset.index);
      onSelect(index === currentIndex ? null : index);
    };
  });
}

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
//
// errorMessage (необязательный) — если ошибка сервера относится именно
// к паролю (err.field === "password"), подсвечиваем поле красным и
// показываем текст под ним — так же, как у обычных текстовых полей.
export function passwordFieldHtml(id, labelText, extraAttrs = "", errorMessage = "") {
  const hasError = Boolean(errorMessage);

  return `
    <div class="field${hasError ? " has-error" : ""}">
      <label class="field-label" for="${id}">${labelText}</label>
      <div class="password-field">
        <input type="password" id="${id}" ${extraAttrs} />
        <button type="button" class="password-toggle" data-target="${id}" aria-label="Показать пароль" aria-pressed="false">
          ${eyeIcon()}
        </button>
      </div>
      ${hasError ? `<p class="field-error-text">${escapeHtml(errorMessage)}</p>` : ""}
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
