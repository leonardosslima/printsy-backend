import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  ShoppingCart, 
  CreditCard,
  Settings,
  Printer
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Clientes',
    href: '/customers',
    icon: Users
  },
  {
    name: 'Produtos',
    href: '/products',
    icon: Package
  },
  {
    name: 'Orçamentos',
    href: '/quotes',
    icon: FileText
  },
  {
    name: 'Pedidos',
    href: '/orders',
    icon: ShoppingCart
  },
  {
    name: 'Financeiro',
    href: '/financial',
    icon: CreditCard
  }
];

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Printer className="h-8 w-8 text-primary-600" />
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">Printsy.io</h1>
            <p className="text-xs text-gray-500">Gestão de Gráficas</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="mt-6">
        <div className="px-3">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0`}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Configurações */}
      <div className="absolute bottom-0 w-64 p-3 border-t border-gray-200">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <Settings className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          Configurações
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;