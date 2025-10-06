import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Grid, 
  CircularProgress, 
  Box, 
  Alert,
  MenuItem,
  Divider,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  DriveEta as CarIcon,
  Engineering as PartIcon,
  AddBox as AddCompatibilityIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import api from '../utils/api';

const useStyles = styled((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  form: {
    marginTop: theme.spacing(3),
  },
  buttonContainer: {
    marginTop: theme.spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
  },
  sectionTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    }
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  compatibilityItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  addCompatibilityButton: {
    marginTop: theme.spacing(1),
  },
  imagePreview: {
    width: '100%', 
    height: 200, 
    objectFit: 'contain', 
    border: '1px dashed #ccc',
    borderRadius: 8,
    padding: 8
  },
  imagePlaceholder: {
    width: '100%', 
    height: 200, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    border: '1px dashed #ccc', 
    borderRadius: 8,
    backgroundColor: '#f5f5f5'
  }
}));

// Lista de marcas de carros populares
const carBrands = [
  'Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Nissan', 
  'Peugeot', 'Renault', 'Toyota', 'Volkswagen', 'Citroën', 'BMW', 'Mercedes-Benz', 
  'Audi', 'Mitsubishi', 'Kia', 'Suzuki', 'Chery', 'JAC', 'Caoa'
];

// Lista de categorias para peças automotivas
const autoPartCategories = [
  'Motor', 'Suspensão', 'Freios', 'Transmissão', 'Elétrica', 
  'Iluminação', 'Carroceria', 'Interior', 'Filtros', 'Arrefecimento',
  'Direção', 'Ignição', 'Combustível', 'Embreagem', 'Escapamento'
];

function ProductForm() {
  const classes = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [compatibility, setCompatibility] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    sku: '',
    partNumber: '',
    description: '',
    brand: '',
    carBrand: '',
    carModel: '',
    year: '',
    compatibility: [],
    costPrice: '',
    sellingPrice: '',
    category: '',
    stock: '',
    minStock: '',
    location: '',
    supplier: '',
    isOriginal: false,
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api.get(`/api/products/${id}`)
        .then(response => {
          console.log("Produto carregado:", response.data.data);
          const productData = response.data.data;
          setProduct(productData);
          setCompatibility(productData.compatibility || []);
          setImagePreview(productData.imageUrl || '');
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao carregar produto:", err);
          setError("Erro ao carregar dados do produto. Por favor, tente novamente.");
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setProduct({ 
      ...product, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleCompatibilityChange = (event, newValue) => {
    setCompatibility(newValue);
    setProduct({ ...product, compatibility: newValue });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const productData = { 
        ...product,
        compatibility: compatibility
      };
      
      let response;
      let uploadedImageUrl = product.imageUrl;
      
      // Se tem um arquivo de imagem, fazer upload primeiro
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const imageResponse = await api.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        uploadedImageUrl = imageResponse.data.imageUrl;
        productData.imageUrl = uploadedImageUrl;
      }
      
      if (isEditing) {
        response = await api.put(`/api/products/${id}`, productData);
        console.log('Produto atualizado:', response.data);
        setSuccess("Produto atualizado com sucesso!");
        
        setTimeout(() => {
          navigate('/products?action=updated');
        }, 1000);
      } else {
        response = await api.post('/api/products', productData);
        console.log('Produto criado:', response.data);
        setSuccess("Produto criado com sucesso!");
        
        setTimeout(() => {
          navigate('/products?action=created');
        }, 1000);
      }
      
      setLoading(false);

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Erro ao salvar produto. Verifique os campos.');
      console.error(err);
    }
  };
  
  if (loading && isEditing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper className={classes.root} elevation={3}>
      <Typography variant="h4" component="h1">
        {isEditing ? 'Editar Peça' : 'Adicionar Nova Peça'}
      </Typography>

      {error && <Alert severity="error" style={{ marginTop: 20 }}>{error}</Alert>}
      {success && <Alert severity="success" style={{ marginTop: 20 }}>{success}</Alert>}

      <form className={classes.form} onSubmit={handleSubmit}>
        {/* Informações básicas da peça */}
        <Typography variant="h6" className={classes.sectionTitle}>
          <PartIcon /> Informações da Peça
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <TextField
              name="name"
              label="Nome da Peça"
              value={product.name || ''}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="partNumber"
              label="Número da Peça"
              value={product.partNumber || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="sku"
              label="Código de Barras (opcional)"
              value={product.sku || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              helperText="Este campo é opcional"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="category"
              label="Categoria"
              value={product.category || ''}
              onChange={handleChange}
              select
              fullWidth
              required
              variant="outlined"
            >
              {autoPartCategories.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="brand"
              label="Marca da Peça"
              value={product.brand || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="description"
              label="Descrição"
              value={product.description || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />
          </Grid>
          
          {/* Upload de imagem */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Imagem do Produto
            </Typography>
            
            <Box display="flex" flexDirection="column" alignItems="center">
              {imagePreview ? (
                <Box mb={2} position="relative" width="100%">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className={classes.imagePreview}
                  />
                </Box>
              ) : (
                <Box mb={2} className={classes.imagePlaceholder}>
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma imagem selecionada
                  </Typography>
                </Box>
              )}
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
              >
                {imagePreview ? 'Trocar Imagem' : 'Carregar Imagem'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={product.isOriginal || false}
                  onChange={handleChange}
                  name="isOriginal"
                  color="primary"
                />
              }
              label="Peça Original"
            />
          </Grid>
        </Grid>
        
        <Divider className={classes.divider} />
        
        {/* Compatibilidade com veículos */}
        <Typography variant="h6" className={classes.sectionTitle}>
          <CarIcon /> Compatibilidade com Veículos
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              name="carBrand"
              label="Marca Principal"
              value={product.carBrand || ''}
              onChange={handleChange}
              select
              fullWidth
              variant="outlined"
            >
              {carBrands.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="carModel"
              label="Modelo Principal"
              value={product.carModel || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="year"
              label="Ano/Período"
              value={product.year || ''}
              onChange={handleChange}
              fullWidth
              placeholder="Ex: 2010-2015"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              id="compatibility"
              options={[]}
              value={compatibility || []}
              onChange={handleCompatibilityChange}
              freeSolo
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option}
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Outros Carros Compatíveis"
                  placeholder="Digite e pressione Enter"
                  helperText="Ex: Fiat Uno 2015, VW Gol G5, etc."
                />
              )}
            />
          </Grid>
        </Grid>
        
        <Divider className={classes.divider} />
        
        {/* Informações de estoque e preços */}
        <Typography variant="h6" className={classes.sectionTitle}>
          Estoque e Preços
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              name="costPrice"
              label="Preço de Custo (R$)"
              value={product.costPrice || ''}
              onChange={handleChange}
              type="number"
              InputProps={{
                inputProps: { min: 0, step: "0.01" }
              }}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="sellingPrice"
              label="Preço de Venda (R$)"
              value={product.sellingPrice || ''}
              onChange={handleChange}
              type="number"
              InputProps={{
                inputProps: { min: 0, step: "0.01" }
              }}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="location"
              label="Localização no Estoque"
              value={product.location || ''}
              onChange={handleChange}
              placeholder="Ex: Prateleira A3, Gaveta 5"
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="stock"
              label="Estoque Atual"
              value={product.stock || ''}
              onChange={handleChange}
              type="number"
              InputProps={{
                inputProps: { min: 0 }
              }}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="minStock"
              label="Estoque Mínimo"
              value={product.minStock || ''}
              onChange={handleChange}
              type="number"
              InputProps={{
                inputProps: { min: 0 }
              }}
              fullWidth
              variant="outlined"
              helperText="Quantidade mínima antes de alertar para reposição"
            />
          </Grid>
        </Grid>

        <Box className={classes.buttonContainer}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? null : <SaveIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Atualizar Peça' : 'Salvar Peça')}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default ProductForm;