(function () {
  "use strict";

  function user() {
    try {
      return JSON.parse(localStorage.getItem("chemlab_user") || "null");
    } catch {
      return null;
    }
  }

  async function login(email, password) {
    const result = await window.ChemLabAPI.login(email, password);
    localStorage.setItem("chemlab_user", JSON.stringify(result.user));
    return result.user;
  }

  async function register(email, password, name) {
    const result = await window.ChemLabAPI.register(email, password, name);
    localStorage.setItem("chemlab_user", JSON.stringify(result.user));
    return result.user;
  }

  async function logout() {
    await window.ChemLabAPI.logout();
    localStorage.removeItem("chemlab_user");
  }

  window.ChemLabAuth = { user, login, register, logout };
})();
