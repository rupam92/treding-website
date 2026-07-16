import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import {
  executeTrade,
  fetchTradeHistory,
  clearError,
} from '../../store/slices/tradeSlice';
import {
  fetchPrice,
  searchSymbols,
} from '../../store/slices/marketSlice';

const Trade = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.trade);
  const { currentPrice, searchResults } = useSelector((state) => state.market);

  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (symbol) {
      dispatch(fetchPrice(symbol));
    }
  }, [dispatch, symbol]);

  useEffect(() => {
    if (searchQuery) {
      dispatch(searchSymbols(searchQuery));
    }
  }, [dispatch, searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol && quantity) {
      dispatch(executeTrade({ symbol, type, quantity: Number(quantity) }));
      setQuantity('');
    }
  };

  const handleSymbolSelect = (selectedSymbol) => {
    setSymbol(selectedSymbol);
    setSearchQuery('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Execute Trade
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Search Symbol"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    margin="normal"
                  />
                  {searchResults.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {searchResults.map((stock) => (
                        <Button
                          key={stock.symbol}
                          variant="outlined"
                          size="small"
                          onClick={() => handleSymbolSelect(stock.symbol)}
                          sx={{ mr: 1, mb: 1 }}
                        >
                          {stock.symbol}
                        </Button>
                      ))}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={type}
                      label="Type"
                      onChange={(e) => setType(e.target.value)}
                    >
                      <MenuItem value="buy">Buy</MenuItem>
                      <MenuItem value="sell">Sell</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    margin="normal"
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                {currentPrice && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Current Price: {formatPrice(currentPrice.price)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Total:{' '}
                      {formatPrice(currentPrice.price * (Number(quantity) || 0))}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Execute Trade'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Trade; 