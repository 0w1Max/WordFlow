import { wordCardsHtml, currentAccentIndex } from '../components/wordCards.js';
import { navigate } from '../core/router.js';
import { get, put, del } from '../core/api.js';
import {
  escapeHtml,
  brandMark,
  bookmarkIcon,
  accentPickerHtml,
  attachAccentPicker,
  wireRequiredFieldsToggle,
  pluralizeRu
} from '../core/dom.js';

export async function renderWordsList() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="page">
      <p class="loading-line">Открываем коллекцию…</p>
    </div>
  `;

  try {
    const [words, categories] = await Promise.all([get('/words'), get('/categories')]);
    if (!app.isConnected) return;
    startList(app, words, categories);
  } catch (e) {
    if (!app.isConnected) return;
    app.innerHTML = `
      <div class="page">
        ${brandMark()}
        <p class="error-banner" style="margin-top: 20px;">Не удалось загрузить данные: ${escapeHtml(e.message)}</p>
        <div class="actions"><button id="back" class="btn btn-ghost">Назад</button></div>
      </div>
    `;
    app.querySelector('#back').onclick = () => navigate('/dashboard');
  }
}

function startList(app, words, categories) {
  const state = {
    words: words.map((w) => ({ ...w, editing: false })),
    categories,
    error: '',
    errorField: null
  };

  render(app, state);
}

function captureEditingDraft(app, state) {
  const editingWord = state.words.find((w) => w.editing);
  if (!editingWord) return;

  const card = app.querySelector(`li[data-id="${editingWord.id}"]`);
  if (!card) return;

  editingWord.draftText = card.querySelector('.edit-text')?.value ?? editingWord.text;
  editingWord.draftMeaning = card.querySelector('.edit-meaning')?.value ?? editingWord.meaning;
  editingWord.draftExample =
    card.querySelector('.edit-example')?.value ?? (editingWord.example || '');
  editingWord.draftCategoryId = card.querySelector('.edit-category')?.value ?? '';
}

function clearDraft(word) {
  delete word.draftText;
  delete word.draftMeaning;
  delete word.draftExample;
  delete word.draftCategoryId;
  delete word.draftAccentIndex;
}

function render(app, state) {
  if (!app.isConnected) return;
  const itemsHtml = wordCardsHtml(state);

  app.innerHTML = `
    <div class="page">
      ${brandMark()}
      <h1 class="headline" style="margin-top: 18px;">Все слова</h1>
      <p class="meta-line">${state.words.length} ${pluralizeRu(state.words.length, 'слово', 'слова', 'слов')} в коллекции</p>

      ${state.error && !['text', 'meaning'].includes(state.errorField) ? `<p class="error-banner">${escapeHtml(state.error)}</p>` : ''}

      ${
        state.categories.length > 0
          ? `
        <div class="chip-row">
          ${state.categories
            .map(
              (c) => `
            <span class="chip">
              ${escapeHtml(c.name)}
              <button class="chip-remove delete-category-btn" data-id="${c.id}" title="Удалить категорию" aria-label="Удалить категорию ${escapeHtml(c.name)}">×</button>
            </span>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      ${
        state.words.length === 0
          ? `
        <div class="empty-state">
          <div class="empty-state-icon">${bookmarkIcon()}</div>
          <p>Коллекция пуста. Добавьте первое слово, чтобы начать наблюдения.</p>
          <button id="addBtn" class="btn btn-primary">Добавить слово</button>
        </div>
      `
          : `<ul class="specimen-list">${itemsHtml}</ul>`
      }

      <div class="actions">
        ${state.words.length > 0 ? `<button id="addBtn" class="btn btn-ghost">Добавить слово</button>` : ''}
        <button id="back" class="btn btn-ghost">На главную</button>
      </div>
    </div>
  `;

  app.querySelector('#addBtn')?.addEventListener('click', () => navigate('/add'));
  app.querySelector('#back').onclick = () => navigate('/dashboard');
  const editingWord = state.words.find((w) => w.editing);
  if (editingWord) {
    const card = app.querySelector(`li[data-id="${editingWord.id}"]`);
    const textInput = card?.querySelector('.edit-text');
    const accentContainer = card?.querySelector('.accent-picker-wrap');

    if (textInput && accentContainer) {
      const renderAccent = () => {
        accentContainer.innerHTML = accentPickerHtml(
          textInput.value,
          currentAccentIndex(editingWord)
        );
        attachAccentPicker(accentContainer, currentAccentIndex(editingWord), (index) => {
          editingWord.draftAccentIndex = index;
          renderAccent();
        });
      };
      textInput.addEventListener('input', () => {
        editingWord.draftAccentIndex = null;
        renderAccent();
      });
    }

    const meaningInput = card?.querySelector('.edit-meaning');
    const saveBtn = card?.querySelector('.save-btn');
    if (textInput && meaningInput && saveBtn) {
      wireRequiredFieldsToggle(saveBtn, [textInput, meaningInput]);
    }
  }

  app.querySelectorAll('.delete-category-btn').forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);

      if (!window.confirm('Удалить категорию? Слова останутся, но станут «без категории».')) {
        return;
      }

      captureEditingDraft(app, state);

      try {
        await del(`/categories/${id}`);
        if (!app.isConnected) return;
        state.categories = state.categories.filter((c) => c.id !== id);
        state.words = state.words.map((w) =>
          w.categoryId === id ? { ...w, categoryId: null } : w
        );
        state.error = '';
        state.errorField = null;
      } catch (err) {
        if (!app.isConnected) return;
        state.error = err.message;
        state.errorField = err.field ?? null;
      }

      render(app, state);
    };
  });

  app.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.onclick = () => {
      captureEditingDraft(app, state);
      const id = Number(btn.dataset.id);
      state.words = state.words.map((w) => ({ ...w, editing: w.id === id }));
      state.error = '';
      state.errorField = null;
      render(app, state);
    };
  });

  app.querySelectorAll('.cancel-btn').forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      state.words = state.words.map((w) => {
        if (w.id !== id) return w;
        const cleared = { ...w, editing: false };
        clearDraft(cleared);
        return cleared;
      });
      state.error = '';
      state.errorField = null;
      render(app, state);
    };
  });

  app.querySelectorAll('.save-btn').forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);
      const card = app.querySelector(`li[data-id="${id}"]`);
      const word = state.words.find((w) => w.id === id);

      const text = card.querySelector('.edit-text').value;
      const meaning = card.querySelector('.edit-meaning').value.trim();
      const example = card.querySelector('.edit-example').value.trim();
      const categoryId = card.querySelector('.edit-category').value || null;
      const accentIndex = currentAccentIndex(word);

      try {
        const updated = await put(`/words/${id}`, {
          text,
          meaning,
          example: example || null,
          categoryId: categoryId ? Number(categoryId) : null,
          accentIndex
        });

        state.words = state.words.map((w) => (w.id === id ? { ...updated, editing: false } : w));
        state.error = '';
        state.errorField = null;
      } catch (err) {
        if (!app.isConnected) return;
        state.words = state.words.map((w) =>
          w.id === id
            ? {
                ...w,
                draftText: text,
                draftMeaning: meaning,
                draftExample: example,
                draftCategoryId: categoryId ?? ''
              }
            : w
        );
        state.error = err.message;
        state.errorField = err.field ?? null;
      }

      render(app, state);
    };
  });

  app.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);

      if (!window.confirm('Удалить это слово? Действие необратимо.')) {
        return;
      }

      captureEditingDraft(app, state);

      try {
        await del(`/words/${id}`);
        if (!app.isConnected) return;
        state.words = state.words.filter((w) => w.id !== id);
        state.error = '';
        state.errorField = null;
      } catch (err) {
        if (!app.isConnected) return;
        state.error = err.message;
        state.errorField = err.field ?? null;
      }

      render(app, state);
    };
  });
}
