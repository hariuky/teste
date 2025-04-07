const request = require('supertest');
const app = require('express')();
const productRoutes = require('backend/src/routes/productRoutes.js');

// Mock básico do Firebase
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  firestore: () => ({
    collection: jest.fn(() => ({
      get: jest.fn(),
      doc: jest.fn(() => ({
        get: jest.fn(),
        delete: jest.fn(),
        update: jest.fn()
      })),
      add: jest.fn()
    }))
  })
}));

app.use('/products', productRoutes);

describe('Product Routes - Testes Básicos', () => {
  it('GET /products - deve retornar lista de produtos', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /products - deve criar novo produto', async () => {
    const newProduct = {
      name: "Produto Teste",
      price: 10.99,
      stock: 5
    };
    const response = await request(app)
      .post('/products')
      .send(newProduct);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(newProduct);
  });
});