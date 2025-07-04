const moment = require('moment');

/**
 * Gera um número único sequencial para orçamentos/pedidos
 */
const generateSequentialNumber = (prefix, lastNumber) => {
  const currentYear = moment().format('YYYY');
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `${prefix}${currentYear}${nextNumber}`;
};

/**
 * Formata valores monetários para exibição
 */
const formatCurrency = (value, currency = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(value);
};

/**
 * Formata datas para exibição brasileira
 */
const formatDate = (date, format = 'DD/MM/YYYY') => {
  return moment(date).format(format);
};

/**
 * Calcula a diferença entre datas em dias
 */
const daysDifference = (startDate, endDate = new Date()) => {
  return moment(endDate).diff(moment(startDate), 'days');
};

/**
 * Verifica se uma data está vencida
 */
const isOverdue = (dueDate) => {
  return moment().isAfter(moment(dueDate), 'day');
};

/**
 * Remove caracteres especiais de documentos (CPF/CNPJ)
 */
const cleanDocument = (document) => {
  if (!document) return null;
  return document.replace(/[^\d]/g, '');
};

/**
 * Valida CPF
 */
const isValidCPF = (cpf) => {
  cpf = cleanDocument(cpf);
  
  if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  return remainder === parseInt(cpf.charAt(10));
};

/**
 * Valida CNPJ
 */
const isValidCNPJ = (cnpj) => {
  cnpj = cleanDocument(cnpj);
  
  if (!cnpj || cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i];
  }
  
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (digit1 !== parseInt(cnpj.charAt(12))) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i];
  }
  
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return digit2 === parseInt(cnpj.charAt(13));
};

/**
 * Calcula total de itens (quantidade * preço unitário)
 */
const calculateItemTotal = (quantity, unitPrice) => {
  return parseFloat((quantity * unitPrice).toFixed(2));
};

/**
 * Calcula desconto sobre um valor
 */
const calculateDiscount = (total, discountPercent) => {
  const discount = total * (discountPercent / 100);
  return {
    discountAmount: parseFloat(discount.toFixed(2)),
    finalTotal: parseFloat((total - discount).toFixed(2))
  };
};

/**
 * Paginação helper
 */
const calculatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    totalPages,
    offset,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

module.exports = {
  generateSequentialNumber,
  formatCurrency,
  formatDate,
  daysDifference,
  isOverdue,
  cleanDocument,
  isValidCPF,
  isValidCNPJ,
  calculateItemTotal,
  calculateDiscount,
  calculatePagination
};