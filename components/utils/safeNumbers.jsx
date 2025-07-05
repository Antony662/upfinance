// Utilitário centralizado para números seguros
export const safeNumber = (value) => {
  // Verificações mais rigorosas
  if (value === null || value === undefined || value === '' || value === 'NaN') return 0;
  if (typeof value === 'string' && (value.trim() === '' || value.toLowerCase() === 'nan')) return 0;
  if (typeof value === 'boolean') return value ? 1 : 0;
  
  const num = parseFloat(value);
  return isNaN(num) || !isFinite(num) || num === Infinity || num === -Infinity ? 0 : num;
};

export const safePercent = (numerator, denominator) => {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  if (den === 0) return 0;
  const result = (num / den) * 100;
  return safeNumber(result); // Aplicar safeNumber no resultado também
};

export const safeDivision = (numerator, denominator) => {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  if (den === 0) return 0;
  const result = num / den;
  return safeNumber(result);
};

export const formatCurrency = (value) => {
  const num = safeNumber(value);
  try {
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch (error) {
    return '0,00';
  }
};

export const formatPercent = (value) => {
  const num = safeNumber(value);
  return num.toFixed(1);
};

// Função para sanitizar dados para gráficos
export const sanitizeChartData = (data) => {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => {
    if (!item || typeof item !== 'object') return {};
    
    const sanitized = {};
    Object.keys(item).forEach(key => {
      const value = item[key];
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
        sanitized[key] = safeNumber(value);
      } else {
        sanitized[key] = value;
      }
    });
    return sanitized;
  });
};

// Função para validar objetos antes de usar em cálculos
export const validateObject = (obj) => {
  if (!obj || typeof obj !== 'object') return {};
  return obj;
};