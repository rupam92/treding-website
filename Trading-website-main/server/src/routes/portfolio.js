const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Get user's portfolio
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      balance: user.balance,
      portfolio: user.portfolio
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
});

// Get portfolio value
router.get('/value', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total portfolio value
    const portfolioValue = user.portfolio.reduce((total, position) => {
      return total + (position.quantity * position.averagePrice);
    }, 0);

    res.json({
      balance: user.balance,
      portfolioValue,
      totalValue: user.balance + portfolioValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating portfolio value', error: error.message });
  }
});

// Get specific position
router.get('/position/:symbol', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const position = user.portfolio.find(p => p.symbol === req.params.symbol);
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }

    res.json(position);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching position', error: error.message });
  }
});

module.exports = router; 