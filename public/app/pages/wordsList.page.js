import { navigate } from "../core/router.js";
import { get, put, del } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export async function renderWordsList() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="page">
      <h2>Мои слова</h2>
      <p>Загрузка...</p>
    </div>
  `;

  try {
    const [words, categories] = await Promise.all([get("/words"), get("/categories")]);
    startList(app, words, categories);
  } catch (e) {
    app.innerHTML = `
      <div class="page">
        <h2>Мои слова</h2>
        <p class="error">Не удалось загрузить данные: ${escapeHtml(e.message)}</p>
        <button id="back">Назад</button>
      </div>
    `;
    document.getElementById("back").onclick = () => navigate("/");
  }
}

function startList(app, words, categories) {
  const state = {
    words: words.map(w => ({ ...w, editing: false })),
    categories,
    error: ""
  };

  render(app, state);
}

function categoryName(state, categoryId) {
  if (!categoryId) return null;
  const found = state.categories.find(c => c.id === categoryId);
  return found ? found.name : null;
}

function render(app, state) {
  const categoryOptions = state.categories
    .map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
    .join("");

  const itemsHtml = state.words.map(word => {
    if (word.editing) {
      return `
        <li class="word-card" data-id="${word.id}">
          <div class="form">
            <label>
              Слово
              <input type="text" class="edit-text" value="${escapeHtml(word.text)}" />
            </label>
            <label>
              Значение
              <input type="text" class="edit-meaning" value="${escapeHtml(word.meaning)}" />
            </label>
            <label>
              Пример
              <input type="text" class="edit-example" value="${escapeHtml(word.example || "")}" />
            </label>
            <label>
              Категория
              <select class="edit-category">
                <option value="">Без категории</option>
                ${state.categories.map(c => `<option value="${c.id}" ${c.id === word.categoryId ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
              </select>
            </label>
            <div class="form-actions">
              <button class="save-btn" data-id="${word.id}">Сохранить</button>
              <button class="cancel-btn" data-id="${word.id}" type="button">Отмена</button>
            </div>
          </div>
        </li>
      `;
    }

    const catName = categoryName(state, word.categoryId);

    return `
      <li class="word-card" data-id="${word.id}">
        <p class="card-word">${escapeHtml(word.text)}</p>
        <p class="card-meaning">${escapeHtml(word.meaning)}</p>
        ${word.example ? `<p class="card-example">«${escapeHtml(word.example)}»</p>` : ""}
        ${catName ? `<p class="badge">${escapeHtml(catName)}</p>` : ""}
        <p class="progress">Повторений: ${word.reviewCount}</p>
        <div class="form-actions">
          <button class="edit-btn" data-id="${word.id}">Изменить</button>
          <button class="delete-btn" data-id="${word.id}">Удалить</button>
        </div>
      </li>
    `;
  }).join("");

  app.innerHTML = `
    <div class="page">
      <h2>Мои слова</h2>
      ${state.error ? `<p class="error">${escapeHtml(state.error)}</p>` : ""}
      ${state.words.length === 0 ? "<p>Слов пока нет.</p>" : `<ul class="word-list">${itemsHtml}</ul>`}
      <div class="form-actions">
        <button id="addBtn">Добавить слово</button>
        <button id="back">На главную</button>
      </div>
    </div>
  `;

  document.getElementById("addBtn").onclick = () => navigate("/add");
  document.getElementById("back").onclick = () => navigate("/");

  app.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      state.words = state.words.map(w => ({ ...w, editing: w.id === id }));
      render(app, state);
    };
  });

  app.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      state.words = state.words.map(w => w.id === id ? { ...w, editing: false } : w);
      render(app, state);
    };
  });

  app.querySelectorAll(".save-btn").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);
      const card = app.querySelector(`li[data-id="${id}"]`);

      const text = card.querySelector(".edit-text").value.trim();
      const meaning = card.querySelector(".edit-meaning").value.trim();
      const example = card.querySelector(".edit-example").value.trim();
      const categoryId = card.querySelector(".edit-category").value || null;

      try {
        const updated = await put(`/words/${id}`, {
          text,
          meaning,
          example: example || null,
          categoryId: categoryId ? Number(categoryId) : null
        });

        state.words = state.words.map(w => w.id === id ? { ...updated, editing: false } : w);
        state.error = "";
      } catch (err) {
        state.error = err.message;
      }

      render(app, state);
    };
  });

  app.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);

      if (!window.confirm("Удалить это слово? Действие необратимо.")) {
        return;
      }

      try {
        await del(`/words/${id}`);
        state.words = state.words.filter(w => w.id !== id);
        state.error = "";
      } catch (err) {
        state.error = err.message;
      }

      render(app, state);
    };
  });
}
