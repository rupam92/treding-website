import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Tooltip,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  TrendingDown,
  FilterList,
  Star,
  StarBorder,
  Info,
  ArrowUpward,
  ArrowDownward,
  ShowChart,
  BarChart,
  PieChart,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { fetchPrice, fetchHistory } from '../../store/slices/marketSlice';

const MotionCard = motion(Card);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Market = () => {
  const dispatch = useDispatch();
  const { currentPrice: prices = {}, loading: marketLoading } = useSelector((state) => state.market);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('1D');
  const [selectedView, setSelectedView] = useState('overview');
  const [favorites, setFavorites] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'price', direction: 'desc' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);

  const stocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: '2.5T' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', marketCap: '2.1T' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', marketCap: '1.8T' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', marketCap: '1.6T' },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', marketCap: '800B' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', marketCap: '450B' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', marketCap: '400B' },
    { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', marketCap: '500B' },
  ];

  useEffect(() => {
    stocks.forEach(stock => {
      dispatch(fetchPrice(stock.symbol));
      dispatch(fetchHistory(stock.symbol));
    });
  }, [dispatch]);

  const handleMenuClick = (event, stock) => {
    setAnchorEl(event.currentTarget);
    setSelectedStock(stock);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStock(null);
  };

  const toggleFavorite = (symbol) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const calculateChange = (current, previous) => {
    return ((current - previous) / previous) * 100;
  };

  const getChangeColor = (value) => {
    return value >= 0 ? 'success' : 'error';
  };

  const generateChartData = (symbol) => {
    const data = [];
    const basePrice = prices[symbol]?.price || 100;
    const volatility = 0.02;
    let currentPrice = basePrice;
    
    for (let i = 0; i < 30; i++) {
      const change = (Math.random() - 0.5) * volatility;
      currentPrice = currentPrice * (1 + change);
      data.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price: currentPrice,
        volume: Math.floor(Math.random() * 1000000),
      });
    }
    return data;
  };

  const generateSectorData = () => {
    const sectors = {};
    stocks.forEach(stock => {
      sectors[stock.sector] = (sectors[stock.sector] || 0) + 1;
    });
    return Object.entries(sectors).map(([name, value]) => ({ name, value }));
  };

  const sortStocks = (stocks) => {
    return [...stocks].sort((a, b) => {
      const aValue = prices[a.symbol]?.price || 0;
      const bValue = prices[b.symbol]?.price || 0;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  if (marketLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedStocks = sortStocks(filteredStocks);
  const sectorData = generateSectorData();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)', py: 4 }}>
      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {/* Market Overview */}
            <Grid item xs={12}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ bgcolor: '#fff', boxShadow: 2, mb: 3 }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5">Market Overview</Typography>
                    <Box>
                      {['overview', 'sectors', 'trends'].map((view) => (
                        <Chip
                          key={view}
                          label={view.charAt(0).toUpperCase() + view.slice(1)}
                          onClick={() => setSelectedView(view)}
                          color={selectedView === view ? 'primary' : 'default'}
                          sx={{ mx: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box textAlign="center">
                        <Typography variant="h6" gutterBottom>
                          Market Cap
                        </Typography>
                        <Typography variant="h4" color="primary">
                          $10.2T
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={75} 
                          sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box textAlign="center">
                        <Typography variant="h6" gutterBottom>
                          Market Change
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <ArrowUpward color="success" sx={{ mr: 1 }} />
                          <Typography variant="h4" color="success">
                            +2.5%
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box textAlign="center">
                        <Typography variant="h6" gutterBottom>
                          Trading Volume
                        </Typography>
                        <Typography variant="h4" color="primary">
                          $45.2B
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Last 24 Hours
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Search and Filter */}
            <Grid item xs={12}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search stocks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ maxWidth: 400 }}
                    />
                    <Box>
                      <Button
                        variant="outlined"
                        onClick={() => setSortConfig(prev => ({
                          key: 'price',
                          direction: prev.direction === 'asc' ? 'desc' : 'asc'
                        }))}
                        startIcon={<FilterList />}
                      >
                        Sort by Price {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Market Distribution */}
            <Grid item xs={12} md={6}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ height: 400, bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Market Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={2000}
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${value} stocks`} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Market Trends */}
            <Grid item xs={12} md={6}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ height: 400, bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Market Trends</Typography>
                    <Box>
                      {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
                        <Chip
                          key={range}
                          label={range}
                          onClick={() => setTimeRange(range)}
                          color={timeRange === range ? 'primary' : 'default'}
                          sx={{ mx: 0.5 }}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={generateChartData('AAPL')}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatPrice(value)} />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#8884d8"
                        animationDuration={2000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Stocks Table */}
            <Grid item xs={12}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Market Stocks
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Symbol</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Sector</TableCell>
                          <TableCell align="right">Market Cap</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Change</TableCell>
                          <TableCell align="right">Volume</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedStocks.map((stock) => {
                          const currentPrice = prices[stock.symbol]?.price || 0;
                          const previousPrice = prices[stock.symbol]?.previousPrice || currentPrice;
                          const change = calculateChange(currentPrice, previousPrice);
                          return (
                            <TableRow 
                              key={stock.symbol}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: 'action.hover',
                                  transition: 'background-color 0.3s'
                                }
                              }}
                            >
                              <TableCell component="th" scope="row">
                                <Box display="flex" alignItems="center">
                                  {stock.symbol}
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleFavorite(stock.symbol)}
                                    sx={{ ml: 1 }}
                                  >
                                    {favorites.includes(stock.symbol) ? (
                                      <Star color="warning" />
                                    ) : (
                                      <StarBorder />
                                    )}
                                  </IconButton>
                                </Box>
                              </TableCell>
                              <TableCell>{stock.name}</TableCell>
                              <TableCell>{stock.sector}</TableCell>
                              <TableCell align="right">{stock.marketCap}</TableCell>
                              <TableCell align="right">{formatPrice(currentPrice)}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${change.toFixed(2)}%`}
                                  color={getChangeColor(change)}
                                  size="small"
                                  icon={change >= 0 ? <ArrowUpward /> : <ArrowDownward />}
                                />
                              </TableCell>
                              <TableCell align="right">
                                {Math.floor(Math.random() * 1000000).toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuClick(e, stock)}
                                >
                                  <Info />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Add to Watchlist</MenuItem>
        <MenuItem onClick={handleMenuClose}>View Chart</MenuItem>
      </Menu>
    </Box>
  );
};

export default Market; 