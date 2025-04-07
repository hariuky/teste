describe('Loja - Funções Básicas', () => {
    beforeEach(() => {
      // Configuração básica
      document.body.innerHTML = `
        <div id="product-grid"></div>
        <div id="cart-items"></div>
      `;
      window.cart = [];
      window.productsData = [{
        id: '1',
        name: 'Produto Teste',
        price: 10,
        stock: 5
      }];
    });
  
    it('addToCart - deve adicionar item ao carrinho', () => {
      addToCart('1');
      expect(cart.length).toBe(1);
      expect(cart[0].id).toBe('1');
    });
  
    it('removeFromCart - deve remover item do carrinho', () => {
      cart.push({ id: '1', quantity: 1 });
      removeFromCart('1');
      expect(cart.length).toBe(0);
    });
  });