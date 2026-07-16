import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Sample portfolio data
const samplePortfolio = {
  balance: 10000,
  positions: [
    {
      symbol: 'AAPL',
      quantity: 10,
      averagePrice: 150.25,
      currentPrice: 175.84,
    },
    {
      symbol: 'GOOGL',
      quantity: 5,
      averagePrice: 130.50,
      currentPrice: 142.65,
    },
    {
      symbol: 'MSFT',
      quantity: 8,
      averagePrice: 300.75,
      currentPrice: 338.11,
    },
  ],
};

// Async thunks
export const fetchPortfolio = createAsyncThunk(
  'portfolio/fetchPortfolio',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call with sample data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(samplePortfolio);
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio');
    }
  }
);

export const fetchBalance = createAsyncThunk(
  'portfolio/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call with sample data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ balance: samplePortfolio.balance });
        }, 500);
      });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch balance');
    }
  }
);

const initialState = {
  positions: [],
  balance: 0,
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Portfolio
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.positions = action.payload.positions;
        state.balance = action.payload.balance;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Balance
      .addCase(fetchBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
      })
      .addCase(fetchBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = portfolioSlice.actions;
export default portfolioSlice.reducer; 