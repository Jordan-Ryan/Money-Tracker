const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const moment = require('moment');
const axios = require('axios'); // Added axios for live data

// In-memory storage (replace with database in production)
let financeData = {
  banks: [],
  investments: [],
  debts: [],
  expenses: []
};

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Get dashboard overview
router.get('/dashboard', (req, res) => {
  try {
    const totalAssets = financeData.banks.reduce((sum, bank) => sum + bank.balance, 0) +
                       financeData.investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    
    const totalLiabilities = financeData.debts.reduce((sum, debt) => sum + debt.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    
    const currentMonth = moment().format('YYYY-MM');
    const monthlyExpenses = financeData.expenses
      .filter(exp => moment(exp.date).format('YYYY-MM') === currentMonth && exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const monthlyIncome = financeData.expenses
      .filter(exp => moment(exp.date).format('YYYY-MM') === currentMonth && exp.type === 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    res.json({
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyExpenses,
      monthlyIncome,
      banks: financeData.banks,
      investments: financeData.investments,
      debts: financeData.debts,
      expenses: financeData.expenses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get balance sheet
router.get('/balance-sheet', (req, res) => {
  try {
    const assets = {
      banks: financeData.banks,
      investments: financeData.investments,
      total: financeData.banks.reduce((sum, bank) => sum + bank.balance, 0) +
             financeData.investments.reduce((sum, inv) => sum + inv.currentValue, 0)
    };
    
    const liabilities = {
      debts: financeData.debts,
      total: financeData.debts.reduce((sum, debt) => sum + debt.amount, 0)
    };
    
    res.json({
      assets,
      liabilities,
      netWorth: assets.total - liabilities.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cash flow
router.get('/cash-flow', (req, res) => {
  try {
    const currentMonth = moment().format('YYYY-MM');
    const monthlyTransactions = financeData.expenses.filter(t => 
      moment(t.date).format('YYYY-MM') === currentMonth
    );
    
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netCashFlow = income - expenses;
    
    res.json({
      currentMonth,
      income,
      expenses,
      netCashFlow,
      transactions: monthlyTransactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/Update bank account
router.post('/banks', (req, res) => {
  try {
    const { id, name, balance, accountNumber, bankName } = req.body;
    
    if (id) {
      const index = financeData.banks.findIndex(b => b.id === id);
      if (index !== -1) {
        financeData.banks[index] = { id, name, balance, accountNumber, bankName };
      }
    } else {
      const newBank = {
        id: Date.now().toString(),
        name,
        balance,
        accountNumber,
        bankName
      };
      financeData.banks.push(newBank);
    }
    
    res.json({ success: true, banks: financeData.banks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/Update investment
router.post('/investments', (req, res) => {
  try {
    const { id, symbol, shares, purchasePrice, currentPrice, currentValue } = req.body;
    
    if (id) {
      const index = financeData.investments.findIndex(i => i.id === id);
      if (index !== -1) {
        financeData.investments[index] = { id, symbol, shares, purchasePrice, currentPrice, currentValue };
      }
    } else {
      const newInvestment = {
        id: Date.now().toString(),
        symbol,
        shares,
        purchasePrice,
        currentPrice,
        currentValue
      };
      financeData.investments.push(newInvestment);
    }
    
    res.json({ success: true, investments: financeData.investments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/Update debt
router.post('/debts', (req, res) => {
  try {
    const { id, person, amount, description, dueDate } = req.body;
    
    if (id) {
      const index = financeData.debts.findIndex(d => d.id === id);
      if (index !== -1) {
        financeData.debts[index] = { id, person, amount, description, dueDate };
      }
    } else {
      const newDebt = {
        id: Date.now().toString(),
        person,
        amount,
        description,
        dueDate
      };
      financeData.debts.push(newDebt);
    }
    
    res.json({ success: true, debts: financeData.debts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/Update expense
router.post('/expenses', (req, res) => {
  try {
    const { id, category, amount, description, date, type } = req.body;
    
    if (id) {
      const index = financeData.expenses.findIndex(e => e.id === id);
      if (index !== -1) {
        financeData.expenses[index] = { id, category, amount, description, date, type };
      }
    } else {
      const newExpense = {
        id: Date.now().toString(),
        category,
        amount,
        description,
        date,
        type
      };
      financeData.expenses.push(newExpense);
    }
    
    res.json({ success: true, expenses: financeData.expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete endpoints
router.delete('/banks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = financeData.banks.findIndex(bank => bank.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    financeData.banks.splice(index, 1);
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/investments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = financeData.investments.findIndex(investment => investment.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    financeData.investments.splice(index, 1);
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/debts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = financeData.debts.findIndex(debt => debt.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    financeData.debts.splice(index, 1);
    res.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = financeData.expenses.findIndex(expense => expense.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    financeData.expenses.splice(index, 1);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import Excel data
router.post('/import-excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const workbook = xlsx.readFile(req.file.path);
    const sheetNames = workbook.SheetNames;
    const importedData = {};
    
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      importedData[sheetName] = jsonData;
    });
    
    // Process imported data based on sheet names
    if (importedData.banks) {
      financeData.banks = importedData.banks.map(bank => ({
        id: Date.now().toString() + Math.random(),
        name: bank.name || bank.Name || '',
        balance: parseFloat(bank.balance || bank.Balance || 0),
        accountNumber: bank.accountNumber || bank['Account Number'] || '',
        bankName: bank.bankName || bank['Bank Name'] || ''
      }));
    }
    
    if (importedData.investments) {
      financeData.investments = importedData.investments.map(inv => ({
        id: Date.now().toString() + Math.random(),
        symbol: inv.symbol || inv.Symbol || '',
        shares: parseFloat(inv.shares || inv.Shares || 0),
        purchasePrice: parseFloat(inv.purchasePrice || inv['Purchase Price'] || 0),
        currentPrice: parseFloat(inv.currentPrice || inv['Current Price'] || 0),
        currentValue: parseFloat(inv.currentValue || inv['Current Value'] || 0)
      }));
    }
    
    res.json({ 
      success: true, 
      message: 'Data imported successfully',
      importedData 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export data to Excel
router.get('/export-excel', (req, res) => {
  try {
    const workbook = xlsx.utils.book_new();
    
    // Create sheets for each data type
    if (financeData.banks.length > 0) {
      const banksSheet = xlsx.utils.json_to_sheet(financeData.banks);
      xlsx.utils.book_append_sheet(workbook, banksSheet, 'Banks');
    }
    
    if (financeData.investments.length > 0) {
      const investmentsSheet = xlsx.utils.json_to_sheet(financeData.investments);
      xlsx.utils.book_append_sheet(workbook, investmentsSheet, 'Investments');
    }
    
    if (financeData.debts.length > 0) {
      const debtsSheet = xlsx.utils.json_to_sheet(financeData.debts);
      xlsx.utils.book_append_sheet(workbook, debtsSheet, 'Debts');
    }
    
    if (financeData.expenses.length > 0) {
      const expensesSheet = xlsx.utils.json_to_sheet(financeData.expenses);
      xlsx.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');
    }
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=finance-data.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update investment prices with live data and convert to GBP
router.post('/update-investment-prices', async (req, res) => {
  try {
    if (financeData.investments.length === 0) {
      return res.json({ message: 'No investments to update', updatedCount: 0 });
    }

    const symbols = financeData.investments.map(inv => inv.symbol).filter(Boolean);
    if (symbols.length === 0) {
      return res.json({ message: 'No valid investment symbols found', updatedCount: 0 });
    }

    // Get USD to GBP exchange rate
    let usdToGbp = 0.79; // Default fallback rate
    try {
      const exchangeResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      usdToGbp = exchangeResponse.data.rates.GBP || 0.79;
    } catch (exchangeError) {
      console.warn('Using fallback exchange rate:', usdToGbp);
    }

    let updatedCount = 0;
    for (const investment of financeData.investments) {
      if (investment.symbol) {
        try {
          const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${investment.symbol}`);
          if (response.data && response.data.chart && response.data.chart.result) {
            const result = response.data.chart.result[0];
            const meta = result.meta;
            const currentPriceUSD = meta.regularMarketPrice;
            const currentPriceGBP = currentPriceUSD * usdToGbp;
            
            investment.currentPrice = currentPriceGBP;
            investment.currentPriceUSD = currentPriceUSD;
            investment.lastUpdated = new Date().toISOString();
            investment.usdToGbp = usdToGbp;
            
            updatedCount++;
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to update ${investment.symbol}:`, error.message);
        }
      }
    }

    res.json({ 
      message: `Updated ${updatedCount} investments`, 
      updatedCount,
      usdToGbp,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating investment prices:', error.message);
    res.status(500).json({ error: 'Failed to update investment prices' });
  }
});

module.exports = router;