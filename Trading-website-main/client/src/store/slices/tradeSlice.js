import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Sample trade data
const sampleTrades = [
  {
    id: '1',
    symbol: 'AAPL',
    type: 'buy',
    quantity: 10,
    price: 150.25,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    symbol: 'GOOGL',
    type: 'buy',
    quantity: 5,
    price: 130.50,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    symbol: 'MSFT',
    type: 'buy',
    quantity: 8,
    price: 300.75,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Async thunks
export const executeTrade = createAsyncThunk(
  'trade/executeTrade',
  async (tradeData, { rejectWithValue }) => {
    try {
      // Simulate API call with sample data
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Validate trade
          if (tradeData.quantity <= 0) {
            reject('Invalid quantity');
            return;
          }

          // Create new trade
          const newTrade = {
            id: String(sampleTrades.length + 1),
            ...tradeData,
            timestamp: new Date().toISOString(),
          };
          sampleTrades.unshift(newTrade);

          resolve(newTrade);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Trade execution failed');
    }
  }
);

export const fetchTradeHistory = createAsyncThunk(
  'trade/fetchTradeHistory',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call with sample data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(sampleTrades);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trade history');
    }
  }
);

const initialState = {
  trades: [],
  loading: false,
  error: null,
};

const tradeSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Execute Trade
      .addCase(executeTrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeTrade.fulfilled, (state, action) => {
        state.loading = false;
        state.trades.unshift(action.payload);
      })
      .addCase(executeTrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Trade History
      .addCase(fetchTradeHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTradeHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.trades = action.payload;
      })
      .addCase(fetchTradeHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = tradeSlice.actions;
export default tradeSlice.reducer; 