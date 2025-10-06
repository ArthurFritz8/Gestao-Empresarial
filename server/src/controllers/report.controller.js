const Sale = require('../models/Sale');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Obter estatísticas para o dashboard
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Calcular faturamento do dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyRevenue = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Total de produtos em estoque
    const totalProducts = await Product.countDocuments();
    
    // Produtos com estoque abaixo do mínimo
    const lowStockItems = await Product.countDocuments({
      $expr: { $lt: ['$stock', '$minStock'] }
    });
    
    // Vendas mensais (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          value: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          value: 1
        }
      }
    ]);
    
    // Categorias mais vendidas
    const topCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          value: { $sum: 1 }
        }
      },
      {
        $sort: { value: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          value: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        dailyRevenue: dailyRevenue.length > 0 ? dailyRevenue[0].total : 0,
        totalProducts,
        lowStockItems,
        monthlySales,
        topCategories
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Obter relatório de vendas
// @route   GET /api/reports/sales
// @access  Private
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    
    let dateFilter = {};
    
    // Filtrar por período
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else if (period) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const periodStart = new Date(today);
      
      switch (period) {
        case 'day':
          // Já configurado como hoje
          break;
        case 'week':
          // Início da semana (domingo)
          periodStart.setDate(today.getDate() - today.getDay());
          break;
        case 'month':
          // Início do mês
          periodStart.setDate(1);
          break;
        default:
          // Período padrão: últimos 30 dias
          periodStart.setDate(today.getDate() - 30);
      }
      
      dateFilter = {
        createdAt: { $gte: periodStart }
      };
    }
    
    const salesReport = await Sale.find(dateFilter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: salesReport.length,
      data: salesReport
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// @desc    Obter relatório de estoque
// @route   GET /api/reports/stock
// @access  Private
exports.getStockReport = async (req, res) => {
  try {
    const { category } = req.query;
    
    let filter = {};
    
    // Filtrar por categoria
    if (category && category !== 'Todas') {
      filter.category = category;
    }
    
    const products = await Product.find(filter).sort({ stock: 1 });
    
    // Adicionar status de estoque
    const stockReport = products.map(product => {
      let status = 'ok';
      
      if (product.stock === 0) {
        status = 'out';
      } else if (product.stock < product.minStock) {
        status = 'low';
      }
      
      return {
        ...product._doc,
        status
      };
    });
    
    res.status(200).json({
      success: true,
      count: stockReport.length,
      data: stockReport
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};