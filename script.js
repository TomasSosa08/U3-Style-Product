
// ELEMENTOS
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const openCartButton = document.getElementById("openCart");
const closeCartButton = document.getElementById("closeCart");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

const cartItemsContainer = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const toast = document.getElementById("toast");
const sizeButtons = document.querySelectorAll(".size-button");
const sizeMessage = document.getElementById("sizeMessage");

// ESTADO
let cart = [];
let selectedSize = null;
let toastTimeout;

// FORMATO DE PRECIOS
function formatPrice(price) {
  return "$" + price.toLocaleString("es-AR");
}

// NOTIFICACIONES
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// MENÚ MOBILE
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");

  menuToggle.textContent = navLinks.classList.contains("open")
    ? "✕"
    : "☰";
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.textContent = "☰";
  });
});

// SELECCIÓN DE TALLE
sizeButtons.forEach(button => {
  button.addEventListener("click", () => {
    sizeButtons.forEach(item => item.classList.remove("selected"));

    button.classList.add("selected");
    selectedSize = button.dataset.size;

    sizeMessage.textContent = "Talle seleccionado: " + selectedSize;
    sizeMessage.style.color = "#75e4a5";
  });
});

// ABRIR Y CERRAR CARRITO
function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  document.body.classList.remove("cart-open");
}

openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
  }
});

// AGREGAR PRODUCTOS
function addToCart(name, price, size = null) {
  const existingItem = cart.find(item =>
    item.name === name && item.size === size
  );

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      name,
      price,
      size,
      quantity: 1
    });
  }

  updateCart();
  showToast(name + " agregado al carrito");
}

// BOTONES AGREGAR
document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    if (name === "Zapatillas Urbanas Nike" && !selectedSize) {
      sizeMessage.textContent = "¡Primero tenés que elegir un talle!";
      sizeMessage.style.color = "#ff795e";
      document.getElementById("sizes").scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      return;
    }

    const size = name === "Zapatillas Urbanas Nike"
      ? selectedSize
      : null;

    addToCart(name, price, size);
  });
});

// ACTUALIZAR CARRITO
function updateCart() {
  const totalProducts = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  cartCount.textContent = totalProducts;
  cartTotal.textContent = formatPrice(totalPrice);

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart">Tu carrito está vacío.</p>';
    return;
  }

  cartItemsContainer.innerHTML = "";

  cart.forEach((item, index) => {
    const product = document.createElement("div");
    product.className = "cart-item";

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const name = document.createElement("strong");
    name.textContent = item.name;

    const details = document.createElement("span");
    details.textContent =
      formatPrice(item.price) +
      (item.size ? " · Talle " + item.size : "");

    info.append(name, details);

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const decrease = document.createElement("button");
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", "Quitar una unidad");

    decrease.addEventListener("click", () => {
      changeQuantity(index, -1);
    });

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const increase = document.createElement("button");
    increase.textContent = "+";
    increase.setAttribute("aria-label", "Agregar una unidad");

    increase.addEventListener("click", () => {
      changeQuantity(index, 1);
    });

    const remove = document.createElement("button");
    remove.textContent = "×";
    remove.className = "remove-item";
    remove.setAttribute("aria-label", "Eliminar producto");

    remove.addEventListener("click", () => {
      removeItem(index);
    });

    actions.append(decrease, quantity, increase, remove);
    product.append(info, actions);

    cartItemsContainer.appendChild(product);
  });
}

// CAMBIAR CANTIDAD
function changeQuantity(index, amount) {
  cart[index].quantity += amount;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  updateCart();
}

// ELIMINAR PRODUCTO
function removeItem(index) {
  const removedName = cart[index].name;

  cart.splice(index, 1);
  updateCart();

  showToast(removedName + " eliminado");
}

// COMPRAR AHORA
document.getElementById("buyNow").addEventListener("click", () => {
  if (!selectedSize) {
    sizeMessage.textContent = "¡Primero tenés que elegir un talle!";
    sizeMessage.style.color = "#ff795e";

    document.getElementById("sizes").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    return;
  }

  addToCart("Zapatillas Urbanas Nike", 135000, selectedSize);
  openCart();
});

// FINALIZAR COMPRA
document.getElementById("checkoutButton").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Tu carrito está vacío");
    return;
  }

  showToast("¡Gracias! Esta es una tienda de demostración.");
});

// ANIMACIONES AL DESPLAZARSE
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12
});

document.querySelectorAll(".reveal").forEach(element => {
  observer.observe(element);
});

// INICIAR
updateCart();
