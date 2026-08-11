import { navigate } from "../core/router.js";
import { get, put, del } from "../core/api.js";
import { escapeHtml, brandMark, stampIcon, formatShortDate, progressDotsHtml, bookmarkIcon, fieldWrapClass, fieldErrorHtml, accentPickerHtml, attachAccentPicker, wordWithAccentHtml, wireRequiredFieldsToggle } from "../core/dom.js";

export async function renderWordsList() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="page">
      <p class="loading-line">Открываем коллекцию…</p>
    </div>
  `;

  try {
    const [words, categories] = await Promise.all([get("/words"), get("/categories")]);
    startList(app, words, categories);
  } catch (e) {
    app.innerHTML = `
      <div class="page">
        ${brandMark()}
        <p class="error-banner" style="margin-top: 20px;">Не удалось загрузить данные: ${escapeHtml(e.message)}</p>
        <div class="actions"><button id="back" class="btn btn-ghost">Назад</button></div>
      </div>
    `;
    document.getElementById("back").onclick = () => navigate("/dashboard");
  }
}

function startList(app, words, categories) {
  const state = {
    words: words.map(w => ({ ...w, editing: false })),
    categories,
    error: "",
    // errorField — если сервер указал конкретное поле (validators/
    // wordValidator.js: "text"/"meaning"), подсвечиваем именно его в
    // открытой карточке редактирования, а не только общий баннер сверху.
    errorField: null
  };

  render(app, state);
}

function categoryName(state, categoryId) {
  if (!categoryId) return null;
  const found = state.categories.find(c => c.id === categoryId);
  return found ? found.name : null;
}

// 0 повторений — только собрано; 1-3 — на пути к запоминанию; 4+ — усвоено.
// Управляет цветом левой полосы карточки (см. .specimen[data-strength] в CSS).
function strengthOf(word) {
  if (word.reviewCount === 0) return "new";
  if (word.reviewCount <= 3) return "learning";
  return "known";
}

function isDue(word) {
  return word.nextReviewAt && new Date(word.nextReviewAt) <= new Date();
}

// ВАЖНО: если пользователь редактирует слово A и в этот момент удаляет
// категорию или другое слово B, происходит render(app, state) заново —
// без этого шага несохранённый черновик редактирования A стирался бы,
// хотя действие вообще к A не относилось. Здесь мы забираем то, что
// реально введено в открытых полях, и кладём как "черновик" на сам объект
// слова — render() ниже подставит именно черновик, если он есть.
function captureEditingDraft(app, state) {
  const editingWord = state.words.find(w => w.editing);
  if (!editingWord) return;

  const card = app.querySelector(`li[data-id="${editingWord.id}"]`);
  if (!card) return;

  editingWord.draftText = card.querySelector(".edit-text")?.value ?? editingWord.text;
  editingWord.draftMeaning = card.querySelector(".edit-meaning")?.value ?? editingWord.meaning;
  editingWord.draftExample = card.querySelector(".edit-example")?.value ?? (editingWord.example || "");
  editingWord.draftCategoryId = card.querySelector(".edit-category")?.value ?? "";
}

function clearDraft(word) {
  delete word.draftText;
  delete word.draftMeaning;
  delete word.draftExample;
  delete word.draftCategoryId;
  delete word.draftAccentIndex;
}

// Текущее значение ударения для редактируемого слова: черновик, если он
// уже есть (человек кликнул по букве или стёр текст в этой же сессии
// редактирования), иначе — то, что реально сохранено на сервере.
function currentAccentIndex(word) {
  return word.draftAccentIndex !== undefined ? word.draftAccentIndex : (word.accentIndex ?? null);
}

function render(app, state) {
  const itemsHtml = state.words.map((word, index) => {
    const cascadeDelay = `style="animation-delay: ${Math.min(index, 8) * 55}ms;"`;

    if (word.editing) {
      const text = word.draftText ?? word.text;
      const meaning = word.draftMeaning ?? word.meaning;
      const example = word.draftExample ?? (word.example || "");
      const categoryId = word.draftCategoryId !== undefined ? word.draftCategoryId : (word.categoryId ?? "");

      return `
        <li class="specimen" data-id="${word.id}" ${cascadeDelay}>
          <div class="specimen-bar"></div>
          <div class="specimen-body">
            <div class="form">
              <div class="${fieldWrapClass("text", state.errorField)}">
                <label class="field-label">Слово</label>
                <input type="text" class="edit-text" value="${escapeHtml(text)}" />
                ${fieldErrorHtml("text", state.errorField, state.error)}
                <div class="accent-picker-wrap">${accentPickerHtml(text, currentAccentIndex(word))}</div>
              </div>
              <div class="${fieldWrapClass("meaning", state.errorField)}">
                <label class="field-label">Значение</label>
                <input type="text" class="edit-meaning" value="${escapeHtml(meaning)}" />
                ${fieldErrorHtml("meaning", state.errorField, state.error)}
              </div>
              <div class="field">
                <label class="field-label">Пример</label>
                <input type="text" class="edit-example" value="${escapeHtml(example)}" />
              </div>
              <div class="field">
                <label class="field-label">Категория</label>
                <select class="edit-category">
                  <option value="">Без категории</option>
                  ${state.categories.map(c => `<option value="${c.id}" ${String(c.id) === String(categoryId) ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
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
            <span>${catName ? escapeHtml(catName) : "Без категории"}</span>
            <span>·</span>
            <span>Собрано ${formatShortDate(word.createdAt)}</span>
            ${due ? `<span class="chip chip-due">Пора повторить</span>` : ""}
          </div>
          <p class="specimen-word">${wordWithAccentHtml(word.text, word.accentIndex)}</p>
          <p class="specimen-meaning">${escapeHtml(word.meaning)}</p>
          ${word.example ? `<p class="specimen-example">«${escapeHtml(word.example)}»</p>` : ""}
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
  }).join("");

  app.innerHTML = `
    <div class="page">
      ${brandMark()}
      <h1 class="headline" style="margin-top: 18px;">Все слова</h1>
      <p class="meta-line">${state.words.length} слов${state.words.length === 1 ? "о" : ""} в коллекции</p>

      ${state.error && !["text", "meaning"].includes(state.errorField) ? `<p class="error-banner">${escapeHtml(state.error)}</p>` : ""}

      ${state.categories.length > 0 ? `
        <div class="chip-row">
          ${state.categories.map(c => `
            <span class="chip">
              ${escapeHtml(c.name)}
              <button class="chip-remove delete-category-btn" data-id="${c.id}" title="Удалить категорию" aria-label="Удалить категорию ${escapeHtml(c.name)}">×</button>
            </span>
          `).join("")}
        </div>
      ` : ""}

      ${state.words.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${bookmarkIcon()}</div>
          <p>Коллекция пуста. Добавьте первое слово, чтобы начать наблюдения.</p>
          <button id="addBtn" class="btn btn-primary">Добавить слово</button>
        </div>
      ` : `<ul class="specimen-list">${itemsHtml}</ul>`}

      <div class="actions">
        ${state.words.length > 0 ? `<button id="addBtn" class="btn btn-ghost">Добавить слово</button>` : ""}
        <button id="back" class="btn btn-ghost">На главную</button>
      </div>
    </div>
  `;

  document.getElementById("addBtn")?.addEventListener("click", () => navigate("/add"));
  document.getElementById("back").onclick = () => navigate("/dashboard");

  // Живой пикер ударения внутри открытой карточки редактирования (если
  // такая есть). draftAccentIndex мутируется прямо на объекте слова в
  // state.words — в отличие от text/meaning/example, его не нужно отдельно
  // "собирать" из DOM в captureEditingDraft(): к моменту следующего
  // render() он уже на месте.
  const editingWord = state.words.find(w => w.editing);
  if (editingWord) {
    const card = app.querySelector(`li[data-id="${editingWord.id}"]`);
    const textInput = card?.querySelector(".edit-text");
    const accentContainer = card?.querySelector(".accent-picker-wrap");

    if (textInput && accentContainer) {
      const renderAccent = () => {
        accentContainer.innerHTML = accentPickerHtml(textInput.value, currentAccentIndex(editingWord));
        attachAccentPicker(accentContainer, currentAccentIndex(editingWord), (index) => {
          editingWord.draftAccentIndex = index;
          renderAccent();
        });
      };

      // Текст изменился — прошлый индекс мог указывать уже на другую
      // букву (или на несуществующую позицию), сбрасываем и просим
      // отметить ударение заново, а не гадаем, куда он "переехал".
      textInput.addEventListener("input", () => {
        editingWord.draftAccentIndex = null;
        renderAccent();
      });
    }

    const meaningInput = card?.querySelector(".edit-meaning");
    const saveBtn = card?.querySelector(".save-btn");
    if (textInput && meaningInput && saveBtn) {
      wireRequiredFieldsToggle(saveBtn, [textInput, meaningInput]);
    }
  }

  app.querySelectorAll(".delete-category-btn").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);

      if (!window.confirm("Удалить категорию? Слова останутся, но станут «без категории».")) {
        return;
      }

      captureEditingDraft(app, state);

      try {
        await del(`/categories/${id}`);
        state.categories = state.categories.filter(c => c.id !== id);
        // Отражаем на клиенте то же, что сделал бэкенд: у слов этой
        // категории обнуляем categoryId, не дожидаясь перезагрузки списка.
        state.words = state.words.map(w => w.categoryId === id ? { ...w, categoryId: null } : w);
        state.error = "";
        state.errorField = null;
      } catch (err) {
        state.error = err.message;
        state.errorField = err.field ?? null;
      }

      render(app, state);
    };
  });

  app.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = () => {
      captureEditingDraft(app, state);
      const id = Number(btn.dataset.id);
      state.words = state.words.map(w => ({ ...w, editing: w.id === id }));
      // Открываем редактирование другой карточки — старая ошибка сохранения
      // (если была) больше не относится ни к одному открытому полю.
      state.error = "";
      state.errorField = null;
      render(app, state);
    };
  });

  app.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      state.words = state.words.map(w => {
        if (w.id !== id) return w;
        const cleared = { ...w, editing: false };
        clearDraft(cleared);
        return cleared;
      });
      state.error = "";
      state.errorField = null;
      render(app, state);
    };
  });

  app.querySelectorAll(".save-btn").forEach(btn => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.id);
      const card = app.querySelector(`li[data-id="${id}"]`);
      const word = state.words.find(w => w.id === id);

      const text = card.querySelector(".edit-text").value.trim();
      const meaning = card.querySelector(".edit-meaning").value.trim();
      const example = card.querySelector(".edit-example").value.trim();
      const categoryId = card.querySelector(".edit-category").value || null;
      const accentIndex = currentAccentIndex(word);

      try {
        const updated = await put(`/words/${id}`, {
          text,
          meaning,
          example: example || null,
          categoryId: categoryId ? Number(categoryId) : null,
          accentIndex
        });

        state.words = state.words.map(w => w.id === id ? { ...updated, editing: false } : w);
        state.error = "";
        state.errorField = null;
      } catch (err) {
        // ВАЖНО: раньше здесь просто выставлялся state.error и вызывался
        // render() — но render() отрисовывает поля по word.draftText/
        // draftMeaning/..., которые в этом хендлере ничем не обновлялись.
        // В результате при ошибке валидации (например, пустое "Значение")
        // только что введённый текст пропадал при перерисовке. Теперь
        // сохраняем ровно то, что человек напечатал, как черновик — и
        // дополнительно подсвечиваем конкретное поле через err.field.
        state.words = state.words.map(w => w.id === id
          ? { ...w, draftText: text, draftMeaning: meaning, draftExample: example, draftCategoryId: categoryId ?? "" }
          : w);
        state.error = err.message;
        state.errorField = err.field ?? null;
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

      captureEditingDraft(app, state);

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
