import moment from 'moment';

// Local storage keys
const STORAGE_KEYS = {
  BANKS: 'finance_banks',
  INVESTMENTS: 'finance_investments',
  DEBTS: 'finance_debts',
  EXPENSES: 'finance_expenses',
  SETTINGS: 'finance_settings'
};

// Initialize default data structure
const getDefaultData = () => ({
  banks: [],
  investments: [],
  debts: [],
  expenses: [],
  settings: {
    currency: 'GBP',
    theme: 'light'
  }
});

// Helper functions for localStorage
const getFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

// Initialize data if not exists
const initializeData = () => {
  const hasData = localStorage.getItem(STORAGE_KEYS.BANKS) !== null;
  if (!hasData) {
    const defaultData = getDefaultData();
    saveToStorage(STORAGE_KEYS.BANKS, defaultData.banks);
    saveToStorage(STORAGE_KEYS.INVESTMENTS, defaultData.investments);
    saveToStorage(STORAGE_KEYS.DEBTS, defaultData.debts);
    saveToStorage(STORAGE_KEYS.EXPENSES, defaultData.expenses);
    saveToStorage(STORAGE_KEYS.SETTINGS, defaultData.settings);
  }
};

// Dashboard API calls
export const getDashboard = async () => {
  initializeData();
  
  const banks = getFromStorage(STORAGE_KEYS.BANKS);
  const investments = getFromStorage(STORAGE_KEYS.INVESTMENTS);
  const debts = getFromStorage(STORAGE_KEYS.DEBTS);
  const expenses = getFromStorage(STORAGE_KEYS.EXPENSES);
  
  const totalAssets = banks.reduce((sum, bank) => sum + (bank.balance || 0), 0) +
                     investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  
  const totalLiabilities = debts.reduce((sum, debt) => sum + (debt.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  
  const currentMonth = moment().format('YYYY-MM');
  const monthlyExpenses = expenses
    .filter(exp => moment(exp.date).format('YYYY-MM') === currentMonth && exp.type === 'expense')
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  const monthlyIncome = expenses
    .filter(exp => moment(exp.date).format('YYYY-MM') === currentMonth && exp.type === 'income')
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    monthlyExpenses,
    monthlyIncome,
    banks,
    investments,
    debts,
    expenses
  };
};

export const getBalanceSheet = async () => {
  initializeData();
  
  const banks = getFromStorage(STORAGE_KEYS.BANKS);
  const investments = getFromStorage(STORAGE_KEYS.INVESTMENTS);
  const debts = getFromStorage(STORAGE_KEYS.DEBTS);
  
  const assets = {
    banks,
    investments,
    total: banks.reduce((sum, bank) => sum + (bank.balance || 0), 0) +
           investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0)
  };
  
  const liabilities = {
    debts,
    total: debts.reduce((sum, debt) => sum + (debt.amount || 0), 0)
  };
  
  return {
    assets,
    liabilities,
    netWorth: assets.total - liabilities.total
  };
};

export const getCashFlow = async () => {
  initializeData();
  
  const expenses = getFromStorage(STORAGE_KEYS.EXPENSES);
  const currentMonth = moment().format('YYYY-MM');
  const monthlyTransactions = expenses.filter(t => 
    moment(t.date).format('YYYY-MM') === currentMonth
  );
  
  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const expensesAmount = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const netCashFlow = income - expensesAmount;
  
  return {
    currentMonth,
    income,
    expenses: expensesAmount,
    netCashFlow,
    transactions: monthlyTransactions
  };
};

// Bank accounts API calls
export const addBankAccount = async (bankData) => {
  const banks = getFromStorage(STORAGE_KEYS.BANKS);
  const newBank = {
    ...bankData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  const updatedBanks = [...banks, newBank];
  saveToStorage(STORAGE_KEYS.BANKS, updatedBanks);
  return newBank;
};

export const updateBankAccount = async (bankData) => {
  const banks = getFromStorage(STORAGE_KEYS.BANKS);
  const updatedBanks = banks.map(bank => 
    bank.id === bankData.id ? { ...bank, ...bankData, updatedAt: new Date().toISOString() } : bank
  );
  
  saveToStorage(STORAGE_KEYS.BANKS, updatedBanks);
  return bankData;
};

export const deleteBank = async (id) => {
  const banks = getFromStorage(STORAGE_KEYS.BANKS);
  const updatedBanks = banks.filter(bank => bank.id !== id);
  saveToStorage(STORAGE_KEYS.BANKS, updatedBanks);
  return { success: true };
};

// Investments API calls
export const addInvestment = async (investmentData) => {
  const investments = getFromStorage(STORAGE_KEYS.INVESTMENTS);
  const newInvestment = {
    ...investmentData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  const updatedInvestments = [...investments, newInvestment];
  saveToStorage(STORAGE_KEYS.INVESTMENTS, updatedInvestments);
  return newInvestment;
};

export const updateInvestment = async (investmentData) => {
  const investments = getFromStorage(STORAGE_KEYS.INVESTMENTS);
  const updatedInvestments = investments.map(inv => 
    inv.id === investmentData.id ? { ...inv, ...investmentData, updatedAt: new Date().toISOString() } : inv
  );
  
  saveToStorage(STORAGE_KEYS.INVESTMENTS, updatedInvestments);
  return investmentData;
};

export const deleteInvestment = async (id) => {
  const investments = getFromStorage(STORAGE_KEYS.INVESTMENTS);
  const updatedInvestments = investments.filter(inv => inv.id !== id);
  saveToStorage(STORAGE_KEYS.INVESTMENTS, updatedInvestments);
  return { success: true };
};

// Debts API calls
export const addDebt = async (debtData) => {
  const debts = getFromStorage(STORAGE_KEYS.DEBTS);
  const newDebt = {
    ...debtData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  const updatedDebts = [...debts, newDebt];
  saveToStorage(STORAGE_KEYS.DEBTS, updatedDebts);
  return newDebt;
};

export const updateDebt = async (debtData) => {
  const debts = getFromStorage(STORAGE_KEYS.DEBTS);
  const updatedDebts = debts.map(debt => 
    debt.id === debtData.id ? { ...debt, ...debtData, updatedAt: new Date().toISOString() } : debt
  );
  
  saveToStorage(STORAGE_KEYS.DEBTS, updatedDebts);
  return debtData;
};

export const deleteDebt = async (id) => {
  const debts = getFromStorage(STORAGE_KEYS.DEBTS);
  const updatedDebts = debts.filter(debt => debt.id !== id);
  saveToStorage(STORAGE_KEYS.DEBTS, updatedDebts);
  return { success: true };
};

// Expenses API calls
export const addExpense = async (expenseData) => {
  const expenses = getFromStorage(STORAGE_KEYS.EXPENSES);
  const newExpense = {
    ...expenseData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  const updatedExpenses = [...expenses, newExpense];
  saveToStorage(STORAGE_KEYS.EXPENSES, updatedExpenses);
  return newExpense;
};

export const updateExpense = async (expenseData) => {
  const expenses = getFromStorage(STORAGE_KEYS.EXPENSES);
  const updatedExpenses = expenses.map(exp => 
    exp.id === expenseData.id ? { ...exp, ...expenseData, updatedAt: new Date().toISOString() } : exp
  );
  
  saveToStorage(STORAGE_KEYS.EXPENSES, updatedExpenses);
  return expenseData;
};

export const deleteExpense = async (id) => {
  const expenses = getFromStorage(STORAGE_KEYS.EXPENSES);
  const updatedExpenses = expenses.filter(exp => exp.id !== id);
  saveToStorage(STORAGE_KEYS.EXPENSES, updatedExpenses);
  return { success: true };
};

// Import/Export functionality
export const importExcel = async (file) => {
  // For GitHub Pages, we'll implement a simple CSV import
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
              row[header.trim()] = values[index] ? values[index].trim() : '';
            });
            data.push(row);
          }
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    reader.readAsText(file);
  });
};

export const exportExcel = async () => {
  // For GitHub Pages, we'll export as CSV
  const banks = getFromStorage(STORAGE_KEYS.BANKS);
  const investments = getFromStorage(STORAGE_KEYS.INVESTMENTS);
  const debts = getFromStorage(STORAGE_KEYS.DEBTS);
  const expenses = getFromStorage(STORAGE_KEYS.EXPENSES);
  
  const allData = {
    banks,
    investments,
    debts,
    expenses
  };
  
  const csvContent = JSON.stringify(allData, null, 2);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finance_data_${moment().format('YYYY-MM-DD')}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  return { success: true };
};

// Mock external API calls for GitHub Pages
export const updateInvestmentPrices = async () => {
  // Mock function for GitHub Pages
  return { success: true, message: 'Prices updated (mock data)' };
};

export const fetchStockPrice = async (symbol) => {
  // Mock function for GitHub Pages
  return { symbol, price: Math.random() * 100 + 50, change: Math.random() * 10 - 5 };
};

export const fetchMultipleStockPrices = async (symbols) => {
  // Mock function for GitHub Pages
  return symbols.map(symbol => ({
    symbol,
    price: Math.random() * 100 + 50,
    change: Math.random() * 10 - 5
  }));
};

export const fetchExchangeRates = async () => {
  // Mock function for GitHub Pages
  return {
    USD: 1.0,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.0
  };
};

export const fetchCryptoPrices = async (ids) => {
  // Mock function for GitHub Pages
  return ids.map(id => ({
    id,
    price: Math.random() * 50000 + 1000,
    change: Math.random() * 20 - 10
  }));
};

export const fetchMarketIndices = async () => {
  // Mock function for GitHub Pages
  return [
    { name: 'S&P 500', value: 4500 + Math.random() * 100, change: Math.random() * 2 - 1 },
    { name: 'NASDAQ', value: 14000 + Math.random() * 200, change: Math.random() * 3 - 1.5 },
    { name: 'DOW', value: 35000 + Math.random() * 500, change: Math.random() * 2 - 1 }
  ];
};

// Utility functions
export const formatCurrency = (amount, currency = 'GBP') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency
  }).format(amount || 0);
};

export const formatGBP = (amount) => {
  return formatCurrency(amount, 'GBP');
};

export const formatUSD = (amount) => {
  return formatCurrency(amount, 'USD');
};

export const formatPercentage = (value) => {
  return `${(value || 0).toFixed(2)}%`;
};

export const calculateChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Settings management
export const getSettings = () => {
  return getFromStorage(STORAGE_KEYS.SETTINGS, { currency: 'GBP', theme: 'light' });
};

export const updateSettings = (settings) => {
  const currentSettings = getFromStorage(STORAGE_KEYS.SETTINGS, { currency: 'GBP', theme: 'light' });
  const updatedSettings = { ...currentSettings, ...settings };
  saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
  return updatedSettings;
};