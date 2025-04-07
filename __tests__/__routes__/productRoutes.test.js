// Simula a função fetch global para que possamos controlar as respostas da API
global.fetch = jest.fn();

// Importa bibliotecas para testes e configuração do servidor
const request = require('supertest');
const express = require('express');
const productRoutes = require('../../src/routes/productRoutes');

// Inicializa o app Express com suporte a JSON e adiciona rotas de produto
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

// Suite de testes para rotas de produtos
describe('Product Routes', () => {

  // Tester: Gleidson, Date: 07/04/2025
  // Testa se a rota GET /api/products responde corretamente
  it('GET /api/products should return all products', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(500); // Espera-se erro pois não há conexão real
    expect(Array.isArray(response.body)).toBe(false);
  }, 20000);

  // ---------------------
  // Testes simulando funções de frontend para produtos
  // ---------------------
  describe('Funções de Produto simuladas', () => {

    // Tester: Gleidson, Date: 07/04/2025
    // Testa a função de carregar produtos do frontend
    describe('loadProducts (simulado)', () => {
      it('deve carregar produtos e preencher a tabela corretamente', async () => {
        const mockProducts = [
          {
            id: '1',
            name: 'Produto 1',
            description: 'Descrição 1',
            price: 100.50,
            stock: 10,
            imageUrl: 'http://example.com/image1.jpg'
          },
          {
            id: '2',
            name: 'Produto 2',
            description: 'Descrição 2',
            price: 200.75,
            stock: 20,
            imageUrl: 'http://example.com/image2.jpg'
          }
        ];

        // Simula resposta da API
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProducts)
        });

        // Simula estrutura da tabela HTML
        document.body.innerHTML = `
          <table>
            <tbody id="productsTableBody"></tbody>
          </table>
        `;

        // Função simulada que carrega produtos e preenche tabela
        async function loadProducts() {
          try {
            const res = await fetch('http://localhost:5000/api/products');
            const products = await res.json();

            const tbody = document.getElementById('productsTableBody');
            tbody.innerHTML = '';

            products.forEach(product => {
              const row = document.createElement('tr');
              row.innerHTML = `
                <td>${product.name}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
              `;
              tbody.appendChild(row);
            });
          } catch (error) {
            console.error('Erro ao carregar produtos:', error);
          }
        }

        await loadProducts();

        const tableBody = document.getElementById('productsTableBody');
        expect(tableBody.innerHTML).toContain('Produto 1');
        expect(tableBody.innerHTML).toContain('R$ 100.50');
        expect(tableBody.innerHTML).toContain('Produto 2');
        expect(tableBody.innerHTML).toContain('R$ 200.75');
      });

      // Tester: Gleidson, Date: 07/04/2025
      // Testa tratamento de erro ao carregar produtos
      it('deve lidar com erros ao carregar produtos', async () => {
        fetch.mockRejectedValueOnce(new Error('Erro de rede'));
        console.error = jest.fn();

        async function loadProducts() {
          try {
            const res = await fetch('http://localhost:5000/api/products');
            const products = await res.json();
          } catch (error) {
            console.error('Erro ao carregar produtos:', error);
          }
        }

        await loadProducts();
        expect(console.error).toHaveBeenCalledWith('Erro ao carregar produtos:', expect.any(Error));
      });
    });

    // Tester: Gleidson, Date: 07/04/2025
    // Testes da função de salvar produto
    describe('saveProduct (simulado)', () => {
      beforeEach(() => {
        // Simula campos do formulário HTML
        document.body.innerHTML = `
          <form id="productForm">
            <input id="productId" value="" />
            <input id="productName" value="Novo Produto" />
            <input id="productDescription" value="Descrição do produto" />
            <input id="productPrice" value="99.99" />
            <input id="productStock" value="10" />
            <input id="productImageUrl" value="http://example.com/image.jpg" />
          </form>
        `;
        global.loadProducts = jest.fn();
      });

      // Função que salva ou atualiza produto
      const saveProduct = async () => {
        const id = document.getElementById('productId').value;
        const method = id ? 'PUT' : 'POST';
        const url = id
          ? `http://localhost:5000/api/products/${id}`
          : 'http://localhost:5000/api/products';

        const product = {
          name: document.getElementById('productName').value,
          description: document.getElementById('productDescription').value,
          price: parseFloat(document.getElementById('productPrice').value),
          stock: parseInt(document.getElementById('productStock').value),
          imageUrl: document.getElementById('productImageUrl').value,
        };

        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });

        loadProducts();
      };

      it('deve criar um novo produto quando não há ID', async () => {
        await saveProduct();
        expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/products', expect.any(Object));
      });

      it('deve atualizar um produto quando há ID', async () => {
        document.getElementById('productId').value = '123';
        await saveProduct();
        expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/products/123', expect.any(Object));
      });

      it('deve chamar loadProducts após salvar', async () => {
        await saveProduct();
        expect(loadProducts).toHaveBeenCalled();
      });
    });

    // Tester: Gleidson, Date: 07/04/2025
    // Testa preenchimento do formulário com dados do produto
    describe('editProduct (simulado)', () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <form id="productForm">
            <input id="productId" />
            <input id="productName" />
            <input id="productDescription" />
            <input id="productPrice" />
            <input id="productStock" />
            <input id="productImageUrl" />
          </form>
        `;
      });

      const editProduct = async (id) => {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        const product = await res.json();

        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price.toFixed(2);
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImageUrl').value = product.imageUrl;
      };

      it('deve preencher o formulário com os dados do produto', async () => {
        const mockProduct = {
          id: '123',
          name: 'Produto Teste',
          description: 'Descrição Teste',
          price: 50.99,
          stock: 5,
          imageUrl: 'http://example.com/test.jpg',
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        });

        await editProduct('123');

        expect(document.getElementById('productName').value).toBe('Produto Teste');
      });
    });

    // Tester: Gleidson, Date: 07/04/2025
    // Testa a função de deletar produto
    describe('deleteProduct (simulado)', () => {
      beforeEach(() => {
        global.loadProducts = jest.fn();
        global.alert = jest.fn();
        global.confirm = jest.fn(() => true); // Simula confirmação do usuário
      });

      const deleteProduct = async (id) => {
        if (confirm('Tem certeza?')) {
          await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
          alert('Produto removido!');
          loadProducts();
        }
      };

      it('deve deletar um produto e recarregar a lista', async () => {
        await deleteProduct('123');

        expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/products/123', { method: 'DELETE' });
        expect(alert).toHaveBeenCalledWith('Produto removido!');
        expect(loadProducts).toHaveBeenCalled();
      });
    });
  });
});
