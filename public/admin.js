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
function loadProducts() {
    fetch("http://localhost:5000/api/products")
        .then(response => response.json())
        .then(products => {
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
        })
        .catch(error => console.error("Erro ao carregar produtos:", error));
}
  
// 🔹 Salvar Produto (novo ou existente)
function saveProduct() {
    const productId = document.getElementById("productId").value;
    const product = {
        name: document.getElementById("productName").value,
        description: document.getElementById("productDescription").value,
        price: parseFloat(document.getElementById("productPrice").value),
        stock: parseInt(document.getElementById("productStock").value),
        imageUrl: document.getElementById("productImageUrl").value
    };
  
    const method = productId ? "PUT" : "POST";
    const url = productId 
        ? `http://localhost:5000/api/products/${productId}`
        : "http://localhost:5000/api/products";
  
    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(product)
    })
        .then(response => response.json())
        .then(() => {
            showNotification("Produto salvo com sucesso!", "success");
            document.getElementById("productForm").reset();
            document.getElementById("productId").value = "";
            loadProducts();
        })
        .catch(error => {
            console.error("Erro ao salvar produto:", error);
            showNotification("Erro ao salvar produto: " + error.message, "error");
        });
}
  
// 🔹 Editar Produto
function editProduct(productId) {
    fetch(`http://localhost:5000/api/products/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Produto não encontrado");
            }
            return response.json();
        })
        .then(product => {
            document.getElementById("productId").value = product.id || product._id;
            document.getElementById("productName").value = product.name;
            document.getElementById("productDescription").value = product.description;
            document.getElementById("productPrice").value = product.price;
            document.getElementById("productStock").value = product.stock;
            document.getElementById("productImageUrl").value = product.imageUrl || "";
        })
        .catch(error => {
            console.error("Erro ao carregar produto para edição:", error);
            showNotification("Erro ao carregar produto: " + error.message, "error");
        });
}
  
// 🔹 Remover Produto
function deleteProduct(productId) {
    if (!confirm("Tem certeza que deseja remover este produto permanentemente?")) {
        return;
    }

    fetch(`http://localhost:5000/api/products/${productId}`, { method: "DELETE" })
        .then(() => {
            showNotification("Produto removido com sucesso!", "success");
            loadProducts();
        })
        .catch(error => {
            console.error("Erro ao remover produto:", error);
            showNotification("Erro ao remover produto: " + error.message, "error");
        });
}
//
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