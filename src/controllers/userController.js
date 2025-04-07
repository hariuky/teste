const { db } = require("../config/firebase");

const getUsers = async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const newUser = { username, email, role };
    const docRef = await db.collection("users").add(newUser);
    res.json({ id: docRef.id, ...newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsers, addUser };