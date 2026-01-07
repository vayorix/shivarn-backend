const express = require('express');
const { register, login, getUsers, deleteUser, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;