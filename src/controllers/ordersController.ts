import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { generateSequentialNumber, calculateItemTotal } from '../utils/helpers';

/**
 * Criar novo pedido
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      quoteId,
      title,
      description,
      deadline,
      priority = 'NORMAL',
      discount = 0,
      discountType = 'PERCENTAGE',
      notes,
      production_notes,
      items = []
    } = req.body;

    // Gerar número sequencial do pedido
    const lastOrder = await prisma.order.findFirst({
      orderBy: { number: 'desc' },
      select: { number: true }
    });

    const lastNumber = lastOrder ? parseInt(lastOrder.number.slice(-4)) : 0;
    const orderNumber = generateSequentialNumber('PED', lastNumber);

    // Calcular totais dos itens
    let subtotal = 0;
    const processedItems = items.map((item: any) => {
      const itemTotal = calculateItemTotal(item.quantity, item.unitPrice);
      const itemDiscount = item.discount || 0;
      const finalTotal = itemTotal - (itemTotal * itemDiscount / 100);
      subtotal += finalTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
        total: finalTotal,
        notes: item.notes
      };
    });

    // Aplicar desconto geral
    const discountAmount = discountType === 'PERCENTAGE' 
      ? subtotal * (discount / 100)
      : discount;
    
    const total = subtotal - discountAmount;

    // Criar pedido com itens
    const order = await prisma.order.create({
      data: {
        number: orderNumber,
        customerId,
        userId: req.userId!,
        quoteId,
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        priority,
        discount,
        discountType,
        subtotal,
        total,
        notes,
        production_notes,
        items: {
          create: processedItems
        }
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        createdBy: {
          select: { id: true, name: true }
        },
        quote: {
          select: { id: true, number: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, unit: true }
            }
          }
        }
      }
    });

    // Se veio de um orçamento, atualizar o status do orçamento
    if (quoteId) {
      await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'CONVERTED' }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      data: order
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar pedidos com filtros
 */
export const getOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      priority,
      customerId,
      startDate,
      endDate,
      overdue
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (customerId) where.customerId = customerId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Filtro para pedidos vencidos
    if (overdue === 'true') {
      where.deadline = { lt: new Date() };
      where.status = { notIn: ['DELIVERED', 'CANCELLED'] };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true }
          },
          createdBy: {
            select: { id: true, name: true }
          },
          quote: {
            select: { id: true, number: true }
          },
          _count: {
            select: { items: true }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    // Adicionar flag de vencido para cada pedido
    const ordersWithFlags = orders.map(order => ({
      ...order,
      isOverdue: order.deadline && order.deadline < new Date() && !['DELIVERED', 'CANCELLED'].includes(order.status)
    }));

    const pagination = {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      hasNext: Number(page) < Math.ceil(total / Number(limit)),
      hasPrev: Number(page) > 1
    };

    res.json({
      success: true,
      message: 'Pedidos recuperados com sucesso',
      data: ordersWithFlags,
      pagination
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter pedido por ID
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, name: true }
        },
        quote: {
          select: { id: true, number: true }
        },
        items: {
          include: {
            product: true
          }
        },
        invoice: {
          select: { id: true, number: true, status: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    // Adicionar informações extras
    const orderWithExtras = {
      ...order,
      isOverdue: order.deadline && order.deadline < new Date() && !['DELIVERED', 'CANCELLED'].includes(order.status),
      daysUntilDeadline: order.deadline ? Math.ceil((order.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
    };

    res.json({
      success: true,
      message: 'Pedido recuperado com sucesso',
      data: orderWithExtras
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar pedido
 */
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se o pedido existe
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    // Não permitir edição de pedidos entregues ou cancelados
    if (['DELIVERED', 'CANCELLED'].includes(existingOrder.status)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível editar pedidos entregues ou cancelados'
      });
    }

    // Atualizar pedido
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, unit: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Pedido atualizado com sucesso',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Alterar status do pedido
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    // Lógica especial para diferentes status
    const updateData: any = { status };

    // Se status mudou para IN_PRODUCTION, definir startDate
    if (status === 'IN_PRODUCTION' && order.status !== 'IN_PRODUCTION') {
      updateData.startDate = new Date();
    }

    // Se status mudou para DELIVERED, baixar estoque
    if (status === 'DELIVERED' && order.status !== 'DELIVERED') {
      await prisma.$transaction(async (prisma) => {
        // Atualizar status do pedido
        await prisma.order.update({
          where: { id },
          data: updateData
        });

        // Baixar estoque para cada item
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });

          // Registrar movimentação de estoque
          await prisma.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'OUT',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              reason: 'Baixa automática - pedido entregue',
              reference: order.number
            }
          });
        }
      });
    } else {
      // Atualização simples de status
      await prisma.order.update({
        where: { id },
        data: updateData
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
        items: { include: { product: true } }
      }
    });

    res.json({
      success: true,
      message: `Status do pedido alterado para ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Erro ao alterar status do pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Duplicar pedido
 */
export const duplicateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const originalOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!originalOrder) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado'
      });
    }

    // Gerar novo número
    const lastOrder = await prisma.order.findFirst({
      orderBy: { number: 'desc' },
      select: { number: true }
    });

    const lastNumber = lastOrder ? parseInt(lastOrder.number.slice(-4)) : 0;
    const newOrderNumber = generateSequentialNumber('PED', lastNumber);

    // Duplicar pedido
    const duplicatedOrder = await prisma.order.create({
      data: {
        number: newOrderNumber,
        customerId: originalOrder.customerId,
        userId: req.userId!,
        title: `${originalOrder.title} (Cópia)`,
        description: originalOrder.description,
        priority: originalOrder.priority,
        discount: originalOrder.discount,
        discountType: originalOrder.discountType,
        subtotal: originalOrder.subtotal,
        total: originalOrder.total,
        notes: originalOrder.notes,
        production_notes: originalOrder.production_notes,
        status: 'PENDING',
        items: {
          create: originalOrder.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.total,
            notes: item.notes
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: { product: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Pedido duplicado com sucesso',
      data: duplicatedOrder
    });
  } catch (error) {
    console.error('Erro ao duplicar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter estatísticas de pedidos
 */
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      inProductionOrders,
      readyOrders,
      deliveredOrders,
      cancelledOrders,
      overdueOrders,
      totalValue,
      deliveredValue
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'IN_PRODUCTION' } }),
      prisma.order.count({ where: { status: 'READY' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.count({
        where: {
          deadline: { lt: currentDate },
          status: { notIn: ['DELIVERED', 'CANCELLED'] }
        }
      }),
      prisma.order.aggregate({
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'DELIVERED' }
      })
    ]);

    const stats = {
      total: totalOrders,
      pending: pendingOrders,
      confirmed: confirmedOrders,
      inProduction: inProductionOrders,
      ready: readyOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
      overdue: overdueOrders,
      totalValue: totalValue._sum.total || 0,
      deliveredValue: deliveredValue._sum.total || 0,
      completionRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0
    };

    res.json({
      success: true,
      message: 'Estatísticas de pedidos recuperadas com sucesso',
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter pedidos por status (para kanban)
 */
export const getOrdersByStatus = async (req: Request, res: Response) => {
  try {
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      orderBy: {
        status: 'asc'
      }
    });

    // Buscar alguns pedidos de exemplo para cada status
    const statusDetails = await Promise.all([
      'PENDING',
      'CONFIRMED', 
      'IN_PRODUCTION',
      'READY',
      'DELIVERED'
    ].map(async (status) => {
      const orders = await prisma.order.findMany({
        where: { status },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true }
          }
        }
      });

      const count = ordersByStatus.find(item => item.status === status)?._count || 0;

      return {
        status,
        count,
        orders: orders.map(order => ({
          id: order.id,
          number: order.number,
          title: order.title,
          customer: order.customer,
          total: order.total,
          deadline: order.deadline,
          priority: order.priority,
          isOverdue: order.deadline && order.deadline < new Date() && !['DELIVERED', 'CANCELLED'].includes(order.status)
        }))
      };
    }));

    res.json({
      success: true,
      message: 'Pedidos por status recuperados com sucesso',
      data: statusDetails
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos por status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};