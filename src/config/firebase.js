const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");

const serviceAccount = require("./firebaseConfig.json");

// Inicializa o Admin SDK (backend)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Configuração do Client SDK (frontend)
const firebaseConfig = {
  apiKey: serviceAccount.api_key || process.env.FIREBASE_API_KEY,
  authDomain: `${serviceAccount.project_id}.firebaseapp.com`,
  projectId: serviceAccount.project_id
};

// Inicializa o Firebase Client SDK
const firebaseApp = initializeApp(firebaseConfig);

module.exports = { 
  db, 
  admin
};