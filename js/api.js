(function () {
  "use strict";

  function normalizeBaseUrl(value) {
    const trimmed = String(value || "http://localhost:8080/api").replace(/\/$/, "");
    return trimmed.endsWith("/api") ? trimmed : trimmed + "/api";
  }

  const API_BASE_URL = normalizeBaseUrl(window.CHEMLAB_API_URL || window.CHEMLAB_CONFIG?.API_BASE_URL);
  const tokenKey = "chemlab_token";

  function getToken() {
    return localStorage.getItem(tokenKey);
  }

  function setToken(token) {
    if (token) localStorage.setItem(tokenKey, token);
  }

  function clearToken() {
    localStorage.removeItem(tokenKey);
  }

  async function request(method, path, body, options = {}) {
    const headers = { Accept: "application/json", ...(options.headers || {}) };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    const response = await fetch(API_BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload.error || "Не удалось выполнить запрос к серверу.";
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  const apiClient = {
    baseUrl: API_BASE_URL,
    tokenKey,
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    put: (path, body) => request("PUT", path, body),
    patch: (path, body) => request("PATCH", path, body),
    delete: (path) => request("DELETE", path),
    getToken,
    setToken,
    clearToken
  };

  window.ChemLabApiClient = apiClient;
  window.ChemLabAPI = {
    baseUrl: API_BASE_URL,
    isConfigured: true,
    hasToken: () => Boolean(getToken()),
    health: () => apiClient.get("/health"),
    getElements: () => apiClient.get("/periodic-elements"),
    getSubstances: () => apiClient.get("/substances"),
    getSubstance: (id) => apiClient.get("/substances/" + encodeURIComponent(id)),
    getReactions: () => apiClient.get("/reactions"),
    getReaction: (id) => apiClient.get("/reactions/" + encodeURIComponent(id)),
    getMe: () => apiClient.get("/me"),
    getProgress: () => apiClient.get("/progress/me"),
    getTasks: () => apiClient.get("/tasks"),
    getHandbook: () => apiClient.get("/handbook"),
    saveAttempt: (payload) => apiClient.post("/experiments", payload),
    login: async (email, password) => {
      const result = await apiClient.post("/auth/login", { email, password });
      setToken(result.token);
      return result;
    },
    register: async (email, password, name) => {
      const result = await apiClient.post("/auth/register", { email, password, name });
      setToken(result.token);
      return result;
    },
    logout: async () => {
      try {
        if (getToken()) await apiClient.post("/auth/logout", {});
      } finally {
        clearToken();
      }
    },
    tokenKey
  };
})();
