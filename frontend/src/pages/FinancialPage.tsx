import React from 'react';
import { CreditCard, Plus } from 'lucide-react';

const FinancialPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Controle financeiro completo</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Nova Conta</span>
        </button>
      </div>

      {/* Em desenvolvimento */}
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Módulo Financeiro
        </h3>
        <p className="text-gray-600 mb-4">
          Esta página está sendo desenvolvida. Em breve você poderá:
        </p>
        <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
          <li>• Contas a pagar e receber</li>
          <li>• Fluxo de caixa</li>
          <li>• Relatórios financeiros</li>
          <li>• Controle de vencimentos</li>
          <li>• Categorização de despesas</li>
        </ul>
      </div>
    </div>
  );
};

export default FinancialPage;