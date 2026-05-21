const BASE_URL = "/api";

export async function request(url, options = {}) {
  const res = await fetch(BASE_URL + url, options);

  if (!res.ok) {
    throw new Error("API error")
  }

  return res.json();
}
