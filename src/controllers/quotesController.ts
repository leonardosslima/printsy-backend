import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { generateSequentialNumber, calculateItemTotal } from '../utils/helpers';

/**
 * Criar novo orçamento
 */
export const createQuote = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      title,
      description,
      validUntil,
      discount = 0,
      discountType = 'PERCENTAGE',
      notes,
      terms,
      items = []
    } = req.body;

    // Gerar número sequencial do orçamento
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { number: 'desc' },
      select: { number: true }
    });

    const lastNumber = lastQuote ? parseInt(lastQuote.number.slice(-4)) : 0;
    const quoteNumber = generateSequentialNumber('ORC', lastNumber);

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

    // Criar orçamento com itens
    const quote = await prisma.quote.create({
      data: {
        number: quoteNumber,
        customerId,
        userId: req.userId,
        title,
        description,
        validUntil: new Date(validUntil),
        discount,
        discountType,
        subtotal,
        total,
        notes,
        terms,
        items: {
          create: processedItems
        }
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true }
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

    res.status(201).json({
      success: true,
      message: 'Orçamento criado com sucesso',
      data: quote
    });
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar orçamentos com filtros
 */
export const getQuotes = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      customerId,
      startDate,
      endDate
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
    if (customerId) where.customerId = customerId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true }
          },
          createdBy: {
            select: { id: true, name: true }
          },
          _count: {
            select: { items: true }
          }
        }
      }),
      prisma.quote.count({ where })
    ]);

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
      message: 'Orçamentos recuperados com sucesso',
      data: quotes,
      pagination
    });
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter orçamento por ID
 */
export const getQuoteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, name: true }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Orçamento recuperado com sucesso',
      data: quote
    });
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Atualizar orçamento
 */
export const updateQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se o orçamento existe
    const existingQuote = await prisma.quote.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado'
      });
    }

    // Não permitir edição de orçamentos aprovados/convertidos
    if (['APPROVED', 'CONVERTED'].includes(existingQuote.status)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível editar orçamentos aprovados ou convertidos'
      });
    }

    // Atualizar orçamento
    const updatedQuote = await prisma.quote.update({
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
      message: 'Orçamento atualizado com sucesso',
      data: updatedQuote
    });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Alterar status do orçamento
 */
export const updateQuoteStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const quote = await prisma.quote.findUnique({
      where: { id }
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado'
      });
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      message: `Status do orçamento alterado para ${status}`,
      data: updatedQuote
    });
  } catch (error) {
    console.error('Erro ao alterar status do orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Converter orçamento em pedido
 */
export const convertQuoteToOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado'
      });
    }

    if (quote.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Apenas orçamentos aprovados podem ser convertidos em pedidos'
      });
    }

    // Gerar número do pedido
    const lastOrder = await prisma.order.findFirst({
      orderBy: { number: 'desc' },
      select: { number: true }
    });

    const lastNumber = lastOrder ? parseInt(lastOrder.number.slice(-4)) : 0;
    const orderNumber = generateSequentialNumber('PED', lastNumber);

    // Criar pedido baseado no orçamento
    const order = await prisma.$transaction(async (prisma) => {
      // Criar o pedido
      const newOrder = await prisma.order.create({
        data: {
          number: orderNumber,
          customerId: quote.customerId,
          userId: req.userId,
          quoteId: quote.id,
          title: quote.title,
          description: quote.description,
          discount: quote.discount,
          discountType: quote.discountType,
          subtotal: quote.subtotal,
          total: quote.total,
          notes: quote.notes,
          items: {
            create: quote.items.map(item => ({
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

      // Atualizar status do orçamento
      await prisma.quote.update({
        where: { id },
        data: { status: 'CONVERTED' }
      });

      return newOrder;
    });

    res.json({
      success: true,
      message: 'Orçamento convertido em pedido com sucesso',
      data: order
    });
  } catch (error) {
    console.error('Erro ao converter orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Duplicar orçamento
 */
export const duplicateQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const originalQuote = await prisma.quote.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!originalQuote) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado'
      });
    }

    // Gerar novo número
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { number: 'desc' },
      select: { number: true }
    });

    const lastNumber = lastQuote ? parseInt(lastQuote.number.slice(-4)) : 0;
    const newQuoteNumber = generateSequentialNumber('ORC', lastNumber);

    // Criar nova data de validade (30 dias)
    const newValidUntil = new Date();
    newValidUntil.setDate(newValidUntil.getDate() + 30);

    // Duplicar orçamento
    const duplicatedQuote = await prisma.quote.create({
      data: {
        number: newQuoteNumber,
        customerId: originalQuote.customerId,
        userId: req.userId,
        title: `${originalQuote.title} (Cópia)`,
        description: originalQuote.description,
        validUntil: newValidUntil,
        discount: originalQuote.discount,
        discountType: originalQuote.discountType,
        subtotal: originalQuote.subtotal,
        total: originalQuote.total,
        notes: originalQuote.notes,
        terms: originalQuote.terms,
        status: 'DRAFT',
        items: {
          create: originalQuote.items.map(item => ({
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
      message: 'Orçamento duplicado com sucesso',
      data: duplicatedQuote
    });
  } catch (error) {
    console.error('Erro ao duplicar orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter estatísticas de orçamentos
 */
export const getQuoteStats = async (req: Request, res: Response) => {
  try {
    const [
      totalQuotes,
      pendingQuotes,
      approvedQuotes,
      rejectedQuotes,
      convertedQuotes,
      totalValue
    ] = await Promise.all([
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'PENDING' } }),
      prisma.quote.count({ where: { status: 'APPROVED' } }),
      prisma.quote.count({ where: { status: 'REJECTED' } }),
      prisma.quote.count({ where: { status: 'CONVERTED' } }),
      prisma.quote.aggregate({
        _sum: { total: true },
        where: { status: { in: ['APPROVED', 'CONVERTED'] } }
      })
    ]);

    const stats = {
      total: totalQuotes,
      pending: pendingQuotes,
      approved: approvedQuotes,
      rejected: rejectedQuotes,
      converted: convertedQuotes,
      totalValue: totalValue._sum.total || 0,
      conversionRate: totalQuotes > 0 ? (convertedQuotes / totalQuotes) * 100 : 0
    };

    res.json({
      success: true,
      message: 'Estatísticas de orçamentos recuperadas com sucesso',
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