import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
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
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
  Timeline,
  AttachMoney,
  Info,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { fetchPortfolio, fetchBalance } from '../../store/slices/portfolioSlice';
import { fetchPrice, fetchHistory } from '../../store/slices/marketSlice';
import { fetchTradeHistory } from '../../store/slices/tradeSlice';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const AnimatedPaper = styled(motion(Paper))(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
}));

const MotionCard = motion(Card);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { positions = [], balance = 0, loading: portfolioLoading } = useSelector((state) => state.portfolio);
  const { currentPrice: prices = {}, loading: marketLoading } = useSelector((state) => state.market);
  const { trades = [], loading: tradesLoading } = useSelector((state) => state.trade);
  const [timeRange, setTimeRange] = useState('1D');

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchBalance());
    positions.forEach(position => {
      dispatch(fetchPrice(position.symbol));
      dispatch(fetchHistory(position.symbol));
    });
    dispatch(fetchTradeHistory());
  }, [dispatch, positions]);

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

  const getTradeTypeColor = (type) => {
    return type === 'BUY' ? 'success' : 'error';
  };

  const getGrowthColor = (value) => {
    return value >= 0 ? 'success' : 'error';
  };

  const generateChartData = () => {
    return positions.map(position => {
      const currentPrice = prices[position.symbol]?.price || position.currentPrice;
      const value = position.quantity * currentPrice;
      const growth = ((currentPrice - position.averagePrice) / position.averagePrice) * 100;
      return {
        name: position.symbol,
        value,
        growth,
        quantity: position.quantity,
      };
    });
  };

  const generatePerformanceData = () => {
    // Simulate performance data over time
    const data = [];
    const baseValue = calculateTotalValue();
    for (let i = 0; i < 30; i++) {
      data.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        value: baseValue * (1 + (Math.random() - 0.5) * 0.1),
      });
    }
    return data;
  };

  if (portfolioLoading || marketLoading || tradesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const totalValue = calculateTotalValue();
  const growth = calculateGrowth();
  const recentTrades = trades.slice(0, 5);
  const chartData = generateChartData();
  const performanceData = generatePerformanceData();

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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        py: 4,
      }}
    >
      <Container>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                sx={{ height: '100%', bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AccountBalance color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Value</Typography>
                  </Box>
                  <Typography variant="h4" gutterBottom>
                    {formatPrice(totalValue)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Cash Balance: {formatPrice(balance)}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                sx={{ height: '100%', bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ShowChart color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Growth</Typography>
                  </Box>
                  <Typography variant="h4" color={getGrowthColor(growth)} gutterBottom>
                    {growth.toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Since Initial Investment
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                sx={{ height: '100%', bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Timeline color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Active Positions</Typography>
                  </Box>
                  <Typography variant="h4" gutterBottom>
                    {positions.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Stocks in Portfolio
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} md={3}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                sx={{ height: '100%', bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AttachMoney color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Trading Activity</Typography>
                  </Box>
                  <Typography variant="h4" gutterBottom>
                    {trades.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Trades
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} md={8}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ height: 400, bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Portfolio Performance</Typography>
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
                      data={performanceData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatPrice(value)} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={false}
                        animationDuration={2000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ height: 400, bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Portfolio Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatPrice(value)} />
                      <Bar
                        dataKey="value"
                        fill="#8884d8"
                        animationDuration={2000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ bgcolor: '#fff', boxShadow: 2 }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Holdings
                  </Typography>
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
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {positions.map((position) => {
                          const currentPrice = prices[position.symbol]?.price || position.currentPrice;
                          const value = position.quantity * currentPrice;
                          const growth = ((currentPrice - position.averagePrice) / position.averagePrice) * 100;
                          return (
                            <TableRow key={position.symbol}>
                              <TableCell component="th" scope="row">
                                {position.symbol}
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
                                />
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
    </Box>
  );
};

export default Dashboard; 