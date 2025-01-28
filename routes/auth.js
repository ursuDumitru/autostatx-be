const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Path to the JSON file
const usersFilePath = path.join(__dirname, '../mock_db/users.json');

// Helper function to load users from the JSON file
const loadUsers = () => {
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data);
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const users = loadUsers();

  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.json({ success: false, message: 'Invalid username or password' });
  }
});

module.exports = router;
