const { db } = require("../config/firebase");

const getProducts = async (req, res) => {
  try {
    const productsSnapshot = await db.collection("products").get();
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl } = req.body;
    const newProduct = { name, description, price, stock, imageUrl };
    const docRef = await db.collection("products").add(newProduct);
    res.json({ id: docRef.id, ...newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("products").doc(id).update(req.body);
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("products").doc(id).delete();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct };
