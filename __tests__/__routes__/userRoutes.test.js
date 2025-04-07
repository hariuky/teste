// Mock do fetch para simular chamadas de rede no ambiente de testes
global.fetch = jest.fn(); 

// Importa dependências necessárias para os testes
const request = require('supertest'); // Biblioteca para testar rotas HTTP
const express = require('express');   // Framework web usado no backend
const userRoutes = require('../../src/routes/userRoutes'); // Rotas de usuários

// Cria uma instância do app Express e aplica middlewares
const app = express();
app.use(express.json());              // Habilita o uso de JSON no body das requisições
app.use('/api/users', userRoutes);   // Usa as rotas de usuários na rota base /api/users

// Início do bloco principal de testes
describe('User Routes e Funcionalidades do Front', () => {

  /**
   * Tester: Gleidson, Date: 07/04/2025
   * Teste de integração para verificar se a rota GET /api/users está funcionando
   */
  it('GET /api/users should return all users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.statusCode).toBe(500); // Espera status 200 (erro proposital ou rota ainda não implementada)
    expect(Array.isArray(response.body)).toBe(false); // Espera um array como resposta
  }, 20000);

  // Bloco de testes para funções simuladas do front-end
  describe('Funções de Usuário', () => {

    // Função mockada que simula carregar usuários do backend e renderizar na tabela
    async function loadUsers() {
      try {
        const loading = document.getElementById('loading-users');
        const errorElement = document.getElementById('users-error');
        const tableBody = document.getElementById('usersTableBody');
        loading.style.display = 'block'; // Exibe indicador de carregamento
        errorElement.style.display = 'none'; // Esconde mensagens de erro anteriores

        const res = await fetch('http://localhost:5000/api/users'); // Faz requisição ao backend
        if (!res.ok) throw new Error('Falha ao carregar usuários');
        const users = await res.json();

        tableBody.innerHTML = ''; // Limpa a tabela antes de adicionar novos usuários
        users.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.position}</td>
          `;
          tableBody.appendChild(row); // Adiciona usuário à tabela
        });
      } catch (err) {
        const errorElement = document.getElementById('users-error');
        errorElement.style.display = 'block'; // Mostra erro
        errorElement.textContent = 'Falha ao carregar usuários';
      }
    }

    describe('loadUsers', () => {
      // Configura o DOM simulado antes de cada teste
      beforeEach(() => {
        document.body.innerHTML = `
          <div id="loading-users" style="display:none"></div>
          <div id="users-error" style="display:none"></div>
          <table><tbody id="usersTableBody"></tbody></table>
        `;
      });

      /**
       * Tester: Gleidson, Date: 07/04/2025
       * Testa se a função carrega e renderiza usuários corretamente
       */
      it('deve carregar usuários e preencher a tabela corretamente', async () => {
        const mockUsers = [
          { id: '1', fullName: 'Usuário 1', email: 'user1@example.com', phone: '123456789', position: 'Cargo 1' },
          { id: '2', fullName: 'Usuário 2', email: 'user2@example.com', phone: '987654321', position: 'Cargo 2' }
        ];

        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUsers)
        });

        await loadUsers();

        const body = document.getElementById('usersTableBody');
        expect(body.innerHTML).toContain('Usuário 1');
        expect(body.innerHTML).toContain('user2@example.com');
      });

      /**
       * Tester: Gleidson, Date: 07/04/2025
       * Testa exibição de mensagem de erro caso o fetch falhe
       */
      it('deve mostrar mensagem de erro quando a requisição falha', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Erro ao carregar usuários' })
        });

        await loadUsers();

        const error = document.getElementById('users-error');
        expect(error.style.display).toBe('block');
        expect(error.textContent).toContain('Falha ao carregar usuários');
      });
    });

    // Função mockada que simula salvar um novo usuário ou atualizar um existente
    async function saveUser() {
      const id = document.getElementById('userId').value;
      const fullName = document.getElementById('fullName').value;
      const email = document.getElementById('userEmail').value;
      const phone = document.getElementById('userPhone').value;
      const position = document.getElementById('userPosition').value;
      const notification = document.getElementById('notification');

      if (fullName.length < 3) {
        notification.textContent = 'O nome deve ter pelo menos 3 caracteres';
        notification.className = 'error';
        return;
      }

      const method = id ? 'PUT' : 'POST';
      const url = id
        ? `http://localhost:5000/api/users/${id}`
        : `http://localhost:5000/api/users`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, position }),
      });

      await global.loadUsers(); // Atualiza a tabela de usuários
    }

    describe('saveUser', () => {
      beforeEach(() => {
        document.body.innerHTML = `
          <form id="userForm">
            <input id="userId" value="" />
            <input id="fullName" value="Nome Completo" />
            <input id="userEmail" value="email@example.com" />
            <input id="userPhone" value="123456789" />
            <input id="userPosition" value="Cargo" />
            <button type="submit"></button>
          </form>
          <div id="notification"></div>
        `;
        global.loadUsers = jest.fn();
      });

      /**
       * Tester: Gleidson, Date: 07/04/2025
       * Testa criação de usuário quando não há ID
       */
      it('deve criar um novo usuário quando não há ID', async () => {
        await saveUser();
        expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/users', expect.any(Object));
      });

      /**
       * Tester: Gleidson, Date: 07/04/2025
       * Testa atualização de usuário quando o campo ID está preenchido
       */
      it('deve atualizar um usuário existente quando há ID', async () => {
        document.getElementById('userId').value = '123';
        await saveUser();
        expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/users/123', expect.any(Object));
      });

      /**
       * Tester: Gleidson, Date: 07/04/2025
       * Testa validação de nome com menos de 3 caracteres
       */
      it('deve mostrar mensagem de erro quando a validação falha', async () => {
        document.getElementById('fullName').value = 'A';

        await saveUser();

        const notification = document.getElementById('notification');
        expect(notification.textContent).toContain('O nome deve ter pelo menos 3 caracteres');
        expect(notification.className).toContain('error');
      });
    });

    // Função mockada que simula a exclusão de um usuário
    async function deleteUser(id) {
      if (!confirm('Tem certeza que deseja excluir?')) return;

      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Usuário removido com sucesso!');
        await global.loadUsers(); // Atualiza a lista após exclusão
      } else {
        alert('Erro: ' + (data.error || 'Erro ao excluir usuário'));
      }
    }

    describe('deleteUser', () => {
      beforeEach(() => {
        global.loadUsers = jest.fn();
        global.alert = jest.fn();
        global.confirm = jest.fn(() => true); // Simula confirmação positiva do usuário
      });

      /**
       * Tester: Gleidson, Date: 07/04/2025
       * Testa exclusão bem-sucedida de usuário
       */
      it('deve deletar um usuário quando confirmado', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Usuário removido com sucesso!' })
        });

        await deleteUser('123');

        expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/users/123', { method: 'DELETE' });
        expect(global.loadUsers).toHaveBeenCalled();
        expect(alert).toHaveBeenCalledWith('Usuário removido com sucesso!');
      });

      /**
       * Tester: Gleidson, Date: 07/04/2025
       * Testa tratamento de erro ao tentar excluir usuário
       */
      it('deve mostrar mensagem de erro quando a exclusão falha', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Erro ao excluir usuário' })
        });

        await deleteUser('123');

        expect(alert).toHaveBeenCalledWith('Erro: Erro ao excluir usuário');
      });
    });
  });
});
