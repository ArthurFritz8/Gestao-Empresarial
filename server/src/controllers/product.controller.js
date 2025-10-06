const Product = require('../models/Product');

// @desc    Obter todos os produtos
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    // Construir query
    const query = { isActive: true };
    
    // Filtros
    if (req.query.category) query.category = req.query.category;
    if (req.query.brand) query.brand = { $regex: req.query.brand, $options: 'i' };
    if (req.query.name) query.name = { $regex: req.query.name, $options: 'i' };
    if (req.query.sku) query.sku = { $regex: req.query.sku, $options: 'i' };
    if (req.query.partNumber) query.partNumber = { $regex: req.query.partNumber, $options: 'i' };
    
    // Filtro por marca de carro
    if (req.query.make) {
      query['compatibility.make'] = { $regex: req.query.make, $options: 'i' };
    }
    // Filtro por modelo de carro
    if (req.query.model) {
      query['compatibility.model'] = { $regex: req.query.model, $options: 'i' };
    }

    // Configurar ordenação
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = {};
    sort[sortBy] = sortOrder;

    // Paginação
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;

    // Executar query
    const products = await Product.find(query)
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    // Contar total de resultados para paginação
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter produtos'
    });
  }
};

// @desc    Obter um produto pelo ID
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter produto'
    });
  }
};

// @desc    Criar um novo produto
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    
    // Erro de validação
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro ao criar produto'
    });
  }
};

// @desc    Atualizar um produto
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    // Adicionar data de atualização
    req.body.updatedAt = Date.now();
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    
    // Erro de validação
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar produto'
    });
  }
};

// @desc    Excluir um produto (soft delete)
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    // Soft delete - apenas marca como inativo em vez de remover do banco
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir produto'
    });
  }
};

// @desc    Obter estatísticas dos produtos
// @route   GET /api/products/stats
// @access  Private
exports.getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      { 
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalStockValue: { $sum: { $multiply: ["$sellingPrice", "$stock"] } },
          lowStock: { 
            $sum: {
              $cond: [{ $lte: ["$stock", "$minStock"] }, 1, 0]
            }
          },
          categories: { $addToSet: "$category" },
          brands: { $addToSet: "$brand" }
        } 
      },
      {
        $project: {
          _id: 0,
          count: 1,
          totalStockValue: 1,
          lowStock: 1,
          categoryCount: { $size: "$categories" },
          brandCount: { $size: "$brands" }
        }
      }
    ]);

    // Contagem por categoria
    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Contagem por marca
    const brandStats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        general: stats.length > 0 ? stats[0] : {},
        categories: categoryStats,
        brands: brandStats
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas de produtos'
    });
  }
};

// @desc    Obter marcas e modelos de carros disponíveis
// @route   GET /api/products/vehicle-compatibility
// @access  Private
exports.getVehicleCompatibility = async (req, res) => {
  try {
    // Obter todas as marcas de veículos disponíveis
    const makes = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$compatibility" },
      { $group: { _id: "$compatibility.make" } },
      { $sort: { _id: 1 } }
    ]);

    // Obter todos os modelos se uma marca for especificada
    let models = [];
    if (req.query.make) {
      models = await Product.aggregate([
        { $match: { isActive: true } },
        { $unwind: "$compatibility" },
        { $match: { "compatibility.make": req.query.make } },
        { $group: { _id: "$compatibility.model" } },
        { $sort: { _id: 1 } }
      ]);
    }

    // Obter anos disponíveis se marca e modelo forem especificados
    let years = [];
    if (req.query.make && req.query.model) {
      years = await Product.aggregate([
        { $match: { isActive: true } },
        { $unwind: "$compatibility" },
        { 
          $match: { 
            "compatibility.make": req.query.make,
            "compatibility.model": req.query.model 
          } 
        },
        { $group: { _id: "$compatibility.year" } },
        { $sort: { _id: -1 } }
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        makes: makes.map(item => item._id).filter(Boolean),
        models: models.map(item => item._id).filter(Boolean),
        years: years.map(item => item._id).filter(Boolean)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter compatibilidade de veículos'
    });
  }
};