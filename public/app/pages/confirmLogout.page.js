import { navigate } from "../core/router.js";
import { get, post } from "../core/api.js";
import { brandMark } from "../core/dom.js";

// Экран подтверждения выхода для гостя. Раньше это было либо два подряд
// window.confirm() (слишком тяжеловесно для одной кнопки), либо выход без
// единого предупреждения (человек молча терял слова). Здесь — обычный
// экран SPA, без перезагрузки страницы и без нативных диалогов браузера:
// то же предупреждение, но оформленное как часть интерфейса, с двумя
// равнозначными по важности вариантами действия, а не одной кнопкой
// "ОК/Отмена".
export async function renderConfirmLogout() {
  const app = document.getElementById("app");

  app.innerHTML = `<div class="page"><p class="loading-line">Проверяем аккаунт…</p></div>`;

  // get() сам уведёт на /login, если сессии нет вообще. Единственный путь
  // сюда — кнопка "Выйти" на dashboard для гостя (см. dashboard.page.js),
  // но прямой переход по URL никто не запрещает: обычному пользователю
  // предупреждение о потере гостевых данных не имеет смысла — ему нечего
  // терять, его аккаунт и так привязан к email.
  const { user } = await get("/auth/me");

  if (!user.isGuest) {
    navigate("/dashboard");
    return;
  }

  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        ${brandMark("auth")}
        <h1 class="headline">Выйти из аккаунта?</h1>

        <p class="meta-line" style="margin-bottom: 24px;">
          Сейчас вы работаете в WordFlow как гость: все собранные слова привязаны только к этой сессии в этом браузере.
          Если выйти, не сохранив прогресс, восстановить их будет уже нельзя.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="saveAndLeaveBtn" class="btn btn-primary" style="width: 100%;">Зарегистрироваться и сохранить слова</button>
          <button id="leaveWithoutSavingBtn" class="btn-danger-text" style="align-self: center;">Выйти и потерять данные</button>
        </div>

        <div class="auth-links">
          <a href="/dashboard" id="stayLink">Остаться на рабочем столе</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById("saveAndLeaveBtn").onclick = () => {
    navigate("/save-progress");
  };

  document.getElementById("leaveWithoutSavingBtn").onclick = async () => {
    try {
      await post("/auth/logout");
    } finally {
      window.location.href = "/";
    }
  };

  document.getElementById("stayLink").onclick = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };
}
