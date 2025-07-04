import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { calculatePagination, isOverdue } from '../utils/helpers';
import moment from 'moment';

/**
 * ==============================================================================
 * CONTAS A RECEBER
 * ==============================================================================
 */

/**
 * Criar conta a receber
 */
export const createAccountReceivable = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      invoiceId,
      description,
      amount,
      dueDate,
      paymentMethod,
      notes
    } = req.body;

    const account = await prisma.accountReceivable.create({
      data: {
        customerId,
        invoiceId,
        description,
        amount,
        dueDate: new Date(dueDate),
        paymentMethod,
        notes
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Conta a receber criada com sucesso',
      data: account
    });
  } catch (error) {
    console.error('Erro ao criar conta a receber:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar contas a receber
 */
export const getAccountsReceivable = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      overdue,
      startDate,
      endDate
    } = req.query;

    const pagination = calculatePagination(Number(page), Number(limit), 0);
    const where: any = {};

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    if (overdue === 'true') {
      where.status = 'PENDING';
      where.dueDate = { lt: new Date() };
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate as string);
      if (endDate) where.dueDate.lte = new Date(endDate as string);
    }

    const [accounts, total] = await Promise.all([
      prisma.accountReceivable.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { dueDate: 'asc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.accountReceivable.count({ where })
    ]);

    // Adicionar flag de vencido
    const accountsWithFlags = accounts.map(account => ({
      ...account,
      isOverdue: isOverdue(account.dueDate) && account.status === 'PENDING',
      daysOverdue: account.status === 'PENDING' && isOverdue(account.dueDate) 
        ? moment().diff(moment(account.dueDate), 'days')
        : 0
    }));

    pagination.total = total;

    res.json({
      success: true,
      message: 'Contas a receber recuperadas com sucesso',
      data: accountsWithFlags,
      pagination
    });
  } catch (error) {
    console.error('Erro ao buscar contas a receber:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Marcar conta como paga
 */
export const markAccountReceivableAsPaid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paidDate, paymentMethod, notes } = req.body;

    const account = await prisma.accountReceivable.findUnique({
      where: { id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Conta a receber não encontrada'
      });
    }

    if (account.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Esta conta já foi paga'
      });
    }

    const updatedAccount = await prisma.accountReceivable.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: paidDate ? new Date(paidDate) : new Date(),
        paymentMethod,
        notes
      },
      include: {
        customer: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Conta marcada como paga',
      data: updatedAccount
    });
  } catch (error) {
    console.error('Erro ao marcar conta como paga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * ==============================================================================
 * CONTAS A PAGAR
 * ==============================================================================
 */

/**
 * Criar conta a pagar
 */
export const createAccountPayable = async (req: Request, res: Response) => {
  try {
    const {
      description,
      amount,
      dueDate,
      category,
      supplier,
      paymentMethod,
      notes
    } = req.body;

    const account = await prisma.accountPayable.create({
      data: {
        description,
        amount,
        dueDate: new Date(dueDate),
        category,
        supplier,
        paymentMethod,
        notes
      }
    });

    res.status(201).json({
      success: true,
      message: 'Conta a pagar criada com sucesso',
      data: account
    });
  } catch (error) {
    console.error('Erro ao criar conta a pagar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar contas a pagar
 */
export const getAccountsPayable = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      supplier,
      overdue,
      startDate,
      endDate
    } = req.query;

    const pagination = calculatePagination(Number(page), Number(limit), 0);
    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (supplier) where.supplier = { contains: supplier, mode: 'insensitive' };

    if (overdue === 'true') {
      where.status = 'PENDING';
      where.dueDate = { lt: new Date() };
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate as string);
      if (endDate) where.dueDate.lte = new Date(endDate as string);
    }

    const [accounts, total] = await Promise.all([
      prisma.accountPayable.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { dueDate: 'asc' }
      }),
      prisma.accountPayable.count({ where })
    ]);

    // Adicionar flag de vencido
    const accountsWithFlags = accounts.map(account => ({
      ...account,
      isOverdue: isOverdue(account.dueDate) && account.status === 'PENDING',
      daysOverdue: account.status === 'PENDING' && isOverdue(account.dueDate) 
        ? moment().diff(moment(account.dueDate), 'days')
        : 0
    }));

    pagination.total = total;

    res.json({
      success: true,
      message: 'Contas a pagar recuperadas com sucesso',
      data: accountsWithFlags,
      pagination
    });
  } catch (error) {
    console.error('Erro ao buscar contas a pagar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Marcar conta como paga
 */
export const markAccountPayableAsPaid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paidDate, paymentMethod, notes } = req.body;

    const account = await prisma.accountPayable.findUnique({
      where: { id }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Conta a pagar não encontrada'
      });
    }

    if (account.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Esta conta já foi paga'
      });
    }

    const updatedAccount = await prisma.accountPayable.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: paidDate ? new Date(paidDate) : new Date(),
        paymentMethod,
        notes
      }
    });

    res.json({
      success: true,
      message: 'Conta marcada como paga',
      data: updatedAccount
    });
  } catch (error) {
    console.error('Erro ao marcar conta como paga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * ==============================================================================
 * DASHBOARD FINANCEIRO
 * ==============================================================================
 */

/**
 * Obter resumo financeiro
 */
export const getFinancialSummary = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    const [
      // Contas a receber
      totalReceivable,
      pendingReceivable,
      overdueReceivable,
      paidThisMonth,
      
      // Contas a pagar
      totalPayable,
      pendingPayable,
      overduePayable,
      paidPayableThisMonth,
      
      // Faturamento (pedidos entregues)
      revenue,
      revenueThisMonth
    ] = await Promise.all([
      // Contas a receber
      prisma.accountReceivable.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['PENDING', 'PARTIAL'] } }
      }),
      prisma.accountReceivable.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' }
      }),
      prisma.accountReceivable.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PENDING',
          dueDate: { lt: currentDate }
        }
      }),
      prisma.accountReceivable.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          paidDate: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      
      // Contas a pagar
      prisma.accountPayable.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['PENDING', 'PARTIAL'] } }
      }),
      prisma.accountPayable.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' }
      }),
      prisma.accountPayable.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PENDING',
          dueDate: { lt: currentDate }
        }
      }),
      prisma.accountPayable.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          paidDate: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      
      // Faturamento
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'DELIVERED' }
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: 'DELIVERED',
          updatedAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      })
    ]);

    const summary = {
      receivables: {
        total: totalReceivable._sum.amount || 0,
        pending: pendingReceivable._sum.amount || 0,
        overdue: overdueReceivable._sum.amount || 0,
        paidThisMonth: paidThisMonth._sum.amount || 0
      },
      payables: {
        total: totalPayable._sum.amount || 0,
        pending: pendingPayable._sum.amount || 0,
        overdue: overduePayable._sum.amount || 0,
        paidThisMonth: paidPayableThisMonth._sum.amount || 0
      },
      revenue: {
        total: revenue._sum.total || 0,
        thisMonth: revenueThisMonth._sum.total || 0
      },
      cashFlow: {
        projected: (pendingReceivable._sum.amount || 0) - (pendingPayable._sum.amount || 0),
        thisMonth: (paidThisMonth._sum.amount || 0) - (paidPayableThisMonth._sum.amount || 0)
      }
    };

    res.json({
      success: true,
      message: 'Resumo financeiro recuperado com sucesso',
      data: summary
    });
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter fluxo de caixa por período
 */
export const getCashFlow = async (req: Request, res: Response) => {
  try {
    const {
      startDate = moment().startOf('month').format('YYYY-MM-DD'),
      endDate = moment().endOf('month').format('YYYY-MM-DD'),
      groupBy = 'day' // day, week, month
    } = req.query;

    const start = moment(startDate as string).startOf('day').toDate();
    const end = moment(endDate as string).endOf('day').toDate();

    // Buscar receitas (contas recebidas)
    const receivables = await prisma.accountReceivable.findMany({
      where: {
        status: 'PAID',
        paidDate: {
          gte: start,
          lte: end
        }
      },
      select: {
        amount: true,
        paidDate: true,
        description: true
      }
    });

    // Buscar despesas (contas pagas)
    const payables = await prisma.accountPayable.findMany({
      where: {
        status: 'PAID',
        paidDate: {
          gte: start,
          lte: end
        }
      },
      select: {
        amount: true,
        paidDate: true,
        description: true,
        category: true
      }
    });

    // Agrupar por período
    const groupFormat = groupBy === 'day' ? 'YYYY-MM-DD' 
                       : groupBy === 'week' ? 'YYYY-WW' 
                       : 'YYYY-MM';

    const cashFlowData: { [key: string]: { income: number; expense: number; net: number; date: string } } = {};

    // Processar receitas
    receivables.forEach(item => {
      const key = moment(item.paidDate).format(groupFormat);
      if (!cashFlowData[key]) {
        cashFlowData[key] = { income: 0, expense: 0, net: 0, date: key };
      }
      cashFlowData[key].income += item.amount;
    });

    // Processar despesas
    payables.forEach(item => {
      const key = moment(item.paidDate).format(groupFormat);
      if (!cashFlowData[key]) {
        cashFlowData[key] = { income: 0, expense: 0, net: 0, date: key };
      }
      cashFlowData[key].expense += item.amount;
    });

    // Calcular saldo líquido
    Object.keys(cashFlowData).forEach(key => {
      cashFlowData[key].net = cashFlowData[key].income - cashFlowData[key].expense;
    });

    // Converter para array e ordenar
    const cashFlowArray = Object.values(cashFlowData).sort((a, b) => 
      moment(a.date, groupFormat).diff(moment(b.date, groupFormat))
    );

    res.json({
      success: true,
      message: 'Fluxo de caixa recuperado com sucesso',
      data: {
        period: { start: startDate, end: endDate },
        groupBy,
        cashFlow: cashFlowArray,
        totals: {
          income: cashFlowArray.reduce((sum, item) => sum + item.income, 0),
          expense: cashFlowArray.reduce((sum, item) => sum + item.expense, 0),
          net: cashFlowArray.reduce((sum, item) => sum + item.net, 0)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar fluxo de caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter categorias de despesas
 */
export const getExpenseCategories = async (req: Request, res: Response) => {
  try {
    const {
      startDate = moment().startOf('month').format('YYYY-MM-DD'),
      endDate = moment().endOf('month').format('YYYY-MM-DD')
    } = req.query;

    const start = moment(startDate as string).startOf('day').toDate();
    const end = moment(endDate as string).endOf('day').toDate();

    const categories = await prisma.accountPayable.groupBy({
      by: ['category'],
      _sum: {
        amount: true
      },
      _count: true,
      where: {
        status: 'PAID',
        paidDate: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    });

    const categoriesData = categories.map(cat => ({
      category: cat.category,
      amount: cat._sum.amount || 0,
      count: cat._count,
      percentage: 0 // Será calculado abaixo
    }));

    // Calcular percentuais
    const total = categoriesData.reduce((sum, cat) => sum + cat.amount, 0);
    categoriesData.forEach(cat => {
      cat.percentage = total > 0 ? (cat.amount / total) * 100 : 0;
    });

    res.json({
      success: true,
      message: 'Categorias de despesas recuperadas com sucesso',
      data: {
        period: { start: startDate, end: endDate },
        categories: categoriesData,
        total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar categorias de despesas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter contas vencidas
 */
export const getOverdueAccounts = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();

    const [overdueReceivables, overduePayables] = await Promise.all([
      prisma.accountReceivable.findMany({
        where: {
          status: 'PENDING',
          dueDate: { lt: currentDate }
        },
        include: {
          customer: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { dueDate: 'asc' }
      }),
      prisma.accountPayable.findMany({
        where: {
          status: 'PENDING',
          dueDate: { lt: currentDate }
        },
        orderBy: { dueDate: 'asc' }
      })
    ]);

    // Adicionar dias de atraso
    const receivablesWithDelay = overdueReceivables.map(account => ({
      ...account,
      daysOverdue: moment().diff(moment(account.dueDate), 'days')
    }));

    const payablesWithDelay = overduePayables.map(account => ({
      ...account,
      daysOverdue: moment().diff(moment(account.dueDate), 'days')
    }));

    res.json({
      success: true,
      message: 'Contas vencidas recuperadas com sucesso',
      data: {
        receivables: receivablesWithDelay,
        payables: payablesWithDelay,
        summary: {
          receivablesTotal: receivablesWithDelay.reduce((sum, acc) => sum + acc.amount, 0),
          payablesTotal: payablesWithDelay.reduce((sum, acc) => sum + acc.amount, 0),
          receivablesCount: receivablesWithDelay.length,
          payablesCount: payablesWithDelay.length
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar contas vencidas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};