// Quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", async () => {
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
}

let cart = [];
let productsData = [];

// Carrega os produtos da API
async function loadProducts() {
  try {
    const response = await fetch("http://localhost:5000/api/products");
    if (!response.ok) throw new Error("Erro ao buscar produtos");

    productsData = await response.json(); // Salva os produtos carregados
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
  const product = productsData.find(p => p.id === productId);

  if (!product) {
    console.error("Produto não encontrado para ID:", productId);
    return;
  }

  const cartItem = cart.find(item => item.id === productId);

  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  saveCartToStorage();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToStorage();
  renderCart();
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

  fetch("http://localhost:5000/api/products/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ cart: cart }) // Corrigido para { cart: cart }
  })
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => { throw new Error(text) });
      }
      return res.json();
    })
    .then(data => {
      alert("Pedido finalizado com sucesso!");
      localStorage.removeItem("cart");
      cart = [];
      renderCart();
    })
    .catch(err => {
      console.error("Erro ao finalizar pedido:", err);
      alert("Erro ao finalizar pedido.");
    });
}
