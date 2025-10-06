const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, informe o nome do produto'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  sku: {
    type: String,
    trim: true,
    maxlength: [50, 'SKU não pode ter mais de 50 caracteres'],
    // SKU não é mais obrigatório
  },
  description: {
    type: String,
    trim: true
  },
  partNumber: {
    type: String,
    trim: true,
    index: true
  },
  brand: {
    type: String,
    trim: true,
    required: [true, 'Por favor, informe a marca da peça']
  },
  category: {
    type: String,
    required: [true, 'Por favor, informe a categoria do produto'],
    enum: [
      'Motor', 
      'Freios', 
      'Suspensão', 
      'Transmissão', 
      'Elétrica', 
      'Carroceria', 
      'Arrefecimento',
      'Direção',
      'Injeção',
      'Escapamento',
      'Filtros',
      'Acessórios',
      'Outros'
    ]
  },
  compatibility: [{
    make: String,
    model: String,
    year: String,
    engineType: String
  }],
  location: {
    type: String,
    trim: true
  },
  costPrice: {
    type: Number,
    required: [true, 'Por favor, informe o preço de custo']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Por favor, informe o preço de venda']
  },
  stock: {
    type: Number,
    required: [true, 'Por favor, informe a quantidade em estoque'],
    min: [0, 'Estoque não pode ser negativo']
  },
  minStock: {
    type: Number,
    default: 1
  },
  supplier: {
    name: String,
    code: String,
    contact: String
  },
  imageUrl: {
    type: String,
    default: '/images/default-part.jpg'
  },
  isOriginal: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware para atualizar updatedAt automaticamente
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtuals para cálculos úteis
ProductSchema.virtual('profit').get(function() {
  return this.sellingPrice - this.costPrice;
});

ProductSchema.virtual('profitMargin').get(function() {
  if (this.sellingPrice === 0) return 0;
  return ((this.sellingPrice - this.costPrice) / this.sellingPrice) * 100;
});

ProductSchema.virtual('stockValue').get(function() {
  return this.sellingPrice * this.stock;
});

module.exports = mongoose.model('Product', ProductSchema);