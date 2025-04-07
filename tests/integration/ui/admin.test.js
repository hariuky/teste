describe('Admin - Funções Básicas', () => {
    beforeEach(() => {
      // Mock simples do fetch
      global.fetch = jest.fn(() => 
        Promise.resolve({
          json: () => Promise.resolve([])
        })
      );
      
      // Mock básico do DOM
      document.body.innerHTML = `
        <div id="productsTableBody"></div>
        <form id="productForm"></form>
      `;
    });
  
    it('loadProducts - deve carregar produtos', async () => {
      await loadProducts();
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/products');
    });
  
    it('saveProduct - deve enviar dados do formulário', async () => {
      document.getElementById('productForm').innerHTML = `
        <input id="productName" value="Teste">
        <input id="productPrice" value="10">
        <input id="productStock" value="5">
      `;
      
      await saveProduct();
      expect(fetch).toHaveBeenCalled();
    });
  });