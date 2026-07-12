import { navigate } from "../core/router.js";
import { get, post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export async function renderAddWord() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="page">
      <p class="loading-line">Открываем категории…</p>
    </div>
  `;

  // Категории не обязательны для добавления слова, поэтому если их
  // загрузка упадёт — не блокируем форму, просто показываем её без списка.
  let categories = [];
  try {
    categories = await get("/categories");
  } catch (e) {
    categories = [];
  }

  renderForm(app, categories);
}

function renderForm(app, categories, errorMessage = "", selectedCategoryId = "") {
  const categoryOptions = categories
    .map(c => `<option value="${c.id}" ${String(c.id) === String(selectedCategoryId) ? "selected" : ""}>${escapeHtml(c.name)}</option>`)
    .join("");

  app.innerHTML = `
    <div class="page">
      <span class="masthead-mark">Wordflow</span>
      <h1 class="headline" style="margin-top: 18px;">Новый экземпляр</h1>
      <p class="meta-line">Слово, значение и пример — коллекция начинается с одной записи.</p>

      ${errorMessage ? `<p class="error-banner">${escapeHtml(errorMessage)}</p>` : ""}

      <form id="addWordForm" class="form">
        <div class="field">
          <label class="field-label" for="text">Слово *</label>
          <input type="text" id="text" required autocomplete="off" />
        </div>

        <div class="field">
          <label class="field-label" for="meaning">Значение *</label>
          <input type="text" id="meaning" required autocomplete="off" />
        </div>

        <div class="field">
          <label class="field-label" for="example">Пример использования</label>
          <input type="text" id="example" autocomplete="off" />
        </div>

        <div class="field">
          <label class="field-label" for="categoryId">Категория</label>
          <select id="categoryId">
            <option value="">Без категории</option>
            ${categoryOptions}
          </select>
        </div>

        <div class="actions">
          <button type="submit" id="submitBtn" class="btn btn-primary">Сохранить слово</button>
          <button type="button" id="back" class="btn btn-ghost">Назад</button>
        </div>
      </form>

      <details class="category-drawer">
        <summary>Новая категория</summary>
        <div class="actions">
          <input type="text" id="newCategoryName" placeholder="Название категории" />
          <button type="button" id="createCategoryBtn" class="btn btn-ghost">Создать</button>
        </div>
        <p id="categoryError" class="error-banner" style="margin-top: 12px;" hidden></p>
      </details>
    </div>
  `;

  document.getElementById("back").onclick = () => {
    navigate("/");
  };

  document.getElementById("createCategoryBtn").onclick = async () => {
    const name = document.getElementById("newCategoryName").value.trim();
    const categoryError = document.getElementById("categoryError");

    if (!name) return;

    try {
      const category = await post("/categories", { name });
      categories = [...categories, category];
      renderForm(app, categories, errorMessage, category.id);
    } catch (err) {
      categoryError.textContent = err.message;
      categoryError.hidden = false;
    }
  };

  document.getElementById("addWordForm").onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Сохраняем…";

    const text = document.getElementById("text").value.trim();
    const meaning = document.getElementById("meaning").value.trim();
    const example = document.getElementById("example").value.trim();
    const categoryId = document.getElementById("categoryId").value || null;

    try {
      await post("/words", {
        text,
        meaning,
        example: example || null,
        categoryId: categoryId ? Number(categoryId) : null
      });

      navigate("/");
    } catch (err) {
      // Сюда попадёт как сетевая ошибка, так и ошибка валидации от
      // сервера (например, "Поле "Слово" обязательно") — api.js уже
      // достаёт текст из { error: "..." }, так что показываем его как есть.
      renderForm(app, categories, err.message, categoryId);
    }
  };
}
