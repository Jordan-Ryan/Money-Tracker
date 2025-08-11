# Personal Finance Tracker - Demo Guide

This guide demonstrates how to use the Personal Finance Tracker application with sample data and API calls.

## 🚀 Quick Start

### 1. Start the Application
```bash
# Install dependencies (if not already done)
npm install
cd client && npm install && cd ..

# Start the backend server
npm run dev

# In another terminal, build the frontend
npm run build:client
```

### 2. Access the Application
Open your browser and navigate to: `http://localhost:5000`

## 📊 Sample Data Setup

The application comes with sample data that demonstrates all features. Here's how to add it programmatically:

### Add Bank Account
```bash
curl -X POST http://localhost:5000/api/finance/banks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Account",
    "balance": 10000,
    "accountNumber": "1234567890",
    "bankName": "Chase Bank"
  }'
```

### Add Investment
```bash
curl -X POST http://localhost:5000/api/finance/investments \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "shares": 100,
    "purchasePrice": 150,
    "currentPrice": 175,
    "currentValue": 17500
  }'
```

### Add Income Transaction
```bash
curl -X POST http://localhost:5000/api/finance/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Salary",
    "amount": 5000,
    "description": "Monthly salary",
    "date": "2025-08-01",
    "type": "income"
  }'
```

### Add Expense Transaction
```bash
curl -X POST http://localhost:5000/api/finance/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Rent",
    "amount": 1500,
    "description": "Monthly rent",
    "date": "2025-08-01",
    "type": "expense"
  }'
```

## 🔍 Testing the API

### Dashboard Overview
```bash
curl -s http://localhost:5000/api/finance/dashboard | python3 -m json.tool
```

**Expected Response:**
```json
{
  "totalAssets": 27500,
  "totalLiabilities": 0,
  "netWorth": 27500,
  "monthlyExpenses": 1500,
  "monthlyIncome": 5000,
  "banks": [...],
  "investments": [...],
  "debts": [],
  "expenses": [...]
}
```

### Balance Sheet
```bash
curl -s http://localhost:5000/api/finance/balance-sheet | python3 -m json.tool
```

**Expected Response:**
```json
{
  "assets": {
    "banks": [...],
    "investments": [...],
    "total": 27500
  },
  "liabilities": {
    "debts": [],
    "total": 0
  },
  "netWorth": 27500
}
```

### Cash Flow Analysis
```bash
curl -s http://localhost:5000/api/finance/cash-flow | python3 -m json.tool
```

**Expected Response:**
```json
{
  "currentMonth": "2025-08",
  "income": 5000,
  "expenses": 1500,
  "netCashFlow": 3500,
  "transactions": [...]
}
```

## 🎯 Key Features Demonstrated

### 1. **Dashboard View**
- Total Assets: $27,500 (Bank: $10,000 + Investment: $17,500)
- Net Worth: $27,500
- Monthly Income: $5,000
- Monthly Expenses: $1,500
- Net Cash Flow: $3,500

### 2. **Balance Sheet**
- **Assets**: Bank accounts and investments with live valuations
- **Liabilities**: Outstanding debts (currently none)
- **Net Worth**: Automatic calculation

### 3. **Cash Flow Tracking**
- **Income**: Salary and other income sources
- **Expenses**: Categorized spending (rent, utilities, etc.)
- **Projections**: Future balance estimates

### 4. **Data Management**
- Add/Edit/Delete banks, investments, debts, and expenses
- Excel import/export functionality
- Real-time data updates

## 📱 Using the Web Interface

### Navigation
1. **Dashboard**: Overview of financial position
2. **Balance Sheet**: Detailed assets and liabilities
3. **Cash Flow**: Income, expenses, and projections
4. **Settings**: Data import/export and configuration

### Adding Data
1. Click the "+" buttons on any page
2. Fill in the required information
3. Submit to save the data
4. View updates in real-time

### Charts and Visualizations
- **Pie Charts**: Asset distribution and expense breakdown
- **Bar Charts**: Monthly spending patterns
- **Line Charts**: Financial projections over time

## 🔧 External API Integration

### Stock Prices
```bash
curl -s "http://localhost:5000/api/external/stock-price/AAPL" | python3 -m json.tool
```

### Exchange Rates
```bash
curl -s "http://localhost:5000/api/external/exchange-rates" | python3 -m json.tool
```

### Cryptocurrency Prices
```bash
curl -s "http://localhost:5000/api/external/crypto-prices" | python3 -m json.tool
```

## 📊 Excel Import/Export

### Export Current Data
1. Go to Settings page
2. Click "Export to Excel"
3. Download the generated file

### Import Data
1. Prepare Excel file with correct format
2. Go to Settings page
3. Click "Import from Excel"
4. Select your file
5. Data will be imported automatically

## 🚨 Troubleshooting

### Common Issues

1. **Server not starting**
   - Check if port 5000 is available
   - Ensure all dependencies are installed
   - Check console for error messages

2. **API calls failing**
   - Verify server is running on port 5000
   - Check CORS settings
   - Ensure proper JSON format in requests

3. **Frontend not loading**
   - Build the client: `npm run build:client`
   - Check browser console for errors
   - Verify static file serving is configured

### Debug Mode
```bash
# Start server with debug logging
DEBUG=* npm run dev

# Check server logs
tail -f server.log
```

## 🎉 Next Steps

1. **Add more financial data** using the web interface
2. **Explore different expense categories** and track spending patterns
3. **Test Excel import/export** with your own data
4. **Integrate with real bank APIs** (Plaid, etc.)
5. **Add user authentication** for multi-user support
6. **Implement database storage** for production use

## 📞 Support

- Check the README.md for detailed documentation
- Review API endpoints in the routes/ directory
- Examine component structure in client/src/components/
- Test individual features using the provided curl commands

---

**Happy Financial Tracking! 💰📈**