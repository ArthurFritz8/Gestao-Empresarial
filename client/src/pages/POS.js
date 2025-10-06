import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Divider, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Badge,
  Chip,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Delete as DeleteIcon, 
  AddShoppingCart as AddShoppingCartIcon,
  Search as SearchIcon,
  QrCodeScanner as ScannerIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import api from '../utils/api';

const useStyles = styled((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    height: 'calc(100vh - 120px)',
    display: 'flex',
    flexDirection: 'column',
  },
  cartList: {
    flexGrow: 1,
    overflow: 'auto',
    marginTop: theme.spacing(2)
  },
  totalSection: {
    marginTop: 'auto',
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  totalText: {
    fontWeight: 'bold',
  },
  productSearch: {
    marginBottom: theme.spacing(2),
  },
  productGrid: {
    marginTop: theme.spacing(2),
    maxHeight: 'calc(100vh - 280px)',
    overflow: 'auto'
  },
  productCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
    }
  },
  productImage: {
    height: 140,
    objectFit: 'contain',
    backgroundColor: '#f5f5f5'
  },
  cardContent: {
    flexGrow: 1,
    padding: theme.spacing(1, 2),
  },
  productPrice: {
    fontWeight: 'bold',
    color: theme.palette.primary.main
  },
  productStock: {
    marginTop: theme.spacing(1)
  },
  cartItem: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    margin: theme.spacing(1, 0),
    backgroundColor: theme.palette.background.default
  },
  cartItemText: {
    '& .MuiTypography-primary': {
      fontWeight: 500
    }
  },
  scanButton: {
    marginLeft: theme.spacing(1)
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center'
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(5),
  },
  quantityField: {
    width: 60,
    textAlign: 'center'
  },
  originalLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1
  }
}));

function POS() {
  const classes = useStyles();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Buscar produtos reais do banco de dados
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/products');
        console.log('Produtos carregados para PDV:', response.data.data);
        setProducts(response.data.data || []);
        setFilteredProducts(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar produtos para PDV:', error);
        setError('Erro ao carregar produtos. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtra produtos conforme o usuário digita no campo de busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.partNumber && product.partNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.carBrand && product.carBrand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.carModel && product.carModel.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleAddToCart = (productToAdd) => {
    const productId = productToAdd._id;
    const existingItem = cart.find(item => item._id === productId);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
    
    setSelectedProduct(null);
    setSearchTerm('');
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      setCart(cart.map(item => 
        item._id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      ));
    } else {
      handleRemoveFromCart(productId);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.sellingPrice * item.quantity, 0);
  };

  const handleFinalizeSale = async () => {
    if (cart.length === 0) return;
    
    setSaveLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const saleData = {
        items: cart.map(item => ({ 
          product: item._id, 
          quantity: item.quantity, 
          price: item.sellingPrice, 
          name: item.name, 
          totalPrice: item.sellingPrice * item.quantity 
        })),
        totalAmount: calculateTotal(),
        paymentMethod: paymentMethod,
      };
      
      // Chamar a API para salvar a venda
      const response = await api.post('/api/sales', saleData);
      
      // Atualizar o estoque de cada produto vendido
      for (const item of cart) {
        await api.put(`/api/products/${item._id}`, {
          stock: item.stock - item.quantity
        });
      }
      
      setSuccessMessage('Venda finalizada com sucesso!');
      setCart([]); // Limpar carrinho após a venda
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Erro ao finalizar venda:', err);
      setError('Erro ao finalizar venda. Por favor, tente novamente.');
    } finally {
      setSaveLoading(false);
    }
  };

  const getCompatibilityText = (product) => {
    if (product.carBrand && product.carModel) {
      return `${product.carBrand} ${product.carModel}${product.year ? ` (${product.year})` : ''}`;
    }
    return product.compatibility ? product.compatibility.join(', ') : '';
  };

  if (loading) {
    return (
      <div className={classes.loader}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Grid container spacing={2} className={classes.root}>
      {/* Lado Esquerdo: Catálogo de Produtos */}
      <Grid item xs={12} md={8}>
        <Paper className={classes.paper}>
          <Typography variant="h5" gutterBottom>
            Catálogo de Peças
          </Typography>

          <Box className={classes.searchBox}>
            <TextField
              fullWidth
              label="Buscar peça por nome, código ou compatibilidade"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" style={{ marginRight: 8 }} />
              }}
            />
            <Button 
              variant="contained" 
              className={classes.scanButton}
              startIcon={<ScannerIcon />}
              onClick={() => alert('Funcionalidade de scanner em desenvolvimento')}
            >
              Scan
            </Button>
          </Box>

          {error && (
            <Alert severity="error" style={{ marginTop: 16 }}>
              {error}
            </Alert>
          )}

          {filteredProducts.length === 0 ? (
            <Box textAlign="center" my={4}>
              <Typography variant="body1" color="textSecondary">
                Nenhum produto encontrado. Tente outra busca.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2} className={classes.productGrid}>
              {filteredProducts.map(product => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <Card 
                    className={classes.productCard} 
                    onClick={() => handleAddToCart(product)}
                    variant="outlined"
                  >
                    {product.isOriginal && (
                      <Chip 
                        label="Original" 
                        color="secondary" 
                        size="small"
                        className={classes.originalLabel}
                      />
                    )}
                    <CardMedia
                      component="img"
                      className={classes.productImage}
                      image={product.imageUrl || '/images/default-part.jpg'}
                      alt={product.name}
                    />
                    <CardContent className={classes.cardContent}>
                      <Typography variant="subtitle1" component="h3">
                        {product.name}
                      </Typography>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {product.partNumber || product.sku || 'Sem código'}
                      </Typography>
                      
                      {getCompatibilityText(product) && (
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <small>Para: {getCompatibilityText(product)}</small>
                        </Typography>
                      )}
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="h6" className={classes.productPrice}>
                          R$ {product.sellingPrice.toFixed(2)}
                        </Typography>
                        
                        <Chip 
                          size="small" 
                          label={`${product.stock} un`}
                          color={product.stock <= product.minStock ? "warning" : "default"}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Grid>

      {/* Lado Direito: Carrinho de Compras */}
      <Grid item xs={12} md={4}>
        <Paper className={classes.paper}>
          <Typography variant="h5" gutterBottom>
            Carrinho de Compras
          </Typography>
          
          {successMessage && (
            <Alert severity="success" style={{ marginBottom: 16 }}>
              {successMessage}
            </Alert>
          )}
          
          {cart.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center"
              justifyContent="center"
              my={4}
            >
              <AddShoppingCartIcon style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
              <Typography variant="body1" color="textSecondary" align="center">
                Seu carrinho está vazio.
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Clique nos produtos ao lado para adicioná-los.
              </Typography>
            </Box>
          ) : (
            <List className={classes.cartList}>
              {cart.map(item => (
                <ListItem 
                  key={item._id} 
                  className={classes.cartItem}
                  divider
                >
                  <ListItemText 
                    primary={item.name}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="textPrimary">
                          R$ {item.sellingPrice.toFixed(2)} × {item.quantity} = R$ {(item.sellingPrice * item.quantity).toFixed(2)}
                        </Typography>
                        <br />
                        {getCompatibilityText(item) && (
                          <Typography component="span" variant="caption" color="textSecondary">
                            {getCompatibilityText(item)}
                          </Typography>
                        )}
                      </React.Fragment>
                    }
                    className={classes.cartItemText}
                  />
                  
                  <Box display="flex" alignItems="center">
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 0)}
                      className={classes.quantityField}
                      inputProps={{ min: 1, style: { textAlign: 'center' } }}
                      variant="outlined"
                      size="small"
                    />
                    
                    <IconButton edge="end" onClick={() => handleRemoveFromCart(item._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}

          <Box className={classes.totalSection}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1">Subtotal:</Typography>
              <Typography variant="subtitle1">R$ {calculateTotal().toFixed(2)}</Typography>
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="payment-method-label">Método de Pagamento</InputLabel>
              <Select
                labelId="payment-method-label"
                id="payment-method"
                value={paymentMethod}
                label="Método de Pagamento"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="cash">Dinheiro</MenuItem>
                <MenuItem value="credit">Cartão de Crédito</MenuItem>
                <MenuItem value="debit">Cartão de Débito</MenuItem>
                <MenuItem value="pix">PIX</MenuItem>
                <MenuItem value="transfer">Transferência Bancária</MenuItem>
              </Select>
            </FormControl>

            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              onClick={handleFinalizeSale}
              disabled={cart.length === 0 || saveLoading}
              startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : null}
              style={{ marginTop: 16 }}
            >
              {saveLoading ? 'Processando...' : 'Finalizar Venda'}
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default POS;