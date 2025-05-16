import { db, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from './firebase-config.js';

document.addEventListener("DOMContentLoaded", () => {
  // Carrega os dados iniciais
  loadProducts();

  // Configura os event listeners
  setupEventListeners();
});

// 🔹 Configura os listeners dos formulários
function setupEventListeners() {
  document.getElementById("productForm").addEventListener("submit", function(e) {
    e.preventDefault();
    saveProduct();
  });
}

// 🔹 Função para resetar o formulário de produtos
function resetProductForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
}

// 🔹 Buscar Produtos
async function loadProducts() {
  try {
    const productsCol = collection(db, "products");
    const productsSnapshot = await getDocs(productsCol);
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const tableBody = document.getElementById("productsTableBody");
    tableBody.innerHTML = "";

    products.forEach(product => {
      const price = typeof product.price === 'number' && !isNaN(product.price) ?
        product.price.toFixed(2) : 'Preço inválido';

      const row = `<tr>
        <td><img src="${product.imageUrl}" width="50"></td>
        <td>${product.name}</td>
        <td>${product.description}</td>
        <td>R$ ${price}</td>
        <td>${product.stock}</td>
        <td>
          <button onclick="editProduct('${product.id}')">Editar</button>
          <button onclick="deleteProduct('${product.id}')">Deletar</button>
        </td>
      </tr>`;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    showNotification("Erro ao carregar produtos: " + error.message, "error");
  }
}

// 🔹 Salvar Produto (novo ou existente)
async function saveProduct() {
  const productId = document.getElementById("productId").value;
  const product = {
    name: document.getElementById("productName").value,
    description: document.getElementById("productDescription").value,
    price: parseFloat(document.getElementById("productPrice").value),
    stock: parseInt(document.getElementById("productStock").value),
    imageUrl: document.getElementById("productImageUrl").value
  };

  try {
    if (productId) {
      // Atualizar produto existente
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, product);
      showNotification("Produto atualizado com sucesso!", "success");
    } else {
      // Criar novo produto
      await addDoc(collection(db, "products"), product);
      showNotification("Produto criado com sucesso!", "success");
    }
    resetProductForm();
    loadProducts();
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    showNotification("Erro ao salvar produto: " + error.message, "error");
  }
}

// 🔹 Editar Produto
async function editProduct(productId) {
  try {
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      throw new Error("Produto não encontrado");
    }
    const product = productSnap.data();

    document.getElementById("productId").value = productId;
    document.getElementById("productName").value = product.name;
    document.getElementById("productDescription").value = product.description;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStock").value = product.stock;
    document.getElementById("productImageUrl").value = product.imageUrl || "";
  } catch (error) {
    console.error("Erro ao carregar produto para edição:", error);
    showNotification("Erro ao carregar produto: " + error.message, "error");
  }
}

// 🔹 Remover Produto
async function deleteProduct(productId) {
  if (!confirm("Tem certeza que deseja remover este produto permanentemente?")) {
    return;
  }

  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
    showNotification("Produto removido com sucesso!", "success");
    loadProducts();
  } catch (error) {
    console.error("Erro ao remover produto:", error);
    showNotification("Erro ao remover produto: " + error.message, "error");
  }
}

// 🔹 Mostrar notificação
function showNotification(message, type) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Exponha as funções para uso no HTML
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
