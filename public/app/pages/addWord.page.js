import { navigate } from '../core/router.js';
import { get, post } from '../core/api.js';
import {
  escapeHtml,
  brandMark,
  accentPickerHtml,
  attachAccentPicker,
  wireRequiredFieldsToggle
} from '../core/dom.js';

export async function renderAddWord() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="page">
      <p class="loading-line">Открываем категории…</p>
    </div>
  `;
  let categories;
  try {
    categories = await get('/categories');
    if (!app.isConnected) return;
  } catch (e) {
    if (!app.isConnected) return;
    categories = [];
  }

  renderForm(app, categories);
}

function renderForm(app, categories) {
  if (!app.isConnected) return;
  const categoryOptions = categories
    .map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`)
    .join('');

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

  app.querySelector('#back').onclick = () => {
    navigate('/dashboard');
  };
  let accentIndex = null;
  const textInput = app.querySelector('#text');
  const accentPicker = app.querySelector('#accentPicker');

  function renderAccentPicker() {
    accentPicker.innerHTML = accentPickerHtml(textInput.value, accentIndex);
    attachAccentPicker(accentPicker, accentIndex, (index) => {
      accentIndex = index;
      renderAccentPicker();
    });
  }

  textInput.addEventListener('input', () => {
    accentIndex = null;
    renderAccentPicker();
  });

  renderAccentPicker();

  wireRequiredFieldsToggle(app.querySelector('#submitBtn'), [
    app.querySelector('#text'),
    app.querySelector('#meaning')
  ]);
  const createCategoryBtn = app.querySelector('#createCategoryBtn');
  wireRequiredFieldsToggle(createCategoryBtn, [app.querySelector('#newCategoryName')]);

  createCategoryBtn.onclick = async () => {
    const nameInput = app.querySelector('#newCategoryName');
    const name = nameInput.value.trim();
    const categoryError = app.querySelector('#categoryError');

    if (!name) return;

    try {
      const category = await post('/categories', { name });
      if (!app.isConnected) return;
      categories = [...categories, category];

      const select = app.querySelector('#categoryId');
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
      select.value = category.id;

      nameInput.value = '';
      createCategoryBtn.disabled = true;
      categoryError.hidden = true;
    } catch (err) {
      if (!app.isConnected) return;
      categoryError.textContent = err.message;
      categoryError.hidden = false;
    }
  };

  app.querySelector('#addWordForm').onsubmit = async (e) => {
    e.preventDefault();

    const submitBtn = app.querySelector('#submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Сохраняем…';

    const text = app.querySelector('#text').value;
    const meaning = app.querySelector('#meaning').value.trim();
    const example = app.querySelector('#example').value.trim();
    const categoryId = app.querySelector('#categoryId').value || null;

    try {
      await post('/words', {
        text,
        meaning,
        example: example || null,
        categoryId: categoryId ? Number(categoryId) : null,
        accentIndex
      });
      if (!app.isConnected) return;
      if (!app.isConnected) return;

      navigate('/dashboard');
    } catch (err) {
      if (!app.isConnected) return;
      showFormError(app, err.message, err.field);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Сохранить слово';
    }
  };
}
const WORD_FIELD_IDS = ['text', 'meaning'];
function showFormError(app, message, field = null) {
  const formError = app.querySelector('#formError');
  const showBanner = message && !WORD_FIELD_IDS.includes(field);
  formError.innerHTML = showBanner ? `<p class="error-banner">${escapeHtml(message)}</p>` : '';

  WORD_FIELD_IDS.forEach((id) => {
    const wrap = app.querySelector(`#${id}Field`);
    if (!wrap) return;

    wrap.classList.remove('has-error');
    wrap.querySelector('.field-error-text')?.remove();

    if (id === field) {
      wrap.classList.add('has-error');
      wrap.insertAdjacentHTML(
        'beforeend',
        `<p class="field-error-text">${escapeHtml(message)}</p>`
      );
    }
  });
}
