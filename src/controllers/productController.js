const { prisma } = require('../config/database');
const response = require('../utils/response');
const { calculatePagination } = require('../utils/helpers');

/**
 * Criar novo produto
 */
const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    const product = await prisma.product.create({
      data: productData
    });

    // Registrar movimentação inicial de estoque se houver
    if (productData.stock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'IN',
          quantity: productData.stock,
          unitPrice: productData.price,
          total: productData.stock * productData.price,
          reason: 'Estoque inicial do produto'
        }
      });
    }

    return response.created(res, product, 'Produto criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Listar produtos com filtros e paginação
 */
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', active, lowStock } = req.query;
    
    // Construir filtros
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (active !== undefined) {
      where.active = active === 'true';
    }

    // Filtro para produtos com estoque baixo
    if (lowStock === 'true') {
      where.stock = { lte: prisma.product.fields.minStock };
    }

    const pagination = calculatePagination(page, limit, 0);

    // Buscar produtos com paginação
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    // Adicionar flag de estoque baixo para cada produto
    const productsWithLowStockFlag = products.map(product => ({
      ...product,
      isLowStock: product.stock <= product.minStock
    }));

    pagination.total = total;

    return response.successWithPagination(res, productsWithLowStockFlag, pagination, 'Produtos recuperados com sucesso');
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter produto por ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20 // Últimas 20 movimentações
        }
      }
    });

    if (!product) {
      return response.notFound(res, 'Produto não encontrado');
    }

    // Adicionar flag de estoque baixo
    const productWithFlags = {
      ...product,
      isLowStock: product.stock <= product.minStock
    };

    return response.success(res, productWithFlags, 'Produto recuperado com sucesso');
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Atualizar produto
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se o produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return response.notFound(res, 'Produto não encontrado');
    }

    // Não permitir alteração direta do estoque via update (usar movimentação)
    const { stock, ...dataToUpdate } = updateData;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate
    });

    return response.success(res, updatedProduct, 'Produto atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Ativar/desativar produto
 */
const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, active: true, name: true }
    });

    if (!product) {
      return response.notFound(res, 'Produto não encontrado');
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { active: !product.active }
    });

    const action = updatedProduct.active ? 'ativado' : 'desativado';
    return response.success(res, updatedProduct, `Produto ${action} com sucesso`);
  } catch (error) {
    console.error('Erro ao alterar status do produto:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Movimentar estoque (entrada ou saída)
 */
const moveStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, unitPrice, reason, reference } = req.body;

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return response.notFound(res, 'Produto não encontrado');
    }

    // Validar tipo de movimentação
    if (!['IN', 'OUT'].includes(type)) {
      return response.badRequest(res, 'Tipo de movimentação inválido. Use IN ou OUT');
    }

    // Para saída, verificar se há estoque suficiente
    if (type === 'OUT' && product.stock < quantity) {
      return response.badRequest(res, 'Estoque insuficiente para esta operação');
    }

    // Calcular novo estoque
    const newStock = type === 'IN' 
      ? product.stock + quantity 
      : product.stock - quantity;

    // Realizar a transação (movimentação + atualização do produto)
    const result = await prisma.$transaction([
      // Registrar movimentação
      prisma.stockMovement.create({
        data: {
          productId: id,
          type,
          quantity,
          unitPrice: unitPrice || null,
          total: unitPrice ? quantity * unitPrice : null,
          reason,
          reference: reference || null
        }
      }),
      // Atualizar estoque do produto
      prisma.product.update({
        where: { id },
        data: { stock: newStock }
      })
    ]);

    const movement = result[0];
    const updatedProduct = result[1];

    return response.success(res, { movement, product: updatedProduct }, 'Movimentação de estoque realizada com sucesso');
  } catch (error) {
    console.error('Erro na movimentação de estoque:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter histórico de movimentações de estoque
 */
const getStockMovements = async (req, res) => {
  try {
    const { page = 1, limit = 20, productId, type } = req.query;
    
    const where = {};
    
    if (productId) {
      where.productId = productId;
    }

    if (type && ['IN', 'OUT'].includes(type)) {
      where.type = type;
    }

    const pagination = calculatePagination(page, limit, 0);

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unit: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ]);

    pagination.total = total;

    return response.successWithPagination(res, movements, pagination, 'Movimentações de estoque recuperadas com sucesso');
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter produtos ativos para formulários
 */
const getActiveProducts = async (req, res) => {
  try {
    const { search = '' } = req.query;

    const where = {
      active: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        unit: true,
        price: true,
        stock: true,
        minStock: true
      },
      orderBy: { name: 'asc' },
      take: 100
    });

    // Adicionar flag de estoque baixo
    const productsWithFlags = products.map(product => ({
      ...product,
      isLowStock: product.stock <= product.minStock
    }));

    return response.success(res, productsWithFlags, 'Produtos ativos recuperados com sucesso');
  } catch (error) {
    console.error('Erro ao buscar produtos ativos:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter categorias de produtos
 */
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      where: { active: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    const categoryList = categories.map(item => item.category);

    return response.success(res, categoryList, 'Categorias recuperadas com sucesso');
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  toggleProductStatus,
  moveStock,
  getStockMovements,
  getActiveProducts,
  getCategories
};