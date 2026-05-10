(function () {
  "use strict";

  window.ChemLabApp = {
    currentUser: {
      id: "user1",
      name: "user1",
      role: "user"
    },
    roles: {
      admin: ["manage_users", "manage_reactions", "manage_lessons"],
      user: ["run_lab", "view_periodic_table", "save_notes"]
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var userName = document.querySelector("[data-user-name]");
    var loginButton = document.querySelector("[data-login-button]");

    if (userName) {
      userName.textContent = window.ChemLabApp.currentUser.name;
    }

    if (loginButton) {
      loginButton.addEventListener("click", function () {
        loginButton.classList.toggle("is-open");
      });
    }
  });
})();
