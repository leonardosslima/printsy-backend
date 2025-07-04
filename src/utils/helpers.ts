import moment from 'moment';

/**
 * Gerar número sequencial com prefixo
 */
export const generateSequentialNumber = (prefix: string, lastNumber: number): string => {
  const newNumber = lastNumber + 1;
  const paddedNumber = newNumber.toString().padStart(4, '0');
  return `${prefix}${paddedNumber}`;
};

/**
 * Calcular total do item (quantidade x preço unitário)
 */
export const calculateItemTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};

/**
 * Verificar se uma data está vencida
 */
export const isOverdue = (date: Date): boolean => {
  return moment(date).isBefore(moment(), 'day');
};

/**
 * Calcular paginação
 */
export const calculatePagination = (page: number, limit: number, total: number) => {
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    offset,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Formatar valor monetário para BRL
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formatar data para exibição
 */
export const formatDate = (date: Date, format: string = 'DD/MM/YYYY'): string => {
  return moment(date).format(format);
};

/**
 * Calcular diferença em dias entre duas datas
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  return moment(date2).diff(moment(date1), 'days');
};

/**
 * Gerar cores aleatórias para gráficos
 */
export const generateRandomColor = (): string => {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Capitalizar primeira letra de cada palavra
 */
export const titleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Remover acentos de uma string
 */
export const removeAccents = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Gerar slug a partir de uma string
 */
export const generateSlug = (str: string): string => {
  return removeAccents(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Validar CPF
 */
export const isValidCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, '');
  
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) {
    return false;
  }
  
  const cpfArray = cpf.split('').map(el => +el);
  const rest = (count: number): number => {
    return (((cpfArray.slice(0, count - 12)
      .reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10) % 11) % 10);
  };
  
  return rest(10) === cpfArray[9] && rest(11) === cpfArray[10];
};

/**
 * Validar CNPJ
 */
export const isValidCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  
  if (cnpj.length !== 14) return false;
  
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  return result === parseInt(digits.charAt(1));
};

/**
 * Formatar CPF/CNPJ
 */
export const formatDocument = (document: string): string => {
  const cleanDoc = document.replace(/[^\d]/g, '');
  
  if (cleanDoc.length === 11) {
    // CPF
    return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleanDoc.length === 14) {
    // CNPJ
    return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return document;
};

/**
 * Formatar telefone
 */
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Calcular porcentagem
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Truncar texto
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Gerar cor baseada no status
 */
export const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    // Orçamentos
    'DRAFT': '#6B7280',
    'SENT': '#3B82F6',
    'VIEWED': '#F59E0B',
    'APPROVED': '#10B981',
    'REJECTED': '#EF4444',
    'EXPIRED': '#6B7280',
    'CONVERTED': '#8B5CF6',
    
    // Pedidos
    'PENDING': '#F59E0B',
    'CONFIRMED': '#3B82F6',
    'IN_PRODUCTION': '#8B5CF6',
    'READY': '#10B981',
    'DELIVERED': '#059669',
    'CANCELLED': '#EF4444',
    
    // Financeiro
    'PAID': '#10B981',
    'PARTIAL': '#F59E0B',
    'OVERDUE': '#EF4444',
    
    // Prioridades
    'LOW': '#6B7280',
    'NORMAL': '#3B82F6',
    'HIGH': '#F59E0B',
    'URGENT': '#EF4444'
  };
  
  return statusColors[status] || '#6B7280';
};

/**
 * Converter status para texto legível
 */
export const getStatusLabel = (status: string): string => {
  const statusLabels: { [key: string]: string } = {
    // Orçamentos
    'DRAFT': 'Rascunho',
    'SENT': 'Enviado',
    'VIEWED': 'Visualizado',
    'APPROVED': 'Aprovado',
    'REJECTED': 'Rejeitado',
    'EXPIRED': 'Expirado',
    'CONVERTED': 'Convertido',
    
    // Pedidos
    'PENDING': 'Pendente',
    'CONFIRMED': 'Confirmado',
    'IN_PRODUCTION': 'Em Produção',
    'READY': 'Pronto',
    'DELIVERED': 'Entregue',
    'CANCELLED': 'Cancelado',
    
    // Financeiro
    'PAID': 'Pago',
    'PARTIAL': 'Parcial',
    'OVERDUE': 'Vencido',
    
    // Prioridades
    'LOW': 'Baixa',
    'NORMAL': 'Normal',
    'HIGH': 'Alta',
    'URGENT': 'Urgente'
  };
  
  return statusLabels[status] || status;
};