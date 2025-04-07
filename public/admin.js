document.addEventListener("DOMContentLoaded", () => {
    // Carrega os dados iniciais
    loadProducts();
    loadUsers();
  
    // Configura os event listeners
    setupEventListeners();
});

function showTab(tabId) {
    // Esconde todas as tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active de todos os botões
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Mostra a tab selecionada
    document.getElementById(tabId).classList.add('active');
    
    // Ativa o botão correspondente
    event.currentTarget.classList.add('active');
}

// 🔹 Configura os listeners dos formulários
function setupEventListeners() {
    document.getElementById("productForm").addEventListener("submit", function(e) {
        e.preventDefault();
        saveProduct();
    });
    
    // Adicione também para o formulário de usuários se necessário
    document.getElementById("userForm").addEventListener("submit", function(e) {
        e.preventDefault();
        saveUser();
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
        alert("Produto salvo com sucesso!");
        document.getElementById("productForm").reset();
        document.getElementById("productId").value = "";
        loadProducts(); // Agora esta função está definida no mesmo escopo
      })
      .catch(error => console.error("Erro ao salvar produto:", error));
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
      .catch(error => console.error("Erro ao carregar produto para edição:", error));
  }
  
  
  // 🔹 Remover Produto
  function deleteProduct(productId) {
    fetch(`http://localhost:5000/api/products/${productId}`, { method: "DELETE" })
      .then(() => {
        alert("Produto removido!");
        loadProducts();
      })
      .catch(error => console.error("Erro ao remover produto:", error));
  }
  
 // 🔹 Buscar Usuários
 // admin.js
// admin.js
async function loadUsers() {
  const loadingElement = document.getElementById('loading-users');
  const errorElement = document.getElementById('users-error');
  const tableBody = document.getElementById("usersTableBody");
  
  try {
    // Mostra estado de carregamento
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    tableBody.innerHTML = '';

    const response = await fetch("http://localhost:5000/api/users");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro desconhecido ao carregar usuários");
    }

    if (!Array.isArray(data)) {
      console.error("Dados inválidos recebidos:", data);
      throw new Error("Formato de dados inválido da API");
    }

    // Atualiza a tabela
    tableBody.innerHTML = data.length > 0
      ? data.map(user => `
          <tr>
            <td>${user.id}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.position}</td>
            <td>
              <button onclick="deleteUser('${user.id}')">Excluir</button>
            </td>
          </tr>
        `).join('')
      : '<tr><td colspan="6">Nenhum usuário cadastrado</td></tr>';

  } catch (error) {
    console.error("Erro completo:", error);
    errorElement.textContent = `Falha ao carregar usuários: ${error.message}`;
    errorElement.style.display = 'block';
    tableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar dados</td></tr>';
  } finally {
    loadingElement.style.display = 'none';
  }
}

// 🔹 Salvar Usuário (novo ou existente)
async function saveUser() {
  const form = document.getElementById("userForm");
  const saveButton = form.querySelector("button[type='submit']");
  const originalButtonText = saveButton.textContent;
  const notification = document.getElementById("notification");

  try {
    // Mostra estado de carregamento
    saveButton.disabled = true;
    saveButton.textContent = "Salvando...";
    notification.style.display = "block";
    notification.textContent = "";
    notification.className = "notification";

    const userId = document.getElementById("userId").value;
    const userData = {
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("userEmail").value.trim().toLowerCase(),
      phone: document.getElementById("userPhone").value.trim(),
      position: document.getElementById("userPosition").value.trim()
    };

    // Validação no frontend
    if (userData.fullName.length < 3) {
      throw new Error("O nome deve ter pelo menos 3 caracteres");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      throw new Error("Por favor, insira um email válido");
    }

    if (userData.position.length < 2) {
      throw new Error("O cargo deve ter pelo menos 2 caracteres");
    }

    const url = userId 
      ? `http://localhost:5000/api/users/${userId}`
      : "http://localhost:5000/api/users";
    
    const method = userId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || "Erro desconhecido");
    }

    // Feedback visual de sucesso
    saveButton.textContent = "Sucesso!";
    notification.textContent = userId 
      ? "Usuário atualizado com sucesso!" 
      : "Usuário criado com sucesso!";
    notification.className = "notification success";

    // Atualiza a lista e reseta o formulário
    resetUserForm();
    await loadUsers();

  } catch (error) {
    console.error("ERRO COMPLETO:", error);
    
    // Feedback visual de erro
    saveButton.textContent = "Erro!";
    notification.textContent = error.message;
    notification.className = "notification error";
    
  } finally {
    setTimeout(() => {
      saveButton.disabled = false;
      saveButton.textContent = originalButtonText;
      setTimeout(() => {
        notification.style.display = "none";
      }, 3000);
    }, 2000);
  }
}

// 🔹 Remover Usuário
async function deleteUser(userId) {
  if (!confirm("Tem certeza que deseja remover este usuário permanentemente?")) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, { 
      method: "DELETE" 
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Erro ao excluir usuário");
    }

    alert(result.message || "Usuário removido com sucesso!");
    loadUsers();
    
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    alert(`Erro: ${error.message}`);
  }
}

// 🔹 Função para resetar o formulário de usuários
function resetUserForm() {
  document.getElementById("userForm").reset();
  document.getElementById("userId").value = "";
}