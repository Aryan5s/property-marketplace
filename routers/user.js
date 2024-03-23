const express = require('express');
const router = express.Router();
const {signup , signin , logout} = require('../controllers/user');
const isAuthenticated = require('../middlewares/auth');

router.post('/signup' , signup);
router.post('/signin' , signin);
router.post('/signout' , isAuthenticated , logout);

module.exports = router;