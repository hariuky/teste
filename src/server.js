require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const productRoutes = require("./routes/productRoutes");const userRoutes = require("./routes/userRoutes");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);app.use("/api/users", userRoutes);
app.use(express.static('public'));


// Rotas para páginas HTML
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
