const API_BASE = "/api/v1";
const TOKEN_KEY = "plans_archive_token";

/**
 * Retrieve the current access token.
 */
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Store the access token for the current session.
 */
export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove the current access token.
 */
export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * Execute an authenticated API request.
 */
export async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json") &&
      !contentType.includes("+json")) {
    throw new Error(
      `El servidor devolvió una respuesta no válida. HTTP ${response.status}.`
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "No se pudo interpretar la respuesta JSON del servidor."
    );
  }

  if (!response.ok) {
    const validationMessage = result?.errors
      ? Object.values(result.errors).flat().join(" ")
      : null;

    throw new Error(
      validationMessage ||
      result?.message ||
      `Error HTTP ${response.status}`
    );
  }

  return result;
}

/**
 * Authenticate a user and store the access token.
 */
export async function login(email, password) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const token = result?.data?.token;
  const user = result?.data?.user;

  if (typeof token !== "string" || !token.trim()) {
    throw new Error(
      "El servidor no devolvió un token de acceso válido."
    );
  }

  if (!user || typeof user !== "object" || !user.id) {
    throw new Error(
      "El servidor no devolvió los datos del usuario."
    );
  }

  saveToken(token);

  return user;
}

/**
 * Retrieve the authenticated user profile.
 */
export async function getCurrentUser() {
  const result = await apiRequest("/auth/me");

  return result.data;
}

/**
 * Revoke the current token and clear the session.
 */
export async function logout() {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  } finally {
    clearToken();
  }
}