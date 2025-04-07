const request = require('supertest');
const app = require('../app');

describe('API de Produtos - Testes Básicos', () => {
  it('Deve listar produtos', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('Deve criar e depois deletar um produto', async () => {
    // Cria produto
    const newProduct = {
      name: "Produto Teste Integração",
      price: 15.99,
      stock: 10
    };
    const createRes = await request(app)
      .post('/api/products')
      .send(newProduct);
    
    expect(createRes.statusCode).toEqual(200);
    
    // Deleta produto
    const deleteRes = await request(app)
      .delete(`/api/products/${createRes.body.id}`);
    
    expect(deleteRes.statusCode).toEqual(200);
  });
});