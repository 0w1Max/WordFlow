// Бэкенд теперь версионирует API (/api/v1/...), фронтенд должен ходить туда же.
const BASE_URL = "/api/v1";

export async function request(url, options = {}) {
  const res = await fetch(BASE_URL + url, { ...options, credentials: "same-origin" });

  // Сессия истекла/отсутствует — уводим на логин. Исключение: сама попытка
  // логина/регистрации тоже может вернуть 401/400 (неверный пароль) — это
  // должно остаться на месте и показаться в форме, а не превратиться
  // в редирект на ту же страницу логина.
  const isAuthAttempt = url === "/auth/login" || url === "/auth/register";

  if (res.status === 401 && !isAuthAttempt) {
    window.location.href = "/login";
    return new Promise(() => {}); // страница всё равно сейчас уйдёт со страницы
  }

  if (!res.ok) {
    // Раньше здесь терялось сообщение об ошибке от сервера (например,
    // "Поле \"Слово\" обязательно") — теперь бэкенд всегда отвечает JSON
    // вида { error: "..." }, и мы читаем именно его.
    let message = "API error";
    let field = null;

    try {
      const body = await res.json();
      if (body && body.error) {
        message = body.error;
      }
      // field — имя конкретного поля формы, к которому относится ошибка
      // валидации (см. errors/AppError.js на бэкенде). Кладём на сам Error,
      // чтобы страница могла подсветить нужный input, а не только показать
      // общий баннер сверху.
      if (body && body.field) {
        field = body.field;
      }
    } catch {
      // тело не JSON — оставляем сообщение по умолчанию
    }

    const err = new Error(message);
    err.field = field;
    throw err;
  }

  if (res.status === 204) {
    return null; // DELETE/logout не возвращают тело
  }

  return res.json();
}

export function get(url) {
  return request(url);
}

export function post(url, data) {
  return request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data !== undefined ? JSON.stringify(data) : undefined
  });
}

export function put(url, data) {
  return request(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export function del(url) {
  return request(url, { method: "DELETE" });
}

// Обычный get("/auth/me") при 401 сам уводит на /login (см. выше) — это
// правильно внутри приложения, но не на публичной лендинг-странице, где
// "не залогинен" — совершенно нормальное состояние, а не ошибка. Поэтому
// здесь отдельный, "тихий" запрос в обход общего request().
export async function checkAuth() {
  try {
    const res = await fetch(BASE_URL + "/auth/me", { credentials: "same-origin" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}
