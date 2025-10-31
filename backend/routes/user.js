// backend/routes/user.js
const express = require('express');
const { getUserById } = require('../controllers/userController');
const { protect, checkResourceAccess } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Apply auth middleware

router.get('/:id', checkResourceAccess(), getUserById);
module.exports = router;
