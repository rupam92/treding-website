const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Trade = require('../models/Trade');
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

// Create new trade
router.post('/', auth, async (req, res) => {
  try {
    const { symbol, type, quantity, price } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total amount
    const totalAmount = quantity * price;

    // Check if user has enough balance for buy orders
    if (type === 'BUY' && user.balance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create new trade
    const trade = new Trade({
      user: req.userId,
      symbol,
      type,
      quantity,
      price,
      totalAmount
    });

    await trade.save();

    // Update user's portfolio and balance
    if (type === 'BUY') {
      user.balance -= totalAmount;
      const existingPosition = user.portfolio.find(p => p.symbol === symbol);
      
      if (existingPosition) {
        existingPosition.quantity += quantity;
        existingPosition.averagePrice = 
          ((existingPosition.averagePrice * (existingPosition.quantity - quantity)) + 
          (price * quantity)) / existingPosition.quantity;
      } else {
        user.portfolio.push({
          symbol,
          quantity,
          averagePrice: price
        });
      }
    } else {
      user.balance += totalAmount;
      const existingPosition = user.portfolio.find(p => p.symbol === symbol);
      
      if (existingPosition) {
        if (existingPosition.quantity < quantity) {
          return res.status(400).json({ message: 'Insufficient shares' });
        }
        existingPosition.quantity -= quantity;
        if (existingPosition.quantity === 0) {
          user.portfolio = user.portfolio.filter(p => p.symbol !== symbol);
        }
      } else {
        return res.status(400).json({ message: 'No position found for this symbol' });
      }
    }

    await user.save();

    res.status(201).json(trade);
  } catch (error) {
    res.status(500).json({ message: 'Error creating trade', error: error.message });
  }
});

// Get user's trades
router.get('/', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.userId })
      .sort({ executedAt: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trades', error: error.message });
  }
});

// Get specific trade
router.get('/:id', auth, async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trade', error: error.message });
  }
});

module.exports = router; 