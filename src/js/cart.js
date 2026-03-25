import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

function consolidateCart(cartItems) {
  const map = new Map();
  cartItems.forEach((item) => {
    if (map.has(item.Id)) {
      const existing = map.get(item.Id);
      existing.Quantity = (existing.Quantity || 1) + (item.Quantity || 1);
    } else {
      if (!item.Quantity) item.Quantity = 1;
      map.set(item.Id, item);
    }
  });
  return Array.from(map.values());
}

function renderCartContents() {
  let cartItems = getLocalStorage("so-cart");
  if (!Array.isArray(cartItems)) cartItems = [];
  cartItems = cartItems.filter(
    (item) => item && item.Id && item.Images && item.Colors && item.Colors.length
  );
  cartItems = consolidateCart(cartItems);
  setLocalStorage("so-cart", cartItems);
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");

  document.querySelectorAll(".cart-card__remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      removeFromCart(id);
    });
  });

  document.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      const delta = parseInt(e.currentTarget.dataset.delta);
      updateQuantity(id, delta);
    });
  });

  const total = cartItems.reduce((sum, item) => sum + item.FinalPrice * (item.Quantity || 1), 0);
  const totalElement = document.querySelector("#cart-total");
  if (totalElement) {
    totalElement.textContent = `$${total.toFixed(2)}`;
  }

  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.style.display = cartItems.length === 0 ? "none" : "inline-block";
  }
}

function updateQuantity(id, delta) {
  let cartItems = getLocalStorage("so-cart") || [];
  const item = cartItems.find((item) => item.Id === id);
  if (item) {
    item.Quantity = (item.Quantity || 1) + delta;
    if (item.Quantity <= 0) {
      cartItems = cartItems.filter((i) => i.Id !== id);
    }
  }
  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

function removeFromCart(id) {
  let cartItems = getLocalStorage("so-cart") || [];
  cartItems = cartItems.filter((item) => item.Id !== id);
  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

function cartItemTemplate(item) {
  const qty = item.Quantity || 1;
  return `<li class="cart-card divider">
  <span class="cart-card__remove" data-id="${item.Id}">X</span>
  <a href="#" class="cart-card__image">
    <img
      src="${item.Images.PrimaryMedium}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <div class="cart-card__quantity">
    <button class="qty-btn" data-id="${item.Id}" data-delta="-1" aria-label="Decrease quantity">−</button>
    <span>${qty}</span>
    <button class="qty-btn" data-id="${item.Id}" data-delta="1" aria-label="Increase quantity">+</button>
  </div>
  <p class="cart-card__price">$${(item.FinalPrice * qty).toFixed(2)}</p>
</li>`;
}

renderCartContents();
