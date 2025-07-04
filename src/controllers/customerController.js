const { prisma } = require('../config/database');
const response = require('../utils/response');
const { calculatePagination } = require('../utils/helpers');

/**
 * Criar novo cliente
 */
const createCustomer = async (req, res) => {
  try {
    const customerData = req.body;

    const customer = await prisma.customer.create({
      data: customerData
    });

    return response.created(res, customer, 'Cliente criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    
    if (error.code === 'P2002') {
      return response.conflict(res, 'Email já está em uso por outro cliente');
    }
    
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Listar clientes com filtros e paginação
 */
const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', active } = req.query;
    
    // Construir filtros
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (active !== undefined) {
      where.active = active === 'true';
    }

    const pagination = calculatePagination(page, limit, 0);

    // Buscar clientes com paginação
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              quotes: true,
              orders: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    pagination.total = total;

    return response.successWithPagination(res, customers, pagination, 'Clientes recuperados com sucesso');
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter cliente por ID
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        quotes: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        orders: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            quotes: true,
            orders: true
          }
        }
      }
    });

    if (!customer) {
      return response.notFound(res, 'Cliente não encontrado');
    }

    return response.success(res, customer, 'Cliente recuperado com sucesso');
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Atualizar cliente
 */
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se o cliente existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      return response.notFound(res, 'Cliente não encontrado');
    }

    // Verificar se o email já está em uso por outro cliente
    if (updateData.email) {
      const emailInUse = await prisma.customer.findFirst({
        where: {
          email: updateData.email,
          id: { not: id }
        }
      });

      if (emailInUse) {
        return response.conflict(res, 'Email já está em uso por outro cliente');
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData
    });

    return response.success(res, updatedCustomer, 'Cliente atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Ativar/desativar cliente
 */
const toggleCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { id: true, active: true, name: true }
    });

    if (!customer) {
      return response.notFound(res, 'Cliente não encontrado');
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { active: !customer.active }
    });

    const action = updatedCustomer.active ? 'ativado' : 'desativado';
    return response.success(res, updatedCustomer, `Cliente ${action} com sucesso`);
  } catch (error) {
    console.error('Erro ao alterar status do cliente:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Excluir cliente (soft delete - desativa)
 */
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            quotes: true,
            orders: true
          }
        }
      }
    });

    if (!customer) {
      return response.notFound(res, 'Cliente não encontrado');
    }

    // Verificar se o cliente tem orçamentos ou pedidos associados
    if (customer._count.quotes > 0 || customer._count.orders > 0) {
      // Soft delete - apenas desativar
      await prisma.customer.update({
        where: { id },
        data: { active: false }
      });

      return response.success(res, null, 'Cliente desativado com sucesso (possui histórico de orçamentos/pedidos)');
    }

    // Hard delete se não tiver histórico
    await prisma.customer.delete({
      where: { id }
    });

    return response.success(res, null, 'Cliente excluído com sucesso');
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Buscar clientes ativos para uso em formulários
 */
const getActiveCustomers = async (req, res) => {
  try {
    const { search = '' } = req.query;

    const where = {
      active: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      },
      orderBy: { name: 'asc' },
      take: 50 // Limitar para performance
    });

    return response.success(res, customers, 'Clientes ativos recuperados com sucesso');
  } catch (error) {
    console.error('Erro ao buscar clientes ativos:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  toggleCustomerStatus,
  deleteCustomer,
  getActiveCustomers
};