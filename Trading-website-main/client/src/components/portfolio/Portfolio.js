import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  LinearProgress,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Info,
  PieChart,
  BarChart,
  Timeline,
  AttachMoney,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Star,
  StarBorder,
} from '@mui/icons-material';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { fetchPortfolio, fetchBalance } from '../../store/slices/portfolioSlice';
import { fetchPrice, fetchHistory } from '../../store/slices/marketSlice';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion(Card);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Portfolio = () => {
  const dispatch = useDispatch();
  const { positions = [], balance = 0, loading: portfolioLoading } = useSelector((state) => state.portfolio);
  const { currentPrice: prices = {}, loading: marketLoading } = useSelector((state) => state.market);
  const [timeRange, setTimeRange] = useState('1M');
  const [selectedView, setSelectedView] = useState('overview');
  const [sortConfig, setSortConfig] = useState({ key: 'value', direction: 'desc' });
  const [favorites, setFavorites] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchBalance());
    positions.forEach(position => {
      dispatch(fetchPrice(position.symbol));
      dispatch(fetchHistory(position.symbol));
    });
  }, [dispatch, positions]);

  const handleMenuClick = (event, position) => {
    setAnchorEl(event.currentTarget);
    setSelectedPosition(position);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPosition(null);
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

  const calculateTotalValue = () => {
    return positions.reduce((total, position) => {
      const currentPrice = prices[position.symbol]?.price || position.currentPrice;
      return total + position.quantity * currentPrice;
    }, 0);
  };

  const calculateGrowth = () => {
    const totalValue = calculateTotalValue();
    const initialInvestment = 10000;
    return ((totalValue - initialInvestment) / initialInvestment) * 100;
  };

  const getGrowthColor = (value) => {
    return value >= 0 ? 'success' : 'error';
  };

  const generatePieChartData = () => {
    return positions.map(position => {
      const currentPrice = prices[position.symbol]?.price || position.currentPrice;
      const value = position.quantity * currentPrice;
      return {
        name: position.symbol,
        value,
      };
    });
  };

  const generatePerformanceData = () => {
    const data = [];
    const baseValue = calculateTotalValue();
    const volatility = 0.02; // Increased volatility for more interesting chart
    let currentValue = baseValue;
    
    for (let i = 0; i < 30; i++) {
      const change = (Math.random() - 0.5) * volatility;
      currentValue = currentValue * (1 + change);
      data.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        value: currentValue,
        change: change * 100,
      });
    }
    return data;
  };

  const generateSectorData = () => {
    return [
      { name: 'Technology', value: 45 },
      { name: 'Finance', value: 25 },
      { name: 'Healthcare', value: 15 },
      { name: 'Energy', value: 10 },
      { name: 'Other', value: 5 },
    ];
  };

  const sortPositions = (positions) => {
    return [...positions].sort((a, b) => {
      const aValue = (prices[a.symbol]?.price || a.currentPrice) * a.quantity;
      const bValue = (prices[b.symbol]?.price || b.currentPrice) * b.quantity;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  if (portfolioLoading || marketLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const totalValue = calculateTotalValue();
  const growth = calculateGrowth();
  const pieChartData = generatePieChartData();
  const performanceData = generatePerformanceData();
  const sectorData = generateSectorData();
  const sortedPositions = sortPositions(positions);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
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
            {/* Portfolio Overview */}
            <Grid item xs={12}>
              <MotionCard
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                sx={{ bgcolor: '#fff', boxShadow: 2, mb: 3 }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Typography variant="h5">Portfolio Overview</Typography>
                    </motion.div>
                    <Box>
                      {['overview', 'performance', 'sectors'].map((view, index) => (
                        <motion.div
                          key={view}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Chip
                            label={view.charAt(0).toUpperCase() + view.slice(1)}
                            onClick={() => setSelectedView(view)}
                            color={selectedView === view ? 'primary' : 'default'}
                            sx={{ mx: 0.5 }}
                          />
                        </motion.div>
                      ))}
                    </Box>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Box textAlign="center">
                          <Typography variant="h6" gutterBottom>
                            Total Value
                          </Typography>
                          <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <Typography variant="h4" color="primary">
                              {formatPrice(totalValue)}
                            </Typography>
                          </motion.div>
                          <LinearProgress 
                            variant="determinate" 
                            value={75} 
                            sx={{ mt: 1, height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </motion.div>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Box textAlign="center">
                          <Typography variant="h6" gutterBottom>
                            Growth
                          </Typography>
                          <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <Box display="flex" alignItems="center" justifyContent="center">
                              {growth >= 0 ? (
                                <motion.div
                                  initial={{ rotate: -180, opacity: 0 }}
                                  animate={{ rotate: 0, opacity: 1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <ArrowUpward color="success" sx={{ mr: 1 }} />
                                </motion.div>
                              ) : (
                                <motion.div
                                  initial={{ rotate: 180, opacity: 0 }}
                                  animate={{ rotate: 0, opacity: 1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <ArrowDownward color="error" sx={{ mr: 1 }} />
                                </motion.div>
                              )}
                              <Typography variant="h4" color={getGrowthColor(growth)}>
                                {growth.toFixed(2)}%
                              </Typography>
                            </Box>
                          </motion.div>
                        </Box>
                      </motion.div>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Box textAlign="center">
                          <Typography variant="h6" gutterBottom>
                            Cash Balance
                          </Typography>
                          <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <Typography variant="h4" color="primary">
                              {formatPrice(balance)}
                            </Typography>
                          </motion.div>
                          <Typography variant="body2" color="textSecondary">
                            Available for Trading
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  </Grid>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Portfolio Distribution */}
            <Grid item xs={12} md={6}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ height: 400, bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Portfolio Distribution</Typography>
                    <Tooltip title="View asset allocation">
                      <IconButton>
                        <Info />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={2000}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatPrice(value)} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Performance Chart */}
            <Grid item xs={12} md={6}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ height: 400, bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Performance</Typography>
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
                    <AreaChart
                      data={performanceData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorChange" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.split('/').slice(0, 2).join('/')}
                      />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={(value) => formatPrice(value)}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        tickFormatter={(value) => `${value.toFixed(2)}%`}
                        tick={{ fontSize: 12 }}
                      />
                      <RechartsTooltip 
                        formatter={(value, name) => {
                          if (name === 'value') return [formatPrice(value), 'Portfolio Value'];
                          if (name === 'change') return [`${value.toFixed(2)}%`, 'Daily Change'];
                          return [value, name];
                        }}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        animationDuration={2000}
                        animationBegin={0}
                        animationEasing="ease-out"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="change"
                        stroke="#82ca9d"
                        fillOpacity={0.3}
                        fill="url(#colorChange)"
                        animationDuration={2000}
                        animationBegin={500}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Current Value
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatPrice(performanceData[performanceData.length - 1]?.value || 0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Daily Change
                      </Typography>
                      <Typography 
                        variant="h6" 
                        color={performanceData[performanceData.length - 1]?.change >= 0 ? 'success' : 'error'}
                      >
                        {performanceData[performanceData.length - 1]?.change >= 0 ? '+' : ''}
                        {performanceData[performanceData.length - 1]?.change.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Sector Distribution */}
            <Grid item xs={12}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sector Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart
                      data={sectorData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => `${value}%`} />
                      <Bar
                        dataKey="value"
                        fill="#8884d8"
                        animationDuration={2000}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </MotionCard>
            </Grid>

            {/* Holdings Table */}
            <Grid item xs={12}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Holdings</Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setSortConfig(prev => ({
                        key: 'value',
                        direction: prev.direction === 'asc' ? 'desc' : 'asc'
                      }))}
                    >
                      Sort by Value {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Symbol</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Avg Price</TableCell>
                          <TableCell align="right">Current Price</TableCell>
                          <TableCell align="right">Value</TableCell>
                          <TableCell align="right">Growth</TableCell>
                          <TableCell align="right">Allocation</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedPositions.map((position) => {
                          const currentPrice = prices[position.symbol]?.price || position.currentPrice;
                          const value = position.quantity * currentPrice;
                          const growth = ((currentPrice - position.averagePrice) / position.averagePrice) * 100;
                          const allocation = (value / totalValue) * 100;
                          return (
                            <TableRow 
                              key={position.symbol}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: 'action.hover',
                                  transition: 'background-color 0.3s'
                                }
                              }}
                            >
                              <TableCell component="th" scope="row">
                                <Box display="flex" alignItems="center">
                                  {position.symbol}
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleFavorite(position.symbol)}
                                    sx={{ ml: 1 }}
                                  >
                                    {favorites.includes(position.symbol) ? (
                                      <Star color="warning" />
                                    ) : (
                                      <StarBorder />
                                    )}
                                  </IconButton>
                                </Box>
                              </TableCell>
                              <TableCell align="right">{position.quantity}</TableCell>
                              <TableCell align="right">{formatPrice(position.averagePrice)}</TableCell>
                              <TableCell align="right">{formatPrice(currentPrice)}</TableCell>
                              <TableCell align="right">{formatPrice(value)}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${growth.toFixed(2)}%`}
                                  color={getGrowthColor(growth)}
                                  size="small"
                                  icon={growth >= 0 ? <ArrowUpward /> : <ArrowDownward />}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Box display="flex" alignItems="center" justifyContent="flex-end">
                                  <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                                    {allocation.toFixed(2)}%
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={allocation}
                                    sx={{ width: 50, height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuClick(e, position)}
                                >
                                  <MoreVert />
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
        <MenuItem onClick={handleMenuClose}>Trade</MenuItem>
        <MenuItem onClick={handleMenuClose}>Add to Watchlist</MenuItem>
      </Menu>
    </Box>
  );
};

export default Portfolio; 