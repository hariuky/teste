const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const serviceAccount = require("../config/firebaseConfig.json");

// Inicializa o Firebase Admin apenas uma vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Listar produtos
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// Buscar produto por ID
router.get("/:id", async (req, res) => {
  try {
    const doc = await db.collection("products").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
});

// Adicionar produto
router.post("/", async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl } = req.body;
    const newProduct = { name, description, price, stock, imageUrl };
    const addedProduct = await db.collection("products").add(newProduct);
    res.json({ id: addedProduct.id, ...newProduct });
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar produto" });
  }
});

// Remover produto
router.delete("/:id", async (req, res) => {
  try {
    await db.collection("products").doc(req.params.id).delete();
    res.json({ message: "Produto removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover produto" });
  }
});

// Atualizar produto
router.put("/:id", async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl } = req.body;
    await db.collection("products").doc(req.params.id).update({
      name, description, price, stock, imageUrl
    });
    res.json({ message: "Produto atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
});

// Finalizar compra
router.post("/checkout", async (req, res) => {
  try {
    const cart = req.body.cart;
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Carrinho inválido ou vazio" });
    }

    const batch = db.batch();

    for (const item of cart) {
      const productRef = db.collection("products").doc(item.id);
      const productSnap = await productRef.get();

      if (!productSnap.exists) {
        return res.status(404).json({ error: `Produto com ID ${item.id} não encontrado` });
      }

      const product = productSnap.data();

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Estoque insuficiente para ${product.name}` });
      }

      batch.update(productRef, { stock: product.stock - item.quantity });
    }

    await batch.commit();

    res.json({ message: "Compra finalizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao finalizar compra:", error);
    res.status(500).json({ error: "Erro ao finalizar compra" });
  }
});

module.exports = router;
