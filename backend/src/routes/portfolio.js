const express = require('express');
const router = express.Router();
const { authenticate} = require('../middleware/auth');

const tradeController = require('../controllers/tradeController');
const portfolioController = require('../controllers/portfolioController');
const transasctionController = require('../controllers/transactionController');

// Apply authentication middleware to all routes in this router
router.use(authenticate)

// Buy and sell stocks
router.post('/buy', tradeController.buy);
router.post('/sell', tradeController.sell);
router.get('/', portfolioController.getPortfolio);
router.get('/transactions', transasctionController.getHistory);

module.exports = router;