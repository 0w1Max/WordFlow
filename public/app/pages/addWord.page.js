import { navigate } from "../core/router.js";
import { get, post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

export async function renderAddWord() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="page">
      <h2>Добавить слово</h2>
      <p>Загрузка категорий...</p>
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

function renderForm(app, categories, errorMessage = "") {
  const categoryOptions = categories
    .map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
    .join("");

  app.innerHTML = `
    <div class="page">
      <h2>Добавить слово</h2>

      ${errorMessage ? `<p class="error">${escapeHtml(errorMessage)}</p>` : ""}

      <form id="addWordForm" class="form">
        <label>
          Слово *
          <input type="text" id="text" required autocomplete="off" />
        </label>

        <label>
          Значение *
          <input type="text" id="meaning" required autocomplete="off" />
        </label>

        <label>
          Пример использования
          <input type="text" id="example" autocomplete="off" />
        </label>

        <label>
          Категория
          <select id="categoryId">
            <option value="">Без категории</option>
            ${categoryOptions}
          </select>
        </label>

        <div class="form-actions">
          <button type="submit" id="submitBtn">Сохранить</button>
          <button type="button" id="back">Назад</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById("back").onclick = () => {
    navigate("/");
  };

  document.getElementById("addWordForm").onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Сохранение...";

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
      renderForm(app, categories, err.message);
    }
  };
}

