import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Sample data for demonstration
const sampleStocks = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.84,
    change: 2.5,
    volume: 52345678,
    marketCap: '2.8T',
    pe: 28.5,
    dividend: 0.92,
    history: Array.from({ length: 30 }, (_, i) => ({
      timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      price: 175.84 + (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 10000000) + 40000000
    }))
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.65,
    change: -1.2,
    volume: 23456789,
    marketCap: '1.8T',
    pe: 25.3,
    dividend: 0.00,
    history: Array.from({ length: 30 }, (_, i) => ({
      timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      price: 142.65 + (Math.random() - 0.5) * 8,
      volume: Math.floor(Math.random() * 8000000) + 20000000
    }))
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 338.11,
    change: 1.8,
    volume: 34567890,
    marketCap: '2.5T',
    pe: 32.1,
    dividend: 0.68,
    history: Array.from({ length: 30 }, (_, i) => ({
      timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      price: 338.11 + (Math.random() - 0.5) * 12,
      volume: Math.floor(Math.random() * 12000000) + 30000000
    }))
  }
};

// Async thunks
export const fetchPrice = createAsyncThunk(
  'market/fetchPrice',
  async (symbol, { rejectWithValue }) => {
    try {
      // Simulate API call with sample data
      return new Promise((resolve) => {
        setTimeout(() => {
          const stock = sampleStocks[symbol];
          if (stock) {
            resolve({
              symbol: stock.symbol,
              price: stock.price,
              change: stock.change,
              volume: stock.volume
            });
          } else {
            rejectWithValue('Stock not found');
          }
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch price');
    }
  }
);

export const fetchHistory = createAsyncThunk(
  'market/fetchHistory',
  async (symbol, { rejectWithValue }) => {
    try {
      // Simulate API call with sample data
      return new Promise((resolve) => {
        setTimeout(() => {
          const stock = sampleStocks[symbol];
          if (stock) {
            resolve(stock.history);
          } else {
            rejectWithValue('Stock not found');
          }
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const searchSymbols = createAsyncThunk(
  'market/searchSymbols',
  async (query, { rejectWithValue }) => {
    try {
      // Simulate API call with sample data
      return new Promise((resolve) => {
        setTimeout(() => {
          const results = Object.values(sampleStocks).filter(stock => 
            stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
            stock.name.toLowerCase().includes(query.toLowerCase())
          );
          resolve(results);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search symbols');
    }
  }
);

const initialState = {
  currentPrice: null,
  priceHistory: [],
  searchResults: [],
  loading: false,
  error: null
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Price
      .addCase(fetchPrice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrice.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrice = action.payload;
      })
      .addCase(fetchPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch History
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.priceHistory = action.payload;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Symbols
      .addCase(searchSymbols.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSymbols.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchSymbols.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSearchResults } = marketSlice.actions;
export default marketSlice.reducer; 