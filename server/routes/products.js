const express = require('express');
const router = express.Router();

// Example routes
router.get('/', (req, res) => {
  res.send('All users');
});

router.post('/register', (req, res) => {
  res.send('Register user');
});

module.exports = router; 





