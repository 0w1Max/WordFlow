import {
  escapeHtml,
  stampIcon,
  formatShortDate,
  progressDotsHtml,
  fieldWrapClass,
  fieldErrorHtml,
  accentPickerHtml,
  wordWithAccentHtml
} from '../core/dom.js';
function categoryName(state, categoryId) {
  if (!categoryId) return null;
  const found = state.categories.find((c) => c.id === categoryId);
  return found ? found.name : null;
}
function strengthOf(word) {
  if (word.reviewCount === 0) return 'new';
  if (word.reviewCount <= 3) return 'learning';
  return 'known';
}

function isDue(word) {
  return word.nextReviewAt && new Date(word.nextReviewAt) <= new Date();
}
export function currentAccentIndex(word) {
  return word.draftAccentIndex !== undefined ? word.draftAccentIndex : (word.accentIndex ?? null);
}

export function wordCardsHtml(state) {
  return state.words
    .map((word, index) => {
      const cascadeDelay = `style="animation-delay: ${Math.min(index, 8) * 55}ms;"`;

      if (word.editing) {
        const text = word.draftText ?? word.text;
        const meaning = word.draftMeaning ?? word.meaning;
        const example = word.draftExample ?? (word.example || '');
        const categoryId =
          word.draftCategoryId !== undefined ? word.draftCategoryId : (word.categoryId ?? '');

        return `
        <li class="specimen" data-id="${word.id}" ${cascadeDelay}>
          <div class="specimen-bar"></div>
          <div class="specimen-body">
            <div class="form">
              <div class="${fieldWrapClass('text', state.errorField)}">
                <label class="field-label">Слово</label>
                <input type="text" class="edit-text" value="${escapeHtml(text)}" />
                ${fieldErrorHtml('text', state.errorField, state.error)}
                <div class="accent-picker-wrap">${accentPickerHtml(text, currentAccentIndex(word))}</div>
              </div>
              <div class="${fieldWrapClass('meaning', state.errorField)}">
                <label class="field-label">Значение</label>
                <input type="text" class="edit-meaning" value="${escapeHtml(meaning)}" />
                ${fieldErrorHtml('meaning', state.errorField, state.error)}
              </div>
              <div class="field">
                <label class="field-label">Пример</label>
                <input type="text" class="edit-example" value="${escapeHtml(example)}" />
              </div>
              <div class="field">
                <label class="field-label">Категория</label>
                <select class="edit-category">
                  <option value="">Без категории</option>
                  ${state.categories.map((c) => `<option value="${c.id}" ${String(c.id) === String(categoryId) ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                </select>
              </div>
              <div class="actions">
                <button class="save-btn btn btn-primary" data-id="${word.id}">Сохранить</button>
                <button class="cancel-btn btn btn-ghost" data-id="${word.id}" type="button">Отмена</button>
              </div>
            </div>
          </div>
        </li>
      `;
      }

      const catName = categoryName(state, word.categoryId);
      const due = isDue(word);

      return `
      <li class="specimen" data-id="${word.id}" data-strength="${strengthOf(word)}" ${cascadeDelay}>
        <div class="specimen-bar"></div>
        <div class="specimen-body">
          <div class="specimen-stamp">${stampIcon(24)}</div>
          <div class="specimen-eyebrow">
            <span>${catName ? escapeHtml(catName) : 'Без категории'}</span>
            <span>·</span>
            <span>Собрано ${formatShortDate(word.createdAt)}</span>
            ${due ? `<span class="chip chip-due">Пора повторить</span>` : ''}
          </div>
          <p class="specimen-word">${wordWithAccentHtml(word.text, word.accentIndex)}</p>
          <p class="specimen-meaning">${escapeHtml(word.meaning)}</p>
          ${word.example ? `<p class="specimen-example">«${escapeHtml(word.example)}»</p>` : ''}
          <div class="specimen-footer">
            <div class="specimen-progress" aria-label="Повторений: ${word.reviewCount}">
              ${progressDotsHtml(word.reviewCount)}
            </div>
            <div class="specimen-actions">
              <button class="edit-btn btn-text" data-id="${word.id}">Изменить</button>
              <button class="delete-btn btn-danger-text" data-id="${word.id}">Удалить</button>
            </div>
          </div>
        </div>
      </li>
    `;
    })
    .join('');
}
