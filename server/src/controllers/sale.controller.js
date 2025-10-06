const Sale = require('../models/Sale');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Obter todas as vendas
// @route   GET /api/sales
// @access  Private
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate('createdBy', 'name');
    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Obter uma venda específica
// @route   GET /api/sales/:id
// @access  Private
exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('createdBy', 'name');

    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Criar uma venda
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { items, customer, totalAmount, paymentMethod } = req.body;
    
    // Verificar se há itens na venda
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'A venda deve conter pelo menos um item' });
    }
    
    // Verificar se todos os produtos existem e têm estoque suficiente
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Produto com ID ${item.product} não encontrado` });
      }
      
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Estoque insuficiente para o produto ${product.name}` });
      }
      
      // Atualizar estoque do produto
      product.stock -= item.quantity;
      await product.save({ session });
    }
    
    // Criar a venda
    const sale = new Sale({
      items,
      customer,
      totalAmount,
      paymentMethod,
      createdBy: req.user.id,
    });
    
    await sale.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Atualizar uma venda
// @route   PUT /api/sales/:id
// @access  Private
exports.updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    
    // Permitir apenas atualização de campos específicos, como status de pagamento
    const { paymentStatus } = req.body;
    
    const updatedSale = await Sale.findByIdAndUpdate(
      req.params.id, 
      { paymentStatus }, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedSale,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Excluir uma venda
// @route   DELETE /api/sales/:id
// @access  Private
exports.deleteSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    
    // Restaurar o estoque dos produtos
    for (const item of sale.items) {
      const product = await Product.findById(item.product);
      
      if (product) {
        product.stock += item.quantity;
        await product.save({ session });
      }
    }
    
    await Sale.findByIdAndDelete(req.params.id, { session });
    
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};