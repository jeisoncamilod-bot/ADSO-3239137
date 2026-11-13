const API_BASE = "/api/v1";

export function getToken() {
  return sessionStorage.getItem("plans_archive_token");
}

export function saveToken(token) {
  sessionStorage.setItem("plans_archive_token", token);
}

export function clearToken() {
  sessionStorage.removeItem("plans_archive_token");
}

export async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationMessage = result.errors
      ? Object.values(result.errors).flat().join(" ")
      : null;

    throw new Error(
      validationMessage || result.message || `Error HTTP ${response.status}`
    );
  }

  return result;
}

export async function login(email, password) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const token = result.data?.token;

  if (!token) {
    throw new Error("El servidor no devolvió un token de acceso.");
  }

  saveToken(token);

  return result.data.user;
}

export async function getCurrentUser() {
  const result = await apiRequest("/auth/me");
  return result.data;
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    clearToken();
  }
}