import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  CircularProgress, 
  TextField, 
  InputAdornment,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Collapse,
  Divider,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DriveEta as CarIcon,
  Engineering as PartIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from '../utils/api';

const useStyles = styled((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(5),
  },
  searchBar: {
    marginBottom: theme.spacing(2),
  },
  filterContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  filterIcon: {
    marginRight: theme.spacing(1),
  },
  expandIcon: {
    marginLeft: theme.spacing(1),
  },
  lowStock: {
    backgroundColor: theme.palette.warning.light,
  },
  noStock: {
    backgroundColor: theme.palette.error.light,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  brandLogo: {
    height: 24,
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    }
  },
  refreshButton: {
    marginLeft: theme.spacing(1),
  }
}));

// Lista de marcas de carros populares
const carBrands = [
  'Todos', 'Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Nissan', 
  'Peugeot', 'Renault', 'Toyota', 'Volkswagen', 'Citroën', 'BMW', 'Mercedes-Benz', 
  'Audi', 'Mitsubishi', 'Kia', 'Suzuki', 'Chery', 'JAC', 'Caoa'
];

// Lista de categorias para peças automotivas
const autoPartCategories = [
  'Todos', 'Motor', 'Suspensão', 'Freios', 'Transmissão', 'Elétrica', 
  'Iluminação', 'Carroceria', 'Interior', 'Filtros', 'Arrefecimento',
  'Direção', 'Ignição', 'Combustível', 'Embreagem', 'Escapamento'
];

function Products() {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    brand: 'Todos',
    category: 'Todos',
    stockStatus: 'Todos'
  });
  const [notification, setNotification] = useState(null);

  // Função para buscar produtos - extraída para poder ser reutilizada
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products');
      console.log('Produtos carregados:', response.data.data);
      setProducts(response.data.data);
      setLoading(false);

      // Verificar se há uma mensagem na URL de redirecionamento
      const params = new URLSearchParams(location.search);
      const action = params.get('action');
      
      if (action === 'created') {
        setNotification({
          type: 'success',
          message: 'Produto cadastrado com sucesso!'
        });
      } else if (action === 'updated') {
        setNotification({
          type: 'success',
          message: 'Produto atualizado com sucesso!'
        });
      }

      // Limpar a notificação após 5 segundos
      if (action) {
        setTimeout(() => {
          setNotification(null);
          // Limpar os parâmetros da URL para não mostrar a mensagem novamente ao atualizar
          navigate('/products', { replace: true });
        }, 5000);
      }

    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setLoading(false);
      setNotification({
        type: 'error',
        message: 'Erro ao carregar produtos. Por favor, tente novamente.'
      });
    }
  };

  // Carregar produtos quando o componente montar ou quando voltar para esta página
  useEffect(() => {
    fetchProducts();
  }, [location.search]); // Recarregar quando a URL mudar (após redirecionar de outras páginas)

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/api/products/${id}`);
        // Recarregar a lista após excluir
        fetchProducts();
        setNotification({
          type: 'success',
          message: 'Produto excluído com sucesso!'
        });
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        setNotification({
          type: 'error',
          message: 'Erro ao excluir produto. Por favor, tente novamente.'
        });
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    // Filtro de texto (busca)
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.partNumber && product.partNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro por marca
    const matchesBrand = 
      filters.brand === 'Todos' || 
      product.carBrand === filters.brand;
    
    // Filtro por categoria
    const matchesCategory = 
      filters.category === 'Todos' || 
      product.category === filters.category;
    
    // Filtro por status do estoque
    let matchesStock = true;
    if (filters.stockStatus === 'Baixo') {
      matchesStock = product.stock <= product.minStock && product.stock > 0;
    } else if (filters.stockStatus === 'Esgotado') {
      matchesStock = product.stock === 0;
    } else if (filters.stockStatus === 'Normal') {
      matchesStock = product.stock > product.minStock;
    }
    
    return matchesSearch && matchesBrand && matchesCategory && matchesStock;
  });

  const handleRefresh = () => {
    fetchProducts();
  };

  if (loading && products.length === 0) {
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Paper className={classes.root} elevation={3}>
      <div className={classes.header}>
        <Typography variant="h4" component="h1">
          Gerenciar Peças Automotivas
        </Typography>
        <Box display="flex">
          <IconButton 
            color="primary" 
            onClick={handleRefresh} 
            className={classes.refreshButton}
            title="Atualizar lista"
          >
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/products/new')}
          >
            Adicionar Peça
          </Button>
        </Box>
      </div>

      {notification && (
        <Alert 
          severity={notification.type} 
          onClose={() => setNotification(null)}
          style={{ marginBottom: 16 }}
        >
          {notification.message}
        </Alert>
      )}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por nome, código ou número da peça..."
        className={classes.searchBar}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <div className={classes.filterButton} onClick={toggleFilters}>
        <FilterIcon className={classes.filterIcon} />
        <Typography variant="subtitle1">
          Filtros Avançados
        </Typography>
        {showFilters ? (
          <ExpandLessIcon className={classes.expandIcon} />
        ) : (
          <ExpandMoreIcon className={classes.expandIcon} />
        )}
      </div>

      <Collapse in={showFilters}>
        <Paper className={classes.filterContainer} variant="outlined">
          <Typography variant="subtitle1" className={classes.sectionTitle} gutterBottom>
            <CarIcon /> Filtrar Peças
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Marca do Veículo</InputLabel>
                <Select
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  label="Marca do Veículo"
                >
                  {carBrands.map(brand => (
                    <MenuItem key={brand} value={brand}>
                      {brand}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Categoria</InputLabel>
                <Select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  label="Categoria"
                >
                  {autoPartCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status do Estoque</InputLabel>
                <Select
                  name="stockStatus"
                  value={filters.stockStatus}
                  onChange={handleFilterChange}
                  label="Status do Estoque"
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  <MenuItem value="Normal">Estoque Normal</MenuItem>
                  <MenuItem value="Baixo">Estoque Baixo</MenuItem>
                  <MenuItem value="Esgotado">Esgotado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      <Typography variant="body2" style={{ marginBottom: 16 }}>
        {filteredProducts.length} {filteredProducts.length === 1 ? 'peça encontrada' : 'peças encontradas'}
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      <TableContainer className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código/Número da Peça</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Veículo</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell align="right">Estoque</TableCell>
              <TableCell align="right">Preço de Venda</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.minStock && product.stock > 0;
                const isOutOfStock = product.stock === 0;
                
                return (
                  <TableRow 
                    key={product._id} 
                    className={
                      isOutOfStock ? classes.noStock : 
                      isLowStock ? classes.lowStock : ''
                    }
                    hover
                  >
                    <TableCell>
                      {product.partNumber || product.sku || '-'}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      {product.carBrand && (
                        <>
                          <strong>{product.carBrand}</strong> 
                          {product.carModel && ` ${product.carModel}`}
                          {product.year && ` (${product.year})`}
                        </>
                      )}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">
                      {isOutOfStock ? (
                        <Chip size="small" label="Sem estoque" color="error" />
                      ) : isLowStock ? (
                        <Chip size="small" label="Baixo" color="warning" />
                      ) : (
                        product.stock
                      )}
                    </TableCell>
                    <TableCell align="right">R$ {Number(product.sellingPrice).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => navigate(`/products/edit/${product._id}`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteProduct(product._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma peça encontrada. Tente ajustar os filtros ou cadastrar novas peças.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default Products;