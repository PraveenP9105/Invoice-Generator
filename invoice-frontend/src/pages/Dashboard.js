import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Pending as PendingIcon,
  CheckCircle as PaidIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import invoiceService from '../services/invoiceService';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const [stats, setStats] = useState({
    totalInvoices: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    totalRevenue: 0,
    recentInvoices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getDashboardStats();
      if (response && response.data) {
        setStats(response.data);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Generate monthly data based on actual invoices
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;

      monthlyData.push({
        month: months[monthIndex],
        monthIndex: monthIndex,
        year: year,
        invoices: 0,
        revenue: 0,
        fullMonth: `${months[monthIndex]} ${year}`
      });
    }

    // If we have recent invoices, populate real data
    if (stats.recentInvoices && stats.recentInvoices.length > 0) {
      stats.recentInvoices.forEach(invoice => {
        if (invoice.issueDate) {
          const invoiceDate = new Date(invoice.issueDate);
          const invoiceMonth = invoiceDate.getMonth();
          const invoiceYear = invoiceDate.getFullYear();

          // Find matching month in our data
          const monthData = monthlyData.find(m =>
            m.monthIndex === invoiceMonth && m.year === invoiceYear
          );

          if (monthData) {
            monthData.invoices += 1;
            monthData.revenue += invoice.totalAmount || 0;
          }
        }
      });
    }

    return monthlyData;
  };

  const monthlyData = generateMonthlyData();

  const statusData = [
    {
      name: 'Paid',
      value: stats.paidInvoices,
      color: '#4caf50'
    },
    {
      name: 'Pending',
      value: stats.pendingInvoices,
      color: '#ff9800'
    },
    {
      name: 'Overdue',
      value: Math.max(0, stats.totalInvoices - stats.paidInvoices - stats.pendingInvoices),
      color: '#f44336'
    },
  ].filter(item => item.value > 0);

  const COLORS = statusData.map(item => item.color);

  const StatCard = ({ title, value, icon, bgColor, prefix = '', suffix = '' }) => (
    <Card sx={{
      height: '100%',
      position: 'relative',
      overflow: 'visible',
      transition: 'transform 0.2s',
      borderRadius: 3,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8]
      }
    }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
        <Box
          sx={{
            position: 'absolute',
            top: -15,
            right: { xs: 15, sm: 20, md: 25 },
            width: { xs: 50, sm: 55, md: 60 },
            height: { xs: 50, sm: 55, md: 60 },
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: bgColor,
            color: 'white',
            boxShadow: 4,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: { xs: 26, sm: 28, md: 32 } } })}
        </Box>
        <Typography
          variant="body2"
          color="textSecondary"
          gutterBottom
          sx={{ fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1rem' } }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          component="div"
          sx={{
            mt: { xs: 1, sm: 1.5, md: 2 },
            fontWeight: 'bold',
            fontSize: { xs: '2rem', sm: '2.2rem', md: '2.5rem' }
          }}
        >
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardStats}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      id="dashboard-container"
      sx={{
        flexGrow: 1,
        width: '100%',
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: theme.palette.background.default,
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: { xs: 3, sm: 4, md: 5 },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem' },
            fontWeight: 'bold'
          }}
        >
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/invoices/create')}
          sx={{
            borderRadius: 2,
            py: { xs: 1, sm: 1.5 },
            px: { xs: 3, sm: 4 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Create Invoice
        </Button>
      </Box>

      {/* Stats Cards - Full width, responsive grid */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={<ReceiptIcon />}
            bgColor="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={stats.pendingInvoices}
            icon={<PendingIcon />}
            bgColor="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Paid"
            value={stats.paidInvoices}
            icon={<PaidIcon />}
            bgColor="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={stats.totalRevenue}
            icon={<MoneyIcon />}
            bgColor="#9c27b0"
            prefix="$"
          />
        </Grid>
      </Grid>

      {/* Charts Section - Optimized for full width */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Revenue Trend Chart - Takes 9 columns on large screens */}
        <Grid item xs={12} lg={9}>
          <Paper sx={{
            p: { xs: 2, sm: 3, md: 4 },
            height: { xs: 400, sm: 450, md: 500 },
            width: '100%',
            borderRadius: 3,
            boxShadow: theme.shadows[2]
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUpIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: { xs: 24, sm: 28 } }} />
              <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' }, fontWeight: 600 }}>
                Revenue Trend (Last 6 Months)
              </Typography>
            </Box>
            <Box sx={{ width: '100%', height: 'calc(100% - 70px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 0 : 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: isMobile ? 11 : 13, fill: theme.palette.text.secondary }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: isMobile ? 11 : 13, fill: theme.palette.text.secondary }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Invoice Status Pie Chart - Takes 3 columns on large screens */}
        <Grid item xs={12} lg={3}>
          <Paper sx={{
            p: { xs: 2, sm: 3, md: 4 },
            height: { xs: 400, sm: 450, md: 500 },
            width: '100%',
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' }, fontWeight: 600 }}>
              Status Distribution
            </Typography>
            {statusData.length > 0 ? (
              <>
                <Box sx={{ flex: 1, minHeight: 200, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 40 : isTablet ? 45 : 50}
                        outerRadius={isMobile ? 60 : isTablet ? 65 : 70}
                        paddingAngle={3}
                        dataKey="value"
                        label={!isMobile ? ({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%` : undefined
                        }
                        labelLine={!isMobile}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8
                        }}
                        formatter={(value) => [value, 'Invoices']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  {statusData.map((item, index) => (
                    <Box
                      key={item.name}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        bgcolor: theme.palette.action.hover,
                        borderRadius: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: COLORS[index],
                            mr: 1.5,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.9rem', sm: '0.95rem' }, fontWeight: 500 }}>
                          {item.name}:
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ fontSize: { xs: '0.9rem', sm: '0.95rem' } }}
                      >
                        {item.value} ({((item.value / stats.totalInvoices) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                <Typography color="textSecondary">No invoice data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Monthly Invoice Volume Bar Chart - Full width */}
        <Grid item xs={12}>
          <Paper sx={{
            p: { xs: 2, sm: 3, md: 4 },
            height: { xs: 450, sm: 500, md: 550 },
            width: '100%',
            borderRadius: 3,
            boxShadow: theme.shadows[2]
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' }, fontWeight: 600, mb: 3 }}>
              Monthly Invoice Volume
            </Typography>
            <Box sx={{ width: '100%', height: 'calc(100% - 70px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: isMobile ? 10 : 40,
                    left: isMobile ? 0 : 30,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: isMobile ? 11 : 14, fill: theme.palette.text.secondary }}
                    interval={0}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#8884d8"
                    tick={{ fontSize: isMobile ? 11 : 14, fill: theme.palette.text.secondary }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#82ca9d"
                    tick={{ fontSize: isMobile ? 11 : 14, fill: theme.palette.text.secondary }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: isMobile ? 11 : 14,
                      paddingTop: 20
                    }}
                  />
                  <Bar yAxisId="left" dataKey="invoices" name="Number of Invoices" fill="#8884d8" barSize={isMobile ? 30 : 50} />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#82ca9d" barSize={isMobile ? 30 : 50} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Invoices List */}
        {stats.recentInvoices && stats.recentInvoices.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 3,
              boxShadow: theme.shadows[2]
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' }, fontWeight: 600, mb: 3 }}>
                Recent Invoices
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '16px', borderBottom: `2px solid ${theme.palette.divider}` }}>Invoice #</th>
                      <th style={{ textAlign: 'left', padding: '16px', borderBottom: `2px solid ${theme.palette.divider}` }}>Customer</th>
                      <th style={{ textAlign: 'left', padding: '16px', borderBottom: `2px solid ${theme.palette.divider}` }}>Date</th>
                      <th style={{ textAlign: 'right', padding: '16px', borderBottom: `2px solid ${theme.palette.divider}` }}>Amount</th>
                      <th style={{ textAlign: 'left', padding: '16px', borderBottom: `2px solid ${theme.palette.divider}` }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                        style={{
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.palette.action.hover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '16px' }}>{invoice.invoiceNumber}</td>
                        <td style={{ padding: '16px' }}>{invoice.customer?.name || 'N/A'}</td>
                        <td style={{ padding: '16px' }}>
                          {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>
                          ${invoice.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <Chip
                            label={invoice.status}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              minWidth: 80
                            }}
                            color={
                              invoice.status === 'PAID' ? 'success' :
                              invoice.status === 'PENDING' ? 'warning' :
                              invoice.status === 'OVERDUE' ? 'error' : 'default'
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  onClick={() => navigate('/invoices')}
                  size="large"
                  variant="outlined"
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  View All Invoices
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;