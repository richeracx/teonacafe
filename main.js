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
  const phoneNumber = "905513528130";
  let cart = JSON.parse(localStorage.getItem("vitaCart")) || [];

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
      header.style.boxShadow = "0 10px 30px rgba(43, 88, 37, 0.1)";
    } else {
      header.style.boxShadow = "none";
    }
  });

  // --- Logic ---

  // 1. Initialize Buttons based on current Cart
  function initializeButtons() {
    const productTitles = document.querySelectorAll(".menu-card h4");
    productTitles.forEach((title) => {
      const name = title.innerText;
      const cardAction = title
        .closest(".menu-card")
        .querySelector(".card-action");
      // Check if item is in cart
      const item = cart.find((i) => i.name === name);
      if (item) {
        // If in cart, render Quantity Control
        renderQtyControl(cardAction, name, item.price, item.quantity);
      }
    });
  }

  // 2. Global Add To Cart (triggered by the static EKLE button)
  window.addToCart = (name, price) => {
    const item = cart.find((i) => i.name === name);
    if (!item) {
      cart.push({ name, price, quantity: 1 });
    } else {
      item.quantity += 1;
    }
    saveCart();
    updateWhatsappState();

    // Switch button to quantity control
    const btn = event.currentTarget; // The clicked button
    const parent = btn.parentElement;
    renderQtyControl(parent, name, price, 1);
  };

  // 3. Render Quantity Control
  function renderQtyControl(container, name, price, quantity) {
    // Clear existing button or control
    const existingBtn = container.querySelector(".btn-fat-turquoise");
    if (existingBtn) existingBtn.style.display = "none";

    // Check if control already exists
    let control = container.querySelector(".qty-control");

    if (!control) {
      control = document.createElement("div");
      control.className = "qty-control";
      container.appendChild(control);
    }

    control.innerHTML = `
            <button onclick="updateItemQty('${name}', ${price}, -1)"><i class="fas fa-minus" style="font-size:0.8rem"></i></button>
            <span>${quantity}</span>
            <button onclick="updateItemQty('${name}', ${price}, 1)"><i class="fas fa-plus" style="font-size:0.8rem"></i></button>
        `;
  }

  // 4. Update Quantity (triggered by +/-)
  window.updateItemQty = (name, price, change) => {
    const itemIndex = cart.findIndex((i) => i.name === name);
    if (itemIndex === -1) return;

    cart[itemIndex].quantity += change;

    const card = findCardByName(name);
    if (!card) return; // Should not happen

    const container = card.querySelector(".card-action");

    if (cart[itemIndex].quantity <= 0) {
      // Remove item
      cart.splice(itemIndex, 1);
      // Revert UI to 'EKLE' button
      const control = container.querySelector(".qty-control");
      if (control) control.remove();

      const btn = container.querySelector(".btn-fat-turquoise");
      if (btn) btn.style.display = "inline-flex";
    } else {
      // Update UI Number
      const control = container.querySelector(".qty-control");
      if (control) {
        control.querySelector("span").innerText = cart[itemIndex].quantity;
      }
    }

    saveCart();
    updateWhatsappState();
  };

  function findCardByName(name) {
    // Helper to find DOM element
    const titles = document.querySelectorAll(".menu-card h4");
    for (let t of titles) {
      if (t.innerText === name) return t.closest(".menu-card");
    }
    return null;
  }

  function saveCart() {
    localStorage.setItem("vitaCart", JSON.stringify(cart));
  }

  function updateWhatsappState() {
    if (!whatsappCartBtn) return;

    let totalAmount = 0;
    let totalCount = 0;

    cart.forEach((item) => {
      totalAmount += item.price * item.quantity;
      totalCount += item.quantity;
    });

    if (cart.length === 0) {
      whatsappCartBtn.href = `https://wa.me/${phoneNumber}`;
      whatsappCartBtn.innerHTML =
        '<i class="fab fa-whatsapp"></i> WhatsApp ile Sipariş Ver';
      whatsappCartBtn.style.background = "";
    } else {
      let message = "Merhaba Vita House Cafe, sipariş vermek istiyorum:\n\n";
      cart.forEach((item) => {
        message += `▪ ${item.quantity}x ${item.name} (${(item.price * item.quantity).toFixed(2)} TL)\n`;
      });
      message += `\n*Toplam Tutar: ${totalAmount.toFixed(2)} TL*`;

      const encodedMessage = encodeURIComponent(message);
      whatsappCartBtn.href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      whatsappCartBtn.innerHTML = `<i class="fab fa-whatsapp"></i> Siparişi Tamamla (${totalCount})`;
      whatsappCartBtn.style.background =
        "linear-gradient(135deg, #25D366, #128C7E)";
    }
  }
});
