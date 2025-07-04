import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Printer, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirecionar se já estiver logado
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.email, formData.password);
    } catch (error) {
      // Erro já tratado pelo hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fillTestUser = (type: 'admin' | 'user') => {
    setFormData({
      email: type === 'admin' ? 'admin@printsy.io' : 'user@printsy.io',
      password: '123456'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl">
              <Printer className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Bem-vindo ao Printsy.io
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de gestão para gráficas
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input w-full pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Usuários de teste */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Usuários de teste:
          </h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fillTestUser('admin')}
              className="w-full text-left text-sm bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md transition-colors"
            >
              <div className="font-medium text-blue-900">👨‍💼 Administrador</div>
              <div className="text-blue-600">admin@printsy.io / 123456</div>
            </button>
            <button
              type="button"
              onClick={() => fillTestUser('user')}
              className="w-full text-left text-sm bg-green-50 hover:bg-green-100 px-3 py-2 rounded-md transition-colors"
            >
              <div className="font-medium text-green-900">👤 Usuário</div>
              <div className="text-green-600">user@printsy.io / 123456</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Printsy.io © 2024 - Sistema de gestão de gráficas
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;