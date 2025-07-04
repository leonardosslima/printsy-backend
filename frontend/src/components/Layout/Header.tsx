import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Bell } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Espaço para breadcrumb ou título da página */}
        <div className="flex-1">
          {/* Pode ser expandido futuramente */}
        </div>

        {/* Actions e usuário */}
        <div className="flex items-center space-x-4">
          {/* Notificações */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* Informações do usuário */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
              </p>
            </div>
            
            {/* Avatar */}
            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full">
              <User className="h-4 w-4 text-primary-600" />
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;