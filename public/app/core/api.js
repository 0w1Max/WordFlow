const BASE_URL = '/api/v1';

export async function request(url, options = {}) {
  const pageRoot = document.getElementById('app');
  const res = await fetch(BASE_URL + url, { ...options, credentials: 'same-origin' });
  const isAuthAttempt = url === '/auth/login' || url === '/auth/register';

  if (res.status === 401 && !isAuthAttempt) {
    if (pageRoot?.isConnected) window.location.href = '/login';
    throw new Error('Сессия истекла, войдите заново');
  }

  if (!res.ok) {
    let message = 'API error';
    let field = null;

    try {
      const body = await res.json();
      if (body && body.error) {
        message = body.error;
      }
      if (body && body.field) {
        field = body.field;
      }
    } catch {
      /* Proxies may return non-JSON error responses. */
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data !== undefined ? JSON.stringify(data) : undefined
  });
}

export function put(url, data) {
  return request(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export function del(url) {
  return request(url, { method: 'DELETE' });
}
export async function checkAuth() {
  try {
    const res = await fetch(BASE_URL + '/auth/me', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}
