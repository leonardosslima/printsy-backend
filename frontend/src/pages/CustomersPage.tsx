import React from 'react';
import { Users, Plus } from 'lucide-react';

const CustomersPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes e CRM</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Em desenvolvimento */}
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Módulo de Clientes
        </h3>
        <p className="text-gray-600 mb-4">
          Esta página está sendo desenvolvida. Em breve você poderá:
        </p>
        <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
          <li>• Visualizar lista completa de clientes</li>
          <li>• Adicionar novos clientes</li>
          <li>• Editar informações de contato</li>
          <li>• Buscar e filtrar clientes</li>
          <li>• Histórico de interações</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomersPage;