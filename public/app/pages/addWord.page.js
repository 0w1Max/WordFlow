import { navigate } from "../core/router.js";
import { get, post } from "../core/api.js";
import { escapeHtml, brandMark, fieldWrapClass, fieldErrorHtml, accentPickerHtml, attachAccentPicker } from "../core/dom.js";

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
      ${brandMark()}
      <h1 class="headline" style="margin-top: 18px;">Новый экземпляр</h1>
      <p class="meta-line">Слово, значение и пример — коллекция начинается с одной записи.</p>

      <div id="formError"></div>

      <form id="addWordForm" class="form">
        <div class="field" id="textField">
          <label class="field-label" for="text">Слово *</label>
          <input type="text" id="text" required autocomplete="off" />
          <div id="accentPicker"></div>
        </div>

        <div class="field" id="meaningField">
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
    navigate("/dashboard");
  };

  // Ударение — необязательное поле (см. миграцию accent_index в db/db.js).
  // accentIndex здесь хранит индекс буквы, выбранной кликом по превью, а не
  // просто DOM-состояние: на submit его нужно явно прочитать и отправить.
  //
  // ВАЖНО: при любом изменении текста слова индекс сбрасывается в null, а
  // не пересчитывается "на глаз" — буквы могли полностью перетасоваться
  // (например, слово стёрли и напечатали другое), и молчаливое сохранение
  // старого индекса указало бы на случайную букву нового слова. Явный сброс
  // безопаснее: в худшем случае человек просто отметит ударение заново.
  let accentIndex = null;
  const textInput = document.getElementById("text");
  const accentPicker = document.getElementById("accentPicker");

  function renderAccentPicker() {
    accentPicker.innerHTML = accentPickerHtml(textInput.value, accentIndex);
    attachAccentPicker(accentPicker, accentIndex, (index) => {
      accentIndex = index;
      renderAccentPicker();
    });
  }

  textInput.addEventListener("input", () => {
    accentIndex = null;
    renderAccentPicker();
  });

  renderAccentPicker();

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
        categoryId: categoryId ? Number(categoryId) : null,
        accentIndex
      });

      navigate("/dashboard");
    } catch (err) {
      // ВАЖНО: раньше ошибка валидации перерисовывала всю форму заново —
      // человек, опечатавшийся в одном поле, терял и все остальные.
      // Теперь и баннер, и подсветка конкретного поля (err.field —
      // "text" или "meaning") просто вставляются/обновляются на месте,
      // сама форма и всё, что в неё введено, не трогается.
      showFormError(err.message, err.field);
      submitBtn.disabled = false;
      submitBtn.textContent = "Сохранить слово";
    }
  };
}

// Поля формы, у которых сервер может указать конкретную ошибку
// (validators/wordValidator.js: field "text" или "meaning").
const WORD_FIELD_IDS = ["text", "meaning"];

// Точечная подсветка без re-render всей формы (см. комментарий в onsubmit
// выше) — снимаем прошлую подсветку со всех полей и, если ошибка привязана
// к конкретному полю, подсвечиваем только его; иначе показываем общий
// баннер сверху формы, как раньше.
//
// accentIndex сюда намеренно не входит: у него нет своего .field-блока
// (это дополнение внутри textField, см. renderForm выше), и в норме такая
// ошибка вообще не должна долетать до сервера — форма сама сбрасывает
// accentIndex в null при любой правке текста. Если она всё же пришла
// (WORD_FIELD_IDS.includes(field) === false), считаем её "не привязанной
// к конкретному видимому полю" и показываем обычным баннером сверху.
function showFormError(message, field = null) {
  const formError = document.getElementById("formError");
  const showBanner = message && !WORD_FIELD_IDS.includes(field);
  formError.innerHTML = showBanner ? `<p class="error-banner">${escapeHtml(message)}</p>` : "";

  WORD_FIELD_IDS.forEach((id) => {
    const wrap = document.getElementById(`${id}Field`);
    if (!wrap) return;

    wrap.classList.remove("has-error");
    wrap.querySelector(".field-error-text")?.remove();

    if (id === field) {
      wrap.classList.add("has-error");
      wrap.insertAdjacentHTML("beforeend", `<p class="field-error-text">${escapeHtml(message)}</p>`);
    }
  });
}
