(function () {
  "use strict";

  function normalizeBaseUrl(value) {
    const trimmed = String(value || "http://localhost:8080/api").replace(/\/$/, "");
    return trimmed.endsWith("/api") ? trimmed : trimmed + "/api";
  }

  const API_BASE_URL = normalizeBaseUrl(window.CHEMLAB_API_URL || window.CHEMLAB_CONFIG?.API_BASE_URL);
  const tokenKey = "chemlab_token";
  const localUsersKey = "chemlab_local_users";
  const localAttemptsKey = "chemlab_local_attempts";

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

  function isServerUnavailable(error) {
    return !error?.status || error.status === 404 || error.status >= 500;
  }

  function readLocalUsers() {
    try { return JSON.parse(localStorage.getItem(localUsersKey) || "[]"); } catch { return []; }
  }

  function writeLocalUsers(users) {
    localStorage.setItem(localUsersKey, JSON.stringify(users));
  }

  function localToken(email) {
    return "local-demo:" + encodeURIComponent(email);
  }

  function userFromLocalToken() {
    const token = getToken();
    if (!token?.startsWith("local-demo:")) return null;
    const email = decodeURIComponent(token.slice("local-demo:".length));
    return readLocalUsers().find(user => user.email === email) || null;
  }

  async function localLogin(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = readLocalUsers().find(item => item.email === normalizedEmail);
    if (!user || user.password !== password) throw new Error("Неверный email или пароль.");
    const safeUser = { id: user.id, email: user.email, name: user.name, role: "user", local: true };
    setToken(localToken(user.email));
    return { token: getToken(), user: safeUser, local: true };
  }

  async function localRegister(email, password, name) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const displayName = String(name || normalizedEmail).trim();
    if (!normalizedEmail.includes("@") || String(password || "").length < 8) throw new Error("Проверьте email и пароль. Пароль должен быть не короче 8 символов.");
    const users = readLocalUsers();
    if (users.some(user => user.email === normalizedEmail)) throw new Error("Аккаунт с таким email уже есть. Войдите через форму входа.");
    const user = { id: "local-" + Date.now(), email: normalizedEmail, name: displayName, password: String(password), created_at: new Date().toISOString() };
    users.push(user);
    writeLocalUsers(users);
    const safeUser = { id: user.id, email: user.email, name: user.name, role: "user", local: true };
    setToken(localToken(user.email));
    return { token: getToken(), user: safeUser, local: true };
  }

  function localProgress() {
    const user = userFromLocalToken();
    if (!user) throw new Error("Нужен вход в аккаунт.");
    let attempts = [];
    try { attempts = JSON.parse(localStorage.getItem(localAttemptsKey) || "[]"); } catch { attempts = []; }
    const mine = attempts.filter(item => item.email === user.email);
    const last = mine[mine.length - 1];
    return {
      summary: {
        completed_attempts: mine.length,
        progress_percent: Math.min(100, mine.length * 10),
        last_attempt_at: last?.created_at || "",
        last_reaction: last?.reaction_id || ""
      }
    };
  }

  function localSaveAttempt(payload) {
    const user = userFromLocalToken();
    if (!user) throw new Error("Нужен вход в аккаунт.");
    let attempts = [];
    try { attempts = JSON.parse(localStorage.getItem(localAttemptsKey) || "[]"); } catch { attempts = []; }
    attempts.push({ ...payload, email: user.email, created_at: new Date().toISOString() });
    localStorage.setItem(localAttemptsKey, JSON.stringify(attempts.slice(-100)));
    return { ok: true };
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
    getMe: async () => {
      const localUser = userFromLocalToken();
      if (localUser) return { id: localUser.id, email: localUser.email, name: localUser.name, role: "user", local: true };
      const result = await apiClient.get("/me");
      return result.user || result;
    },
    getProgress: async () => {
      if (userFromLocalToken()) return localProgress();
      return apiClient.get("/progress/me");
    },
    getTasks: () => apiClient.get("/tasks"),
    getHandbook: () => apiClient.get("/handbook"),
    saveAttempt: async (payload) => {
      if (userFromLocalToken()) return localSaveAttempt(payload);
      return apiClient.post("/experiments", payload);
    },
    getConstructorElements: () => apiClient.get("/constructor/elements"),
    getConstructorIons: () => apiClient.get("/constructor/ions"),
    evaluateConstructor: (payload) => apiClient.post("/constructor/evaluate", payload),
    validateConstructor: (payload) => apiClient.post("/constructor/validate", payload),
    getConstructorProducts: () => apiClient.get("/constructor/products"),
    saveConstructorProduct: (payload) => apiClient.post("/constructor/save-product", payload),
    login: async (email, password) => {
      try {
        const result = await apiClient.post("/auth/login", { email, password });
        setToken(result.token);
        return result;
      } catch (error) {
        if (!isServerUnavailable(error)) throw error;
        return localLogin(email, password);
      }
    },
    register: async (email, password, name) => {
      try {
        const result = await apiClient.post("/auth/register", { email, password, name });
        setToken(result.token);
        return result;
      } catch (error) {
        if (!isServerUnavailable(error)) throw error;
        return localRegister(email, password, name);
      }
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
