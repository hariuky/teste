const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const admin = require("firebase-admin"); // Adicionado esta linha
const logger = console;

// Listar usuários com tratamento robusto de erros
router.get("/", async (req, res) => {
  try {
    logger.info("Iniciando consulta de usuários...");
    
    // Verifica se a conexão com o Firestore está ativa
    if (!db) {
      throw new Error("Firestore não está inicializado");
    }

    const usersRef = db.collection("users");
    const snapshot = await usersRef.get();

    // Se não houver documentos
    if (snapshot.empty) {
      logger.info("Nenhum usuário encontrado na coleção");
      return res.status(200).json([]);
    }

    // Mapeia os documentos para o formato esperado
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || 'Nome não informado',
        email: data.email || 'Email não informado',
        phone: data.phone || 'Telefone não informado',
        position: data.position || 'Cargo não informado'
      };
    });

    logger.info(`Retornando ${users.length} usuários`);
    res.status(200).json(users);

  } catch (error) {
    logger.error("ERRO NO SERVIDOR:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      error: "Erro interno no servidor",
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("Corpo da requisição recebido:", req.body);
    
    const { fullName, email, phone, position } = req.body;

    // Validação robusta
    if (!fullName || fullName.trim().length < 3) {
      return res.status(400).json({ 
        error: "Nome inválido",
        message: "O nome deve ter pelo menos 3 caracteres"
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        error: "Email inválido",
        message: "Por favor, forneça um email válido"
      });
    }

    if (!position || position.trim().length < 2) {
      return res.status(400).json({ 
        error: "Cargo inválido",
        message: "O cargo deve ter pelo menos 2 caracteres"
      });
    }

    // Verifica se email já existe
    const emailExists = await db.collection("users")
                              .where("email", "==", email.trim().toLowerCase())
                              .limit(1)
                              .get();

    if (!emailExists.empty) {
      return res.status(409).json({ 
        error: "Email já cadastrado",
        message: "Este email já está em uso por outro usuário"
      });
    }

    const newUser = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      position: position.trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "active"
    };

    console.log("Tentando criar usuário com dados:", newUser);

    const docRef = await db.collection("users").add(newUser);
    const userCreated = await docRef.get();

    console.log("Usuário criado com sucesso, ID:", docRef.id);

    res.status(201).json({
      success: true,
      id: docRef.id,
      ...userCreated.data()
    });

  } catch (error) {
    console.error("ERRO DETALHADO:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      error: "Erro no servidor",
      message: error.message, // Mostra a mensagem real do erro
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verifica se o usuário existe
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await db.collection("users").doc(userId).delete();
    
    res.status(200).json({ 
      message: "Usuário deletado com sucesso",
      deletedId: userId
    });

  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ 
      error: "Erro ao deletar usuário",
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

module.exports = router;