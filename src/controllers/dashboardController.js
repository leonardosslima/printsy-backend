const { prisma } = require('../config/database');
const response = require('../utils/response');
const { formatCurrency, isOverdue } = require('../utils/helpers');
const moment = require('moment');

/**
 * Obter dados gerais do dashboard
 */
const getDashboardData = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    const startOfYear = moment().startOf('year').toDate();

    // Buscar dados em paralelo para performance
    const [
      // Contadores gerais
      totalCustomers,
      totalActiveCustomers,
      totalProducts,
      totalActiveProducts,
      
      // Orçamentos
      totalQuotes,
      pendingQuotes,
      quotesThisMonth,
      
      // Pedidos
      totalOrders,
      pendingOrders,
      ordersInProduction,
      ordersThisMonth,
      
      // Financeiro
      accountsReceivable,
      accountsPayable,
      overdueReceivables,
      overduePayables,
      
      // Produtos com estoque baixo
      lowStockProducts,
      
      // Faturamento mensal
      monthlyRevenue,
      yearlyRevenue
    ] = await Promise.all([
      // Contadores gerais
      prisma.customer.count(),
      prisma.customer.count({ where: { active: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      
      // Orçamentos
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'PENDING' } }),
      prisma.quote.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      
      // Pedidos
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'IN_PRODUCTION' } }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      
      // Financeiro
      prisma.accountReceivable.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' }
      }),
      prisma.accountPayable.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' }
      }),
      prisma.accountReceivable.count({
        where: {
          status: 'PENDING',
          dueDate: { lt: currentDate }
        }
      }),
      prisma.accountPayable.count({
        where: {
          status: 'PENDING',
          dueDate: { lt: currentDate }
        }
      }),
      
      // Produtos com estoque baixo
      prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM products 
        WHERE stock <= min_stock AND active = true
      `,
      
      // Faturamento mensal (pedidos entregues)
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: 'DELIVERED',
          updatedAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      
      // Faturamento anual
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: 'DELIVERED',
          updatedAt: {
            gte: startOfYear
          }
        }
      })
    ]);

    // Formatação dos dados
    const dashboardData = {
      summary: {
        customers: {
          total: totalCustomers,
          active: totalActiveCustomers
        },
        products: {
          total: totalProducts,
          active: totalActiveProducts,
          lowStock: parseInt(lowStockProducts[0]?.count || 0)
        },
        quotes: {
          total: totalQuotes,
          pending: pendingQuotes,
          thisMonth: quotesThisMonth
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          inProduction: ordersInProduction,
          thisMonth: ordersThisMonth
        }
      },
      
      financial: {
        accountsReceivable: {
          total: accountsReceivable._sum.amount || 0,
          overdue: overdueReceivables
        },
        accountsPayable: {
          total: accountsPayable._sum.amount || 0,
          overdue: overduePayables
        },
        revenue: {
          monthly: monthlyRevenue._sum.total || 0,
          yearly: yearlyRevenue._sum.total || 0
        }
      },
      
      alerts: {
        lowStockProducts: parseInt(lowStockProducts[0]?.count || 0),
        overdueReceivables,
        overduePayables,
        pendingQuotes,
        pendingOrders
      }
    };

    return response.success(res, dashboardData, 'Dados do dashboard recuperados com sucesso');
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter gráfico de faturamento mensal
 */
const getMonthlyRevenueChart = async (req, res) => {
  try {
    const { year = moment().year() } = req.query;
    
    // Buscar faturamento mês a mês do ano
    const monthlyData = await prisma.order.groupBy({
      by: ['updatedAt'],
      _sum: {
        total: true
      },
      where: {
        status: 'DELIVERED',
        updatedAt: {
          gte: moment(`${year}-01-01`).startOf('year').toDate(),
          lte: moment(`${year}-12-31`).endOf('year').toDate()
        }
      }
    });

    // Processar dados para gráfico (12 meses)
    const chartData = [];
    for (let month = 0; month < 12; month++) {
      const monthName = moment().month(month).format('MMM');
      const monthData = monthlyData.filter(item => 
        moment(item.updatedAt).month() === month
      );
      
      const total = monthData.reduce((sum, item) => sum + (item._sum.total || 0), 0);
      
      chartData.push({
        month: monthName,
        monthNumber: month + 1,
        revenue: total
      });
    }

    return response.success(res, chartData, 'Dados de faturamento mensal recuperados com sucesso');
  } catch (error) {
    console.error('Erro ao buscar faturamento mensal:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter pedidos recentes
 */
const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentOrders = await prisma.order.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return response.success(res, recentOrders, 'Pedidos recentes recuperados com sucesso');
  } catch (error) {
    console.error('Erro ao buscar pedidos recentes:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter contas vencidas
 */
const getOverdueAccounts = async (req, res) => {
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
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { dueDate: 'asc' },
        take: 10
      }),
      prisma.accountPayable.findMany({
        where: {
          status: 'PENDING',
          dueDate: { lt: currentDate }
        },
        orderBy: { dueDate: 'asc' },
        take: 10
      })
    ]);

    return response.success(res, {
      receivables: overdueReceivables,
      payables: overduePayables
    }, 'Contas vencidas recuperadas com sucesso');
  } catch (error) {
    console.error('Erro ao buscar contas vencidas:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter produtos com estoque baixo
 */
const getLowStockProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const lowStockProducts = await prisma.product.findMany({
      where: {
        active: true,
        stock: {
          lte: prisma.product.fields.minStock
        }
      },
      orderBy: [
        { stock: 'asc' },
        { name: 'asc' }
      ],
      take: parseInt(limit)
    });

    // Adicionar informações extras sobre o estoque
    const productsWithInfo = lowStockProducts.map(product => ({
      ...product,
      stockDifference: product.minStock - product.stock,
      isOutOfStock: product.stock === 0
    }));

    return response.success(res, productsWithInfo, 'Produtos com estoque baixo recuperados com sucesso');
  } catch (error) {
    console.error('Erro ao buscar produtos com estoque baixo:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

/**
 * Obter resumo de vendas por período
 */
const getSalesSummary = async (req, res) => {
  try {
    const { 
      startDate = moment().startOf('month').format('YYYY-MM-DD'),
      endDate = moment().endOf('month').format('YYYY-MM-DD')
    } = req.query;

    const start = moment(startDate).startOf('day').toDate();
    const end = moment(endDate).endOf('day').toDate();

    const [ordersSummary, quotesSummary] = await Promise.all([
      // Resumo de pedidos
      prisma.order.aggregate({
        _count: true,
        _sum: { total: true },
        _avg: { total: true },
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      
      // Resumo de orçamentos
      prisma.quote.aggregate({
        _count: true,
        _sum: { total: true },
        _avg: { total: true },
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      })
    ]);

    const summary = {
      period: {
        start: startDate,
        end: endDate
      },
      orders: {
        count: ordersSummary._count,
        total: ordersSummary._sum.total || 0,
        average: ordersSummary._avg.total || 0
      },
      quotes: {
        count: quotesSummary._count,
        total: quotesSummary._sum.total || 0,
        average: quotesSummary._avg.total || 0
      }
    };

    return response.success(res, summary, 'Resumo de vendas recuperado com sucesso');
  } catch (error) {
    console.error('Erro ao buscar resumo de vendas:', error);
    return response.error(res, 'Erro interno do servidor');
  }
};

module.exports = {
  getDashboardData,
  getMonthlyRevenueChart,
  getRecentOrders,
  getOverdueAccounts,
  getLowStockProducts,
  getSalesSummary
};