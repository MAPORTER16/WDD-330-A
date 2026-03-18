import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

function renderCartContents() {
  let cartItems = getLocalStorage("so-cart");
  if (!Array.isArray(cartItems)) cartItems = [];
  const htmlItems = cartItems.map((item) => cartItemTemplate(item));
  document.querySelector(".product-list").innerHTML = htmlItems.join("");

  document.querySelectorAll(".cart-card__remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      removeFromCart(id);
    });
  });
}

function removeFromCart(id) {
  let cartItems = getLocalStorage("so-cart") || [];
  // Remove only the first matching item (in case of duplicates)
  const index = cartItems.findIndex((item) => item.Id === id);
  if (index !== -1) {
    cartItems.splice(index, 1);
  }
  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

function cartItemTemplate(item) {
  const newItem = `<li class="cart-card divider">
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
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;

  return newItem;
}

renderCartContents();
