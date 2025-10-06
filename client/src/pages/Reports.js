import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress, 
  Chip 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

// Registrando componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const useStyles = styled((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(5),
  },
  chartContainer: {
    height: 400,
    marginTop: theme.spacing(3),
  },
  table: {
    marginTop: theme.spacing(3),
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

function Reports() {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [salesReport, setSalesReport] = useState([]);
  const [stockReport, setStockReport] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        // Simulando dados
        const mockSales = [
          { id: 1, createdAt: '2023-10-27T10:00:00Z', totalAmount: 249.89, paymentMethod: 'credit', createdBy: { name: 'Admin' } },
          { id: 2, createdAt: '2023-10-27T11:30:00Z', totalAmount: 59.90, paymentMethod: 'debit', createdBy: { name: 'Admin' } },
        ];
        const mockStock = [
          { id: 1, name: 'Produto A', category: 'Eletrônicos', stock: 15, minStock: 5, status: 'ok' },
          { id: 3, name: 'Produto C', category: 'Alimentos', stock: 5, minStock: 10, status: 'low' },
          { id: 4, name: 'Produto D', category: 'Roupas', stock: 0, minStock: 5, status: 'out' },
        ];
        
        setTimeout(() => {
          setSalesReport(mockSales);
          setStockReport(mockStock);
          setLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const salesChartData = {
    labels: salesReport.map(sale => new Date(sale.createdAt).toLocaleDateString()),
    datasets: [{
      label: 'Total de Vendas (R$)',
      data: salesReport.map(sale => sale.totalAmount),
      backgroundColor: '#1a237e',
    }],
  };

  if (loading) {
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Paper className={classes.root} elevation={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Relatórios
      </Typography>
      <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
        <Tab label="Relatório de Vendas" />
        <Tab label="Relatório de Estoque" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <Typography variant="h6">Vendas por Período</Typography>
        <div className={classes.chartContainer}>
          <Bar data={salesChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <TableContainer component={Paper} className={classes.table}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Total (R$)</TableCell>
                <TableCell>Pagamento</TableCell>
                <TableCell>Vendedor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesReport.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{sale.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{sale.paymentMethod}</TableCell>
                  <TableCell>{sale.createdBy.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <Typography variant="h6">Situação do Estoque</Typography>
        <TableContainer component={Paper} className={classes.table}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="right">Estoque Atual</TableCell>
                <TableCell align="right">Estoque Mínimo</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockReport.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">{product.stock}</TableCell>
                  <TableCell align="right">{product.minStock}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={product.status === 'ok' ? 'OK' : product.status === 'low' ? 'Baixo' : 'Esgotado'}
                      color={product.status === 'ok' ? 'success' : product.status === 'low' ? 'warning' : 'error'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Paper>
  );
}

export default Reports;