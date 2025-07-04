import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Configuração base da API
const api = axios.create({
  baseURL: '/api', // Usa o proxy do Vite
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('printsy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.message || 'Erro desconhecido';
    
    // Erro 401 - Token inválido/expirado
    if (error.response?.status === 401) {
      localStorage.removeItem('printsy_token');
      localStorage.removeItem('printsy_user');
      
      // Só redireciona se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
        toast.error('Sessão expirada. Faça login novamente.');
      }
    }
    
    // Erro 403 - Sem permissão
    else if (error.response?.status === 403) {
      toast.error('Você não tem permissão para realizar esta ação.');
    }
    
    // Erro 404 - Não encontrado
    else if (error.response?.status === 404) {
      toast.error('Recurso não encontrado.');
    }
    
    // Erro 422 - Dados inválidos
    else if (error.response?.status === 422) {
      const errors = (error.response?.data as any)?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error(message);
      }
    }
    
    // Erro 429 - Rate limit
    else if (error.response?.status === 429) {
      toast.error('Muitas tentativas. Aguarde um momento e tente novamente.');
    }
    
    // Erro 500 - Erro interno do servidor
    else if (error.response?.status === 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.');
    }
    
    // Erro de rede/timeout
    else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      toast.error('Tempo limite excedido. Verifique sua conexão.');
    }
    
    // Outros erros
    else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Funções de autenticação
export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    
    localStorage.setItem('printsy_token', token);
    localStorage.setItem('printsy_user', JSON.stringify(user));
    
    return { token, user };
  },
  
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data.data;
    
    localStorage.setItem('printsy_token', token);
    localStorage.setItem('printsy_user', JSON.stringify(user));
    
    return { token, user };
  },
  
  logout: () => {
    localStorage.removeItem('printsy_token');
    localStorage.removeItem('printsy_user');
    window.location.href = '/login';
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('printsy_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('printsy_token');
  }
};

// Funções para diferentes módulos
export const dashboard = {
  getMetrics: async () => {
    const response = await api.get('/dashboard');
    return response.data.data;
  },
  
  getCharts: async () => {
    const response = await api.get('/dashboard/charts');
    return response.data.data;
  },
  
  getAlerts: async () => {
    const response = await api.get('/dashboard/alerts');
    return response.data.data;
  }
};

export const customers = {
  getAll: async (params?: any) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/customers', data);
    return response.data.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  }
};

export const products = {
  getAll: async (params?: any) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  moveStock: async (id: string, data: any) => {
    const response = await api.post(`/products/${id}/stock`, data);
    return response.data.data;
  }
};

export const quotes = {
  getAll: async (params?: any) => {
    const response = await api.get('/quotes', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/quotes', data);
    return response.data.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/quotes/${id}`, data);
    return response.data.data;
  },
  
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/quotes/${id}/status`, { status });
    return response.data.data;
  },
  
  convertToOrder: async (id: string) => {
    const response = await api.post(`/quotes/${id}/convert`);
    return response.data.data;
  },
  
  duplicate: async (id: string) => {
    const response = await api.post(`/quotes/${id}/duplicate`);
    return response.data.data;
  },
  
  getStats: async () => {
    const response = await api.get('/quotes/stats');
    return response.data.data;
  }
};

export const orders = {
  getAll: async (params?: any) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/orders', data);
    return response.data.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data.data;
  },
  
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data.data;
  },
  
  duplicate: async (id: string) => {
    const response = await api.post(`/orders/${id}/duplicate`);
    return response.data.data;
  },
  
  getStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data.data;
  },
  
  getKanban: async () => {
    const response = await api.get('/orders/kanban');
    return response.data.data;
  }
};

export const financial = {
  getSummary: async () => {
    const response = await api.get('/financial/summary');
    return response.data.data;
  },
  
  getCashFlow: async (params?: any) => {
    const response = await api.get('/financial/cash-flow', { params });
    return response.data.data;
  },
  
  getReceivables: async (params?: any) => {
    const response = await api.get('/financial/receivables', { params });
    return response.data;
  },
  
  createReceivable: async (data: any) => {
    const response = await api.post('/financial/receivables', data);
    return response.data.data;
  },
  
  markReceivableAsPaid: async (id: string, data?: any) => {
    const response = await api.patch(`/financial/receivables/${id}/pay`, data);
    return response.data.data;
  },
  
  getPayables: async (params?: any) => {
    const response = await api.get('/financial/payables', { params });
    return response.data;
  },
  
  createPayable: async (data: any) => {
    const response = await api.post('/financial/payables', data);
    return response.data.data;
  },
  
  markPayableAsPaid: async (id: string, data?: any) => {
    const response = await api.patch(`/financial/payables/${id}/pay`, data);
    return response.data.data;
  },
  
  getOverdue: async () => {
    const response = await api.get('/financial/overdue');
    return response.data.data;
  },
  
  getExpenseCategories: async (params?: any) => {
    const response = await api.get('/financial/expense-categories', { params });
    return response.data.data;
  }
};

export default api;