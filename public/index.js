import { auth, db, collection, getDocs } from './firebase-config.js';
import {
  doc,
  getDoc,
  writeBatch,
  addDoc,
  collection as firestoreCollection
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

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

// Quando o DOM estiver carregado
window.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  loadCartFromStorage();
  setupEventListeners();
});

// Configura todos os event listeners
function setupEventListeners() {
  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "/login.html";
      });
    });
  }

  
  // Formulário de feedback
  const feedbackForm = document.getElementById("feedback-form");

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const feedbackName = document.getElementById("feedback-name").value.trim();
      const feedbackText = document.getElementById("feedback-text").value.trim();

      if (!feedbackName || !feedbackText) {
        alert("Por favor, preencha todos os campos antes de enviar.");
        return;
      }

      try {
        await addDoc(firestoreCollection(db, "feedback"), {
          userId: currentUser ? currentUser.uid : null,
          nome: feedbackName,
          texto: feedbackText,
          criadoEm: new Date()
        });

        alert("Feedback enviado com sucesso!");
        document.getElementById("feedback-modal").style.display = "none";
        feedbackForm.reset();
      } catch (error) {
        console.error("Erro ao enviar feedback:", error);
        alert("Erro ao enviar feedback. Tente novamente.");
      }
    });
  }

  // Modal de Feedback
  const feedbackBtn = document.getElementById("feedback-btn");
  const feedbackModal = document.getElementById("feedback-modal");
  const closeFeedback = document.getElementById("close-feedback");

  if (feedbackBtn && feedbackModal && closeFeedback) {
    feedbackBtn.addEventListener("click", () => {
      feedbackModal.style.display = "block";
    });

    closeFeedback.addEventListener("click", () => {
      feedbackModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target === feedbackModal) {
        feedbackModal.style.display = "none";
      }
    });
  }

  // Botões do carrinho
  const toggleCartBtn = document.getElementById("toggle-cart-btn");
  const closeCartBtn = document.getElementById("close-cart-btn");

  toggleCartBtn?.addEventListener("click", () => {
    document.getElementById("cart-container")?.classList.add("open");
    toggleCartBtn.style.display = "none";
  });

  closeCartBtn?.addEventListener("click", () => {
    document.getElementById("cart-container")?.classList.remove("open");
    toggleCartBtn.style.display = "block";
  });

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", finalizePurchase);
  }

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
}

// Carrega os produtos direto do Firestore
async function loadProducts() {
  try {
    const productsCol = collection(db, "products");
    const snapshot = await getDocs(productsCol);

    productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

function showNotification(message, type = 'success') {
  let notification = document.getElementById('cart-notification');

  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'cart-notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }

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

async function finalizePurchase() {
  if (cart.length === 0) {
    alert("Carrinho vazio");
    return;
  }

  try {
    const batch = writeBatch(db);

    for (const item of cart) {
      const productRef = doc(db, 'products', item.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        alert(`Produto com ID ${item.id} não encontrado`);
        return;
      }

      const productData = productSnap.data();

      if (productData.stock < item.quantity) {
        alert(`Estoque insuficiente para ${productData.name}`);
        return;
      }

      batch.update(productRef, { stock: productData.stock - item.quantity });
    }

    await batch.commit();

    showNotification("Compra finalizada com sucesso!", 'success');
    localStorage.removeItem("cart");
    cart = [];
    renderCart();

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error("Erro ao finalizar compra:", error);
    showNotification("Erro ao finalizar compra.", 'error');
  }
}

window.removeFromCart = removeFromCart;
