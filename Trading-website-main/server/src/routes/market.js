const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');

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

// Get real-time price for a symbol
router.get('/price/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );

    if (response.data['Error Message']) {
      return res.status(400).json({ message: 'Invalid symbol' });
    }

    const quote = response.data['Global Quote'];
    res.json({
      symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume'])
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching price data', error: error.message });
  }
});

// Get historical data for a symbol
router.get('/history/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '5min' } = req.query;

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );

    if (response.data['Error Message']) {
      return res.status(400).json({ message: 'Invalid symbol or interval' });
    }

    const timeSeries = response.data[`Time Series (${interval})`];
    const history = Object.entries(timeSeries).map(([timestamp, data]) => ({
      timestamp,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume'])
    }));

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching historical data', error: error.message });
  }
});

// Search for symbols
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );

    if (response.data['Error Message']) {
      return res.status(400).json({ message: 'Error searching symbols' });
    }

    const matches = response.data.bestMatches.map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region']
    }));

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error searching symbols', error: error.message });
  }
});

module.exports = router; 