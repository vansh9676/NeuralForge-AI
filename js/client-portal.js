(() => {
  const loginSection = document.getElementById("portal-login");
  const dashboardSection = document.getElementById("portal-dashboard");
  const loginForm = document.getElementById("portal-login-form");
  const clientName = document.getElementById("portal-client-name");
  const logoutBtn = document.getElementById("portal-logout");
  const navLinks = document.querySelectorAll(".portal-nav-link");

  const toTitleCase = (value) =>
    value
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");

  const setView = (loggedIn) => {
    if (!loginSection || !dashboardSection) {
      return;
    }

    loginSection.classList.toggle("is-hidden", loggedIn);
    dashboardSection.classList.toggle("is-hidden", !loggedIn);

    if (loggedIn) {
      dashboardSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  navLinks.forEach((button) => {
    button.addEventListener("click", () => {
      navLinks.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const email = String(formData.get("email") || "").trim();

      if (clientName && email.includes("@")) {
        const rawName = email.split("@")[0];
        clientName.textContent = toTitleCase(rawName) || "Client Name";
      }

      setView(true);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (loginForm) {
        loginForm.reset();
      }
      setView(false);
    });
  }

  setView(false);
})();
