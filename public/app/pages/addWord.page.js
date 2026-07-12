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

function renderForm(app, categories) {
  const categoryOptions = categories
    .map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
    .join("");

  app.innerHTML = `
    <div class="page">
      <span class="masthead-mark">Wordflow</span>
      <h1 class="headline" style="margin-top: 18px;">Новый экземпляр</h1>
      <p class="meta-line">Слово, значение и пример — коллекция начинается с одной записи.</p>

      <div id="formError"></div>

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

  // ВАЖНО: создание категории раньше вызывало полную перерисовку формы
  // (renderForm(...)), которая стирала уже введённые слово/значение/пример —
  // человек терял заполненные данные только потому, что попутно завёл
  // категорию. Теперь новый <option> просто добавляется в существующий
  // <select> точечно, ни один другой элемент формы не трогается и не
  // перерисовывается.
  document.getElementById("createCategoryBtn").onclick = async () => {
    const nameInput = document.getElementById("newCategoryName");
    const name = nameInput.value.trim();
    const categoryError = document.getElementById("categoryError");

    if (!name) return;

    try {
      const category = await post("/categories", { name });
      categories = [...categories, category];

      const select = document.getElementById("categoryId");
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
      select.value = category.id;

      nameInput.value = "";
      categoryError.hidden = true;
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
      // ВАЖНО: раньше ошибка валидации перерисовывала всю форму заново —
      // человек, опечатавшийся в одном поле, терял и все остальные.
      // Теперь баннер ошибки просто вставляется/обновляется на месте,
      // сама форма и всё, что в неё введено, не трогается.
      showFormError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Сохранить слово";
    }
  };
}

function showFormError(message) {
  document.getElementById("formError").innerHTML =
    `<p class="error-banner">${escapeHtml(message)}</p>`;
}
