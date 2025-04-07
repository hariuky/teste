const request = require('supertest');
const app = require('express')();
const userRoutes = require('../routes/userRoutes');

app.use('/users', userRoutes);

describe('User Routes - Testes Básicos', () => {
  it('GET /users - deve retornar lista de usuários', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /users - deve criar novo usuário com dados válidos', async () => {
    const newUser = {
      fullName: "Usuário Teste",
      email: "teste@example.com",
      position: "Tester"
    };
    const response = await request(app)
      .post('/users')
      .send(newUser);
    expect(response.status).toBe(201);
    expect(response.body.email).toBe(newUser.email);
  });
});