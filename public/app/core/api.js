// Бэкенд теперь версионирует API (/api/v1/...), фронтенд должен ходить туда же.
const BASE_URL = "/api/v1";

export async function request(url, options = {}) {
  const res = await fetch(BASE_URL + url, options);

  if (!res.ok) {
    // Раньше здесь терялось сообщение об ошибке от сервера (например,
    // "Поле \"Слово\" обязательно") — теперь бэкенд всегда отвечает JSON
    // вида { error: "..." }, и мы читаем именно его.
    let message = "API error";

    try {
      const body = await res.json();
      if (body && body.error) {
        message = body.error;
      }
    } catch {
      // тело не JSON — оставляем сообщение по умолчанию
    }

    throw new Error(message);
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
    body: JSON.stringify(data)
  });
}
