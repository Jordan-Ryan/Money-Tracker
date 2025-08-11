import axios from 'axios';

const API_BASE_URL = '/api/finance';
const EXTERNAL_API_URL = '/api/external';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for adding auth headers if needed
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

// Dashboard API calls
export const getDashboard = async () => {
  try {
    const response = await api.get('/dashboard');
    return response;
  } catch (error) {
    throw new Error('Failed to fetch dashboard data');
  }
};

export const getBalanceSheet = async () => {
  try {
    const response = await api.get('/balance-sheet');
    return response;
  } catch (error) {
    throw new Error('Failed to fetch balance sheet data');
  }
};

export const getCashFlow = async () => {
  try {
    const response = await api.get('/cash-flow');
    return response;
  } catch (error) {
    throw new Error('Failed to fetch cash flow data');
  }
};

// Bank accounts API calls
export const addBankAccount = async (bankData) => {
  try {
    const response = await api.post('/banks', bankData);
    return response;
  } catch (error) {
    throw new Error('Failed to add bank account');
  }
};

export const updateBankAccount = async (bankData) => {
  try {
    const response = await api.post('/banks', bankData);
    return response;
  } catch (error) {
    throw new Error('Failed to update bank account');
  }
};

export const deleteBank = async (id) => {
  try {
    const response = await api.delete(`/banks/${id}`);
    return response;
  } catch (error) {
    throw new Error('Failed to delete bank account');
  }
};

// Investments API calls
export const addInvestment = async (investmentData) => {
  try {
    const response = await api.post('/investments', investmentData);
    return response;
  } catch (error) {
    throw new Error('Failed to add investment');
  }
};

export const updateInvestment = async (investmentData) => {
  try {
    const response = await api.post('/investments', investmentData);
    return response;
  } catch (error) {
    throw new Error('Failed to update investment');
  }
};

export const deleteInvestment = async (id) => {
  try {
    const response = await api.delete(`/investments/${id}`);
    return response;
  } catch (error) {
    throw new Error('Failed to delete investment');
  }
};

// Debts API calls
export const addDebt = async (debtData) => {
  try {
    const response = await api.post('/debts', debtData);
    return response;
  } catch (error) {
    throw new Error('Failed to add debt');
  }
};

export const updateDebt = async (debtData) => {
  try {
    const response = await api.post('/debts', debtData);
    return response;
  } catch (error) {
    throw new Error('Failed to update debt');
  }
};

export const deleteDebt = async (id) => {
  try {
    const response = await api.delete(`/debts/${id}`);
    return response;
  } catch (error) {
    throw new Error('Failed to delete debt');
  }
};

// Expenses API calls
export const addExpense = async (expenseData) => {
  try {
    const response = await api.post('/expenses', expenseData);
    return response;
  } catch (error) {
    throw new Error('Failed to add expense');
  }
};

export const updateExpense = async (expenseData) => {
  try {
    const response = await api.post('/expenses', expenseData);
    return response;
  } catch (error) {
    throw new Error('Failed to update expense');
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`/expenses/${id}`);
    return response;
  } catch (error) {
    throw new Error('Failed to delete expense');
  }
};

// Excel import/export API calls
export const importExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/import-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw new Error('Failed to import Excel data');
  }
};

export const exportExcel = async () => {
  try {
    const response = await api.get('/export-excel', {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'finance-data.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to export Excel data');
  }
};

// Update investment prices with live data
export const updateInvestmentPrices = async () => {
  try {
    const response = await api.post('/update-investment-prices');
    return response.data;
  } catch (error) {
    console.error('Error updating investment prices:', error);
    throw error;
  }
};

// External API calls for live data
export const fetchStockPrice = async (symbol) => {
  try {
    const response = await axios.get(`${EXTERNAL_API_URL}/stock-price/${symbol}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch stock price for ${symbol}`);
  }
};

export const fetchMultipleStockPrices = async (symbols) => {
  try {
    const response = await axios.post(`${EXTERNAL_API_URL}/stock-prices`, { symbols });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch stock prices');
  }
};

export const fetchExchangeRates = async () => {
  try {
    const response = await axios.get(`${EXTERNAL_API_URL}/exchange-rates`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch exchange rates');
  }
};

export const fetchCryptoPrices = async (ids) => {
  try {
    const response = await axios.get(`${EXTERNAL_API_URL}/crypto-prices`, {
      params: { ids },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch crypto prices');
  }
};

export const fetchMarketIndices = async () => {
  try {
    const response = await axios.get(`${EXTERNAL_API_URL}/market-indices`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch market indices');
  }
};

// Utility function to format currency (defaults to GBP)
export const formatCurrency = (amount, currency = 'GBP') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Utility function to format GBP currency specifically
export const formatGBP = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Utility function to format USD currency
export const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Utility function to format percentage
export const formatPercentage = (value) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

// Utility function to calculate change
export const calculateChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};