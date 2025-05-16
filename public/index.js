import { auth } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Define a base da API conforme ambiente
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://teste-blush-three.vercel.app/";  // Substitua pela URL real da sua API em produção

let currentUser = null;
let cart = [];
let productsData = [];

// Detecta usuário logado
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  const loginLink = document.getElementById("login-link");
  const logoutBtn = document.getElementById("logout-btn");

  if (loginLink && logoutBtn) {
    loginLink.style.display = user ? "none" : "inline";
    logoutBtn.style.display = user ? "inline" : "none";
  }
});

// Logout
window.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "/login.html";
      });
    });
  }
});

// Quando o DOM estiver carregado
window.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  loadCartFromStorage();
  setupEventListeners();
});

// Configura todos os event listeners
function setupEventListeners() {
  const productGrid = document.getElementById("product-grid");
  if (productGrid) {
    productGrid.addEventListener('click', function(e) {
      const button = e.target.closest('.add-to-cart-btn');
      const card = e.target.closest('.product-card');
      if (!button || !card) return;

      const productId = card.dataset.id;
      if (!productId) {
        console.error("ID do produto inválido:", card.dataset.id);
        return;
      }

      addToCart(productId);
    });
  }

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", finalizePurchase);
  }

  document.getElementById("toggle-cart-btn")?.addEventListener("click", () => {
    document.getElementById("cart-container")?.classList.add("open");
    document.getElementById("toggle-cart-btn").style.display = "none";
  });

  document.getElementById("close-cart-btn")?.addEventListener("click", () => {
    document.getElementById("cart-container")?.classList.remove("open");
    document.getElementById("toggle-cart-btn").style.display = "block";
  });
}

// Carrega os produtos da API
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) throw new Error("Erro ao buscar produtos");

    productsData = await response.json();
    renderProducts(productsData);
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    document.getElementById("product-grid").innerHTML =
      '<p>Não foi possível carregar os produtos. Tente novamente mais tarde.</p>';
  }
}

// Renderiza os produtos na tela
function renderProducts(products) {
  const productContainer = document.getElementById("product-grid");

  productContainer.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.imageUrl}" alt="${product.name}"
           onerror="this.onerror=null;this.src='https://placehold.co/300x400?text=Imagem+não+disponível'">
      <h3>${product.name}</h3>
      <p>${product.description || 'Sem descrição'}</p>
      <p class="price">R$ ${product.price.toFixed(2)}</p>
      <p class="stock ${product.stock <= 0 ? 'out-of-stock' : ''}">
        Estoque: ${product.stock <= 0 ? 'Esgotado' : product.stock + ' disponíveis'}
      </p>
      <button class="add-to-cart-btn" ${product.stock <= 0 ? 'disabled' : ''}>
        ${product.stock <= 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
      </button>
    </div>
  `).join('');
}

function addToCart(productId) {
  if (!currentUser) {
    alert("Você precisa estar logado para adicionar produtos ao carrinho.");
    window.location.href = "/login.html";
    return;
  }

  const product = productsData.find(p => p.id === productId);
  if (!product) {
    console.error("Produto não encontrado para ID:", productId);
    return;
  }

  const cartItem = cart.find(item => item.id === productId);

  if (cartItem) {
    if (cartItem.quantity < product.stock) {
      cartItem.quantity++;
      showNotification(`${product.name} adicionado novamente!`);
    } else {
      alert("Você já adicionou todas as unidades disponíveis no estoque.");
      return;
    }
  } else {
    if (product.stock > 0) {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
      showNotification(`${product.name} adicionado ao carrinho!`);
    } else {
      alert("Produto esgotado.");
      return;
    }
  }

  saveCartToStorage();
  renderCart();
}

function removeFromCart(productId) {
  const product = cart.find(item => item.id === productId);
  if (product) {
    showNotification(`${product.name} removido do carrinho!`, 'error');
  }
  
  cart = cart.filter(item => item.id !== productId);
  saveCartToStorage();
  renderCart();
}

// Função para mostrar notificação
function showNotification(message, type = 'success') {
  let notification = document.getElementById('cart-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'cart-notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }

  // Altera a cor baseada no tipo
  notification.style.backgroundColor = type === 'error' ? '#f44336' : '#4CAF50';

  notification.innerHTML = `
    <span class="notification-icon">${type === 'error' ? '❌' : '🛒'}</span>
    <span>${message}</span>
  `;

  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function renderCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span>${item.name} x${item.quantity}</span>
      <span>R$ ${(item.price * item.quantity).toFixed(2)}</span>
      <button onclick="removeFromCart('${item.id}')">Remover</button>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalElement.textContent = total.toFixed(2);
}

function saveCartToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCartFromStorage() {
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
    renderCart();
  }
}

function finalizePurchase() {
  if (cart.length === 0) {
    alert("Carrinho vazio");
    return;
  }

  fetch(`${API_BASE_URL}/api/products/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ cart: cart })
  })
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => { throw new Error(text) });
      }
      return res.json();
    })
    .then(data => {
      showNotification("Pedido finalizado com sucesso!", 'success');
      localStorage.removeItem("cart");
      cart = [];
      renderCart();
      setTimeout(() => {
        window.location.reload();
      }, 850);
    })
    .catch(err => {
      console.error("Erro ao finalizar pedido:", err);
      showNotification("Erro ao finalizar pedido.", 'error');
    });
}

// Adiciona as funções ao escopo global para que possam ser chamadas do HTML
window.removeFromCart = removeFromCart;
