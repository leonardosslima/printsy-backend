import React from 'react';
import { Package, Plus } from 'lucide-react';

const ProductsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie produtos e controle de estoque</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Em desenvolvimento */}
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Módulo de Produtos
        </h3>
        <p className="text-gray-600 mb-4">
          Esta página está sendo desenvolvida. Em breve você poderá:
        </p>
        <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
          <li>• Cadastrar produtos e serviços</li>
          <li>• Controlar estoque e movimentações</li>
          <li>• Definir preços e categorias</li>
          <li>• Alertas de estoque baixo</li>
          <li>• Relatórios de produtos</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductsPage;