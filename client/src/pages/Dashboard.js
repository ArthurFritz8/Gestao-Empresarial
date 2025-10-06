import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Box,
  IconButton,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Chip,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  ShowChart as ShowChartIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Refresh as RefreshIcon,
  DriveEta as CarIcon
} from '@mui/icons-material';

import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import api from '../utils/api';

// Registrando componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const useStyles = styled((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(3),
    height: '100%',
    borderRadius: theme.shape.borderRadius,
  },
  cardHeader: {
    paddingBottom: 0,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 500,
    color: theme.palette.primary.main,
  },
  statLabel: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  chartContainer: {
    height: 300,
    position: 'relative',
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
  },
  statIcon: {
    fontSize: 48,
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    padding: theme.spacing(1),
    borderRadius: '50%',
    '& svg': {
      fontSize: 32,
      color: theme.palette.primary.contrastText,
    }
  },
  statContent: {
    flex: 1,
  },
  refreshButton: {
    marginLeft: theme.spacing(1),
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
  },
  headerWithIcon: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    }
  },
  infoList: {
    maxHeight: 400,
    overflow: 'auto',
  },
  carBrandIcon: {
    width: 32,
    height: 32,
    backgroundColor: theme.palette.grey[200],
    borderRadius: '50%',
  },
  brandRank: {
    minWidth: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
  }
}));

function Dashboard() {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    dailyRevenue: 0,
    totalProducts: 0,
    lowStockItems: 0,
    monthlySales: [],
    topCategories: [],
    recentSales: [],
    lowStockProducts: [],
    topCarBrands: []
  });

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Obter estatísticas de produtos
      const productsResponse = await api.get('/api/products/stats');
      
      // Obter vendas recentes
      const salesResponse = await api.get('/api/sales?limit=5');
      
      // Obter produtos com estoque baixo
      const lowStockResponse = await api.get('/api/products?stockStatus=low&limit=5');
      
      // Obter compatibilidade de veículos
      const compatibilityResponse = await api.get('/api/products/vehicle-compatibility');
      
      // Calcular faturamento diário
      const today = new Date().toISOString().split('T')[0];
      const dailyRevenueResponse = await api.get(`/api/sales/daily-revenue?date=${today}`);

      // Montar dados para o dashboard
      const data = {
        // Estatísticas gerais
        totalProducts: productsResponse.data.data.general.count || 0,
        totalStockValue: productsResponse.data.data.general.totalStockValue || 0,
        lowStockItems: productsResponse.data.data.general.lowStock || 0,
        
        // Vendas por mês
        monthlySales: salesResponse.data.monthlySales || [],
        
        // Categorias mais populares
        topCategories: productsResponse.data.data.categories || [],
        
        // Vendas recentes
        recentSales: salesResponse.data.data || [],
        
        // Produtos com estoque baixo
        lowStockProducts: lowStockResponse.data.data || [],
        
        // Marcas de carros mais comuns
        topCarBrands: compatibilityResponse.data.data.makes.slice(0, 10) || [],
        
        // Faturamento diário
        dailyRevenue: dailyRevenueResponse.data.revenue || 0
      };
      
      console.log('Dados do Dashboard:', data);
      setDashboardData(data);
      setLoading(false);
      setRefreshing(false);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Configuração do gráfico de barras (vendas mensais)
  const barChartData = {
    labels: dashboardData.monthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Vendas Mensais (R$)',
        data: dashboardData.monthlySales.map(item => item.value),
        backgroundColor: '#1E3A8A',
        borderColor: '#2C5282',
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
  };

  // Configuração do gráfico de pizza (categorias)
  const pieChartData = {
    labels: dashboardData.topCategories.map(item => item._id),
    datasets: [
      {
        label: 'Produtos por Categoria',
        data: dashboardData.topCategories.map(item => item.count),
        backgroundColor: [
          '#1E3A8A', // Azul escuro
          '#ED6C02', // Laranja
          '#2C5282', // Azul médio
          '#F59E0B', // Laranja médio
          '#3182CE', // Azul claro
          '#D97706', // Laranja escuro
          '#63B3ED', // Azul mais claro
          '#FBBF24', // Amarelo
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false,
      },
    },
  };

  if (loading) {
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Box className={classes.sectionHeader}>
        <Typography variant="h4">
          Dashboard
        </Typography>
        <Tooltip title="Atualizar dados">
          <IconButton 
            onClick={handleRefresh}
            className={classes.refreshButton}
            disabled={refreshing}
          >
            {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Cards de métricas */}
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper className={classes.statCard} elevation={2}>
            <Box className={classes.statIcon}>
              <MoneyIcon />
            </Box>
            <Box className={classes.statContent}>
              <Typography variant="body2" className={classes.statLabel}>
                Faturamento do Dia
              </Typography>
              <Typography variant="h4" className={classes.statValue}>
                R$ {dashboardData.dailyRevenue.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper className={classes.statCard} elevation={2}>
            <Box className={classes.statIcon}>
              <InventoryIcon />
            </Box>
            <Box className={classes.statContent}>
              <Typography variant="body2" className={classes.statLabel}>
                Total de Itens em Estoque
              </Typography>
              <Typography variant="h4" className={classes.statValue}>
                {dashboardData.totalProducts}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            className={classes.statCard} 
            elevation={2} 
            style={{ backgroundColor: dashboardData.lowStockItems > 0 ? '#fff8e1' : '#ffffff' }}
          >
            <Box className={classes.statIcon} style={{ backgroundColor: dashboardData.lowStockItems > 0 ? '#F59E0B' : '#4caf50' }}>
              <WarningIcon />
            </Box>
            <Box className={classes.statContent}>
              <Typography variant="body2" className={classes.statLabel}>
                Alertas de Estoque Baixo
              </Typography>
              <Typography variant="h4" className={classes.statValue} style={{ color: dashboardData.lowStockItems > 0 ? '#F59E0B' : '#4caf50' }}>
                {dashboardData.lowStockItems}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Gráficos e Listas */}
      <Grid container spacing={3}>
        {/* Gráfico de Vendas */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title={
                <Box className={classes.headerWithIcon}>
                  <ShowChartIcon />
                  <Typography variant="h6">Vendas Mensais</Typography>
                </Box>
              }
              className={classes.cardHeader}
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <div className={classes.chartContainer}>
                {dashboardData.monthlySales.length > 0 ? (
                  <Bar data={barChartData} options={barChartOptions} />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="textSecondary">
                      Nenhum dado de venda disponível
                    </Typography>
                  </Box>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Gráfico de Categorias */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title={
                <Box className={classes.headerWithIcon}>
                  <CategoryIcon />
                  <Typography variant="h6">Categorias</Typography>
                </Box>
              }
              className={classes.cardHeader}
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              <div className={classes.chartContainer}>
                {dashboardData.topCategories.length > 0 ? (
                  <Pie data={pieChartData} options={pieChartOptions} />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="textSecondary">
                      Nenhuma categoria disponível
                    </Typography>
                  </Box>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Vendas Recentes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Box className={classes.headerWithIcon}>
                  <CartIcon />
                  <Typography variant="h6">Vendas Recentes</Typography>
                </Box>
              }
              className={classes.cardHeader}
            />
            <CardContent>
              <List className={classes.infoList}>
                {dashboardData.recentSales.length > 0 ? (
                  dashboardData.recentSales.map((sale, index) => (
                    <React.Fragment key={sale._id || index}>
                      <ListItem>
                        <ListItemText
                          primary={`Venda #${sale._id?.substr(-5) || index + 1}`}
                          secondary={`${new Date(sale.createdAt).toLocaleString()} - ${sale.items?.length || 0} itens`}
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            label={`R$ ${sale.totalAmount?.toFixed(2) || '0.00'}`} 
                            color="primary" 
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < dashboardData.recentSales.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="Nenhuma venda recente" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Produtos com Estoque Baixo */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Box className={classes.headerWithIcon}>
                  <WarningIcon />
                  <Typography variant="h6">Produtos com Estoque Baixo</Typography>
                </Box>
              }
              className={classes.cardHeader}
            />
            <CardContent>
              <List className={classes.infoList}>
                {dashboardData.lowStockProducts.length > 0 ? (
                  dashboardData.lowStockProducts.map((product, index) => (
                    <React.Fragment key={product._id || index}>
                      <ListItem>
                        <ListItemText
                          primary={product.name}
                          secondary={`${product.partNumber || product.sku || 'Sem código'} - ${product.carBrand || ''} ${product.carModel || ''}`}
                        />
                        <ListItemSecondaryAction>
                          <Badge 
                            color={product.stock === 0 ? "error" : "warning"} 
                            badgeContent={product.stock} 
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < dashboardData.lowStockProducts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="Nenhum produto com estoque baixo" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Top Marcas de Carros */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={
                <Box className={classes.headerWithIcon}>
                  <CarIcon />
                  <Typography variant="h6">Marcas de Veículos Mais Comuns</Typography>
                </Box>
              }
              className={classes.cardHeader}
            />
            <CardContent>
              <Grid container spacing={2}>
                {dashboardData.topCarBrands.length > 0 ? (
                  dashboardData.topCarBrands.map((brand, index) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={brand}>
                      <Paper className={classes.statCard} elevation={1}>
                        <Typography className={classes.brandRank}>
                          {index + 1}
                        </Typography>
                        <Avatar alt={brand} src={`/images/car-logos/${brand.toLowerCase()}.png`} className={classes.carBrandIcon}>
                          {brand[0]}
                        </Avatar>
                        <Typography variant="body1" style={{ marginLeft: 8, fontWeight: 500 }}>
                          {brand}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="textSecondary" align="center">
                      Nenhuma marca de veículo cadastrada
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;