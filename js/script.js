(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector(".site-header");
  const menuBtn = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  const sections = document.querySelectorAll("main section[id]");
  const revealItems = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll(".counter[data-target]");
  const pointerDot = document.querySelector(".pointer-dot");
  const pointerRing = document.querySelector(".pointer-ring");
  const whatsappNumber = "919671766584";

  const pointerEnabled =
    !prefersReducedMotion &&
    !!pointerDot &&
    !!pointerRing &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (pointerEnabled) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId = null;

    const interactiveSelector =
      'a, button, input, textarea, select, [role=\"button\"], .btn, .nav-link, .chat-toggle-btn, .chat-close-btn';

    const animatePointer = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      pointerDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      pointerRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      rafId = requestAnimationFrame(animatePointer);
    };

    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      document.body.classList.add("cursor-active");

      if (!rafId) {
        rafId = requestAnimationFrame(animatePointer);
      }
    });

    document.addEventListener("mouseleave", () => {
      document.body.classList.remove("cursor-active", "cursor-hover");
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });

    document.addEventListener("mouseover", (event) => {
      if (event.target.closest(interactiveSelector)) {
        document.body.classList.add("cursor-hover");
      }
    });

    document.addEventListener("mouseout", (event) => {
      if (event.target.closest(interactiveSelector)) {
        document.body.classList.remove("cursor-hover");
      }
    });
  }

  const closeMenu = () => {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  };

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("open")) return;

      const clickedInside = nav.contains(event.target);
      const clickedButton = menuBtn.contains(event.target);

      if (!clickedInside && !clickedButton) closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 840) closeMenu();
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      const target = id ? document.querySelector(id) : null;

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }

      closeMenu();
    });
  });

  const updateScrollEffects = () => {
    const scrollY = window.scrollY || 0;

    if (header) {
      header.classList.toggle("scrolled", scrollY > 8);
    }
  };

  window.addEventListener("scroll", updateScrollEffects, { passive: true });
  updateScrollEffects();

  if ("IntersectionObserver" in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const showElement = (el) => el.classList.add("visible");

  if (prefersReducedMotion) {
    revealItems.forEach(showElement);
  } else if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          showElement(entry.target);
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach(showElement);
  }

  const animateCounter = (element) => {
    const target = Number(element.dataset.target);
    if (!Number.isFinite(target) || target <= 0) return;

    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = String(target);
      }
    };

    requestAnimationFrame(tick);
  };

  if (counters.length > 0) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach((counter) => {
        counter.textContent = counter.dataset.target;
      });
    } else {
      const counterObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.45 }
      );

      counters.forEach((counter) => counterObserver.observe(counter));
    }
  }

  const buildWhatsAppUrl = (message) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const normalizeText = (text) => String(text || "").replace(/\s+/g, " ").trim();

  const setupContactPrefillFromQuery = () => {
    const messageField = document.querySelector("#message[name='message']");
    if (!messageField) return;

    const params = new URLSearchParams(window.location.search);
    const service = normalizeText(params.get("service"));
    const plan = normalizeText(params.get("plan"));

    if (!service || !plan) return;

    const price = normalizeText(params.get("price"));
    const pages = normalizeText(params.get("pages"));
    const support = normalizeText(params.get("support"));
    const delivery = normalizeText(params.get("delivery"));

    const lines = [
      `Service: ${service}`,
      `Package: ${plan}`,
      price ? `Price: ${price}` : "",
      pages ? `Number of Pages: ${pages}` : "",
      support ? `Support Duration: ${support}` : "",
      delivery ? `Delivery Time: ${delivery}` : "",
      "",
      "Project brief:",
    ].filter(Boolean);

    const prefillText = lines.join("\n");
    messageField.value = prefillText;
  };

  const getRowValues = (table, rowName) => {
    const match = Array.from(table.querySelectorAll("tbody tr")).find((row) => {
      const label = row.querySelector("th[scope='row']");
      return label && normalizeText(label.textContent).toLowerCase() === rowName.toLowerCase();
    });

    if (!match) return [];
    return Array.from(match.querySelectorAll("td")).map((cell) => normalizeText(cell.textContent));
  };

  const setupPricingPackageActions = () => {
    const pricingTables = document.querySelectorAll(".compare-table");
    if (pricingTables.length === 0) return;

    pricingTables.forEach((table) => {
      const highlightPlanColumn = (planIndex) => {
        const safePlanIndex = Math.max(1, Math.min(3, Number(planIndex) || 2));
        const colNumber = safePlanIndex + 1;

        table.classList.add("table-has-selection");
        table.querySelectorAll(".selected-col").forEach((cell) => cell.classList.remove("selected-col"));

        table.querySelectorAll(`tr > *:nth-child(${colNumber})`).forEach((cell) => {
          cell.classList.add("selected-col");
        });
      };

      const serviceName = normalizeText(table.getAttribute("aria-label") || "NeuralForge AI service")
        .replace(/\s*package comparison\s*$/i, "")
        .trim();

      const planNames = Array.from(table.querySelectorAll("thead th"))
        .slice(1)
        .map((header) => {
          const primary = header.querySelector("span");
          return normalizeText(primary ? primary.textContent : header.textContent).replace(/\s*Most Popular\s*/i, "").trim();
        });

      const priceValues = getRowValues(table, "Price");
      const pagesValues = getRowValues(table, "Number of Pages");
      const supportValues = getRowValues(table, "Support Duration");
      const deliveryValues = getRowValues(table, "Delivery Time");

      table.querySelectorAll(".pricing-wa-btn").forEach((button) => {
        const colIndex = Math.max(Number(button.dataset.planCol || "1") - 1, 0);
        const planName = planNames[colIndex] || `Plan ${colIndex + 1}`;
        const price = priceValues[colIndex] || "";
        const pages = pagesValues[colIndex] || "";
        const support = supportValues[colIndex] || "";
        const delivery = deliveryValues[colIndex] || "";

        const message = [
          "Hi NeuralForge AI,",
          `I want the ${planName} package for ${serviceName}.`,
          price ? `Price: ${price}` : "",
          pages ? `Number of Pages: ${pages}` : "",
          support ? `Support Duration: ${support}` : "",
          delivery ? `Delivery Time: ${delivery}` : "",
          "Please share the next steps to start.",
        ]
          .filter(Boolean)
          .join("\n");

        button.href = buildWhatsAppUrl(message);
        button.target = "_blank";
        button.rel = "noopener noreferrer";
        button.setAttribute("aria-label", `WhatsApp about ${serviceName} ${planName}`);
      });

      table.querySelectorAll(".button-row td .btn").forEach((button) => {
        button.addEventListener("click", () => {
          const cell = button.closest("td");
          if (!cell || typeof cell.cellIndex !== "number") return;
          highlightPlanColumn(cell.cellIndex);
        });
      });

      table.querySelectorAll(".button-row td a.btn").forEach((button) => {
        if (button.classList.contains("pricing-wa-btn") || button.classList.contains("btn-call-now")) {
          return;
        }

        button.addEventListener("click", (event) => {
          event.preventDefault();

          const cell = button.closest("td");
          if (!cell || typeof cell.cellIndex !== "number") return;

          const colIndex = cell.cellIndex - 1;
          const planName = planNames[colIndex] || `Plan ${colIndex + 1}`;
          const price = priceValues[colIndex] || "";
          const pages = pagesValues[colIndex] || "";
          const support = supportValues[colIndex] || "";
          const delivery = deliveryValues[colIndex] || "";

          const baseHref = button.getAttribute("href") || "../index.html#contact";
          const [basePath = "../index.html"] = baseHref.split("#");
          const targetUrl = new URL(basePath, window.location.href);

          targetUrl.searchParams.set("service", serviceName);
          targetUrl.searchParams.set("plan", planName);
          if (price) targetUrl.searchParams.set("price", price);
          if (pages) targetUrl.searchParams.set("pages", pages);
          if (support) targetUrl.searchParams.set("support", support);
          if (delivery) targetUrl.searchParams.set("delivery", delivery);
          targetUrl.hash = "contact";

          window.location.href = targetUrl.toString();
        });
      });
    });
  };

  const mountFloatingContactActions = () => {
    if (!document.body || document.querySelector(".floating-contact-actions")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "floating-contact-actions";

    const whatsappWidget = document.createElement("a");
    whatsappWidget.className = "whatsapp-widget-float";
    whatsappWidget.href = buildWhatsAppUrl("Hi NeuralForge AI, I have a simple inquiry about your services.");
    whatsappWidget.target = "_blank";
    whatsappWidget.rel = "noopener noreferrer";
    whatsappWidget.setAttribute("aria-label", "Chat on WhatsApp");
    whatsappWidget.innerHTML = '<i class="fab fa-whatsapp" aria-hidden="true"></i><span>WhatsApp</span>';

    const callWidget = document.createElement("a");
    callWidget.className = "call-widget-float";
    callWidget.href = "tel:+919671766584";
    callWidget.setAttribute("aria-label", "Call now");
    callWidget.innerHTML = '<i class="fas fa-phone" aria-hidden="true"></i><span>Call Now</span>';

    wrapper.appendChild(whatsappWidget);
    wrapper.appendChild(callWidget);
    document.body.appendChild(wrapper);
  };

  const chatWidget = document.querySelector("[data-chat-widget]");
  if (chatWidget) {
    document.body.classList.add("has-chat-widget");
  }

  setupPricingPackageActions();
  setupContactPrefillFromQuery();
  mountFloatingContactActions();

  if (chatWidget) {
    const chatToggle = chatWidget.querySelector(".chat-toggle-btn");
    const chatClose = chatWidget.querySelector(".chat-close-btn");
    const chatMessages = chatWidget.querySelector(".chat-messages");
    const chatForm = chatWidget.querySelector(".chat-form");
    const chatInput = chatWidget.querySelector("#chat-input");
    const sendButton = chatWidget.querySelector(".chat-send-btn");

    const conversation = [];
    let busy = false;

    const setOpen = (open) => {
      chatWidget.classList.toggle("open", open);
      if (chatToggle) {
        chatToggle.setAttribute("aria-expanded", String(open));
      }

      if (open && chatInput) {
        setTimeout(() => chatInput.focus(), 40);
      }
    };

    const appendBubble = (role, text) => {
      if (!chatMessages) return null;

      const bubble = document.createElement("article");
      bubble.className = `chat-bubble ${role}`;
      bubble.textContent = text;
      chatMessages.appendChild(bubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return bubble;
    };

    const setBusy = (isBusy) => {
      busy = isBusy;
      if (chatInput) chatInput.disabled = isBusy;
      if (sendButton) sendButton.disabled = isBusy;
    };

    if (chatToggle) {
      chatToggle.addEventListener("click", () => {
        const open = chatWidget.classList.contains("open");
        setOpen(!open);
      });
    }

    if (chatClose) {
      chatClose.addEventListener("click", () => setOpen(false));
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && chatWidget.classList.contains("open")) {
        setOpen(false);
      }
    });

    if (chatForm && chatInput) {
      chatForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (busy) return;

        const message = chatInput.value.trim();
        if (!message) return;

        appendBubble("user", message);
        conversation.push({ role: "user", content: message });
        chatInput.value = "";

        const typingBubble = appendBubble("typing", "Thinking...");
        setBusy(true);

        try {
          const response = await fetch("/.netlify/functions/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              history: conversation.slice(-10),
            }),
          });

          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.reply) {
            throw new Error(data.error || "Assistant is unavailable right now.");
          }

          if (typingBubble) typingBubble.remove();
          appendBubble("assistant", data.reply);
          conversation.push({ role: "assistant", content: data.reply });
        } catch (error) {
          if (typingBubble) typingBubble.remove();
          appendBubble("error", error.message || "Unable to connect to assistant.");
        } finally {
          setBusy(false);
          chatInput.focus();
        }
      });
    }
  }
})();
