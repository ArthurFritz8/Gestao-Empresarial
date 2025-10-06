const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const saleRoutes = require('./routes/sale.routes');
const reportRoutes = require('./routes/report.routes');
const uploadRoutes = require('./routes/upload.routes'); // Nova rota de upload

// Inicializar app
const app = express();

// Conectar ao banco de dados
connectDB();

// Configuração CORS mais específica
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Rota para teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes); // Adicionando rota de upload

// Rota de verificação de status da API
app.get('/api/status', (req, res) => {
  res.json({ message: 'API funcionando corretamente!' });
});

// Servir arquivos estáticos em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// Definir porta
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});