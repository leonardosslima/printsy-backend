import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboard } from '@/lib/api';
import { 
  TrendingUp, 
  Users, 
  Package, 
  FileText, 
  ShoppingCart, 
  CreditCard,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

const MetricCard = ({ title, value, icon: Icon, trend, color }: MetricCardProps) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`h-4 w-4 mr-1 ${
              trend.isPositive ? 'rotate-0' : 'rotate-180'
            }`} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboard.getMetrics,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const { data: alerts } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: dashboard.getAlerts,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar dashboard
        </h3>
        <p className="text-gray-600">
          Não foi possível carregar os dados. Tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* Alertas */}
      {alerts && alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Alertas do sistema
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc space-y-1 ml-5">
                  {alerts.map((alert: any, index: number) => (
                    <li key={index}>{alert.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Faturamento Mensal"
          value={`R$ ${metrics?.revenue?.toLocaleString('pt-BR') || '0,00'}`}
          icon={DollarSign}
          trend={metrics?.revenueTrend}
          color="bg-green-500"
        />
        
        <MetricCard
          title="Clientes Ativos"
          value={metrics?.activeCustomers || 0}
          icon={Users}
          trend={metrics?.customersTrend}
          color="bg-blue-500"
        />
        
        <MetricCard
          title="Orçamentos Pendentes"
          value={metrics?.pendingQuotes || 0}
          icon={FileText}
          color="bg-yellow-500"
        />
        
        <MetricCard
          title="Pedidos em Produção"
          value={metrics?.ordersInProduction || 0}
          icon={ShoppingCart}
          color="bg-purple-500"
        />
      </div>

      {/* Cards de informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos com estoque baixo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Estoque Baixo
            </h3>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          {metrics?.lowStockProducts?.length > 0 ? (
            <div className="space-y-3">
              {metrics.lowStockProducts.slice(0, 5).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      Estoque atual: {product.currentStock}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Baixo
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Todos os produtos com estoque adequado
            </p>
          )}
        </div>

        {/* Pedidos recentes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Pedidos Recentes
            </h3>
            <ShoppingCart className="h-5 w-5 text-gray-400" />
          </div>
          {metrics?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {metrics.recentOrders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.number}
                    </p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      R$ {order.total?.toLocaleString('pt-BR') || '0,00'}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'in_production' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.statusLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Nenhum pedido recente
            </p>
          )}
        </div>
      </div>

      {/* Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas a receber */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Contas a Receber
            </h3>
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total em aberto:</span>
              <span className="text-sm font-medium text-gray-900">
                R$ {metrics?.totalReceivables?.toLocaleString('pt-BR') || '0,00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vencidas:</span>
              <span className="text-sm font-medium text-red-600">
                R$ {metrics?.overdueReceivables?.toLocaleString('pt-BR') || '0,00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Próximo vencimento:</span>
              <span className="text-sm font-medium text-yellow-600">
                {metrics?.nextDueDate || 'Nenhuma'}
              </span>
            </div>
          </div>
        </div>

        {/* Contas a pagar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Contas a Pagar
            </h3>
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total em aberto:</span>
              <span className="text-sm font-medium text-gray-900">
                R$ {metrics?.totalPayables?.toLocaleString('pt-BR') || '0,00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vencidas:</span>
              <span className="text-sm font-medium text-red-600">
                R$ {metrics?.overduePayables?.toLocaleString('pt-BR') || '0,00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Próximo vencimento:</span>
              <span className="text-sm font-medium text-yellow-600">
                {metrics?.nextPaymentDate || 'Nenhuma'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;