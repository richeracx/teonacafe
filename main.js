document.addEventListener("DOMContentLoaded", () => {
  // UI Elements
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu-overlay");
  const closeMenu = document.querySelector(".close-menu");
  const mobileLinks = document.querySelectorAll(".mobile-nav-links a");
  const header = document.querySelector(".header");

  // Core Elements
  const whatsappCartBtn = document.getElementById("whatsappCartBtn");

  // State
  const phoneNumber = "905326141351";
  let cart = JSON.parse(localStorage.getItem("toenaCart")) || [];

  // Initialize
  initializeButtons();
  updateWhatsappState();

  // --- Mobile Menu ---
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  closeMenu.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    document.body.style.overflow = "auto";
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // --- Revised Logic (State Driven) ---

  function saveCart() {
    localStorage.setItem("toenaCart", JSON.stringify(cart));
  }

  function updateWhatsappState() {
    if (!whatsappCartBtn) return;

    // Purge any corrupted items with 0 or negative quantity
    cart = cart.filter((item) => item.quantity > 0);

    let totalAmount = 0;
    let totalCount = 0;

    cart.forEach((item) => {
      totalAmount += item.price * item.quantity;
      totalCount += item.quantity;
    });

    // Final safety check
    totalCount = Math.max(0, totalCount);

    if (cart.length === 0) {
      whatsappCartBtn.href = `https://wa.me/${phoneNumber}`;
      whatsappCartBtn.innerHTML =
        '<i class="fab fa-whatsapp"></i> WhatsApp ile İletişim Kur';
      whatsappCartBtn.style.background = "";
    } else {
      let message =
        "Merhaba Toena Coffee & Pose, sipariş vermek istiyorum:\n\n";
      cart.forEach((item) => {
        message += `▪ ${item.quantity}x ${item.name} (${(item.price * item.quantity).toFixed(2)} TL)\n`;
      });
      message += `\n*Toplam Tutar: ${totalAmount.toFixed(2)} TL*`;
      whatsappCartBtn.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message,
      )}`;
      whatsappCartBtn.innerHTML = `<i class="fab fa-whatsapp"></i> Siparişi Tamamla (${totalCount})`;
      whatsappCartBtn.style.background =
        "linear-gradient(135deg, #166d82, #072a31)";
    }
  }

  function initializeButtons() {
    document.querySelectorAll(".menu-card").forEach((card) => {
      const name = card.querySelector("h4").innerText.trim();
      const item = cart.find((i) => i.name.trim() === name);
      const actionContainer = card.querySelector(".card-action");
      const priceText = actionContainer.querySelector(".price").innerText;
      const price = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;

      if (item) {
        renderQtyControl(actionContainer, name, price, item.quantity);
      }
    });
    updateWhatsappState();
  }

  function renderQtyControl(container, name, price, quantity) {
    const existingBtn = container.querySelector(".btn-fat-turquoise");
    if (existingBtn) existingBtn.style.display = "none";

    let control = container.querySelector(".qty-control");
    if (!control) {
      control = document.createElement("div");
      control.className = "qty-control";
      container.appendChild(control);
    }

    control.innerHTML = `
      <button class="qty-btn-minus" data-name="${name}" data-price="${price}"><i class="fas fa-minus"></i></button>
      <span>${quantity}</span>
      <button class="qty-btn-plus" data-name="${name}" data-price="${price}"><i class="fas fa-plus"></i></button>
    `;
  }

  // Use Event Delegation for everything to avoid selector issues
  document.addEventListener("click", (e) => {
    // 1. Add Button
    const addBtn = e.target.closest(".btn-fat-turquoise");
    if (addBtn) {
      const card = addBtn.closest(".menu-card");
      const name = card.querySelector("h4").innerText.trim();
      const priceText = card.querySelector(".price").innerText;
      const price = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;

      const item = cart.find((i) => i.name === name);
      if (!item) {
        cart.push({ name, price, quantity: 1 });
      }
      saveCart();
      renderQtyControl(addBtn.parentElement, name, price, 1);
      updateWhatsappState();
      return;
    }

    // 2. Plus Button
    const plusBtn = e.target.closest(".qty-btn-plus");
    if (plusBtn) {
      const name = plusBtn.dataset.name;
      const item = cart.find((i) => i.name === name);
      if (item) {
        item.quantity++;
        plusBtn.parentElement.querySelector("span").innerText = item.quantity;
        saveCart();
        updateWhatsappState();
      }
      return;
    }

    // 3. Minus Button
    const minusBtn = e.target.closest(".qty-btn-minus");
    if (minusBtn) {
      const name = minusBtn.dataset.name;
      const itemIndex = cart.findIndex((i) => i.name === name);
      if (itemIndex !== -1) {
        cart[itemIndex].quantity--;
        const newQty = cart[itemIndex].quantity;

        if (newQty <= 0) {
          cart.splice(itemIndex, 1);
          const container = minusBtn.parentElement.parentElement;
          minusBtn.parentElement.remove();
          const addBtn = container.querySelector(".btn-fat-turquoise");
          if (addBtn) addBtn.style.display = "inline-flex";
        } else {
          minusBtn.parentElement.querySelector("span").innerText = newQty;
        }
        saveCart();
        updateWhatsappState();
      }
      return;
    }
  });
});
