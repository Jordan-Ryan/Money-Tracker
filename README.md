# Personal Finance Tracker

A comprehensive web application for tracking personal finances, including assets, investments, debts, and cash flow with live market data integration.

## Features

### 🏦 Balance Sheet Overview
- **Bank Accounts**: Track balances from multiple banks
- **Investments**: Monitor stocks/shares with live valuations via Yahoo Finance API
- **Debts**: Track money owed to you by others
- **Net Worth**: Automatic calculation of total assets, liabilities, and net worth

### 💰 Cash Flow Tracking
- **Monthly Income & Expenses**: Categorize and track all financial transactions
- **Projections**: Estimate future balances based on historical trends
- **Historical Analysis**: View spending patterns and trends over time

### 📊 Dashboard
- **Financial Overview**: Quick summary of your financial position
- **Charts & Visualizations**: Interactive charts for assets distribution and expense breakdown
- **Quick Actions**: Add new banks, investments, debts, and expenses

### 🔄 Data Management
- **Excel Import/Export**: Import initial data from Excel spreadsheets
- **Real-time Updates**: Live data from financial APIs
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **In-memory storage** (MVP - replace with database in production)
- **Multer** for file uploads
- **XLSX** for Excel file processing
- **Moment.js** for date handling

### Frontend
- **React.js** with modern hooks
- **React Router** for navigation
- **Recharts** for data visualization
- **Framer Motion** for animations
- **React Hot Toast** for notifications

### External APIs
- **Yahoo Finance API** for stock prices
- **Exchange Rate API** for currency conversion
- **CoinGecko API** for cryptocurrency prices

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Build for production
npm run build

# Or run in development mode
npm start
```

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
```

## API Endpoints

### Financial Data
- `GET /api/finance/dashboard` - Dashboard overview
- `GET /api/finance/balance-sheet` - Balance sheet data
- `GET /api/finance/cash-flow` - Cash flow analysis

### Data Management
- `POST /api/finance/banks` - Add/update bank accounts
- `POST /api/finance/investments` - Add/update investments
- `POST /api/finance/debts` - Add/update debts
- `POST /api/finance/expenses` - Add/update expenses/income

### Delete Operations
- `DELETE /api/finance/banks/:id` - Delete bank account
- `DELETE /api/finance/investments/:id` - Delete investment
- `DELETE /api/finance/debts/:id` - Delete debt
- `DELETE /api/finance/expenses/:id` - Delete expense/income

### External APIs
- `GET /api/external/stock-price/:symbol` - Get stock price
- `GET /api/external/exchange-rates` - Get currency rates
- `GET /api/external/crypto-prices` - Get cryptocurrency prices

## Data Structure

### Bank Account
```json
{
  "id": "unique_id",
  "name": "Account Name",
  "balance": 10000.00,
  "accountNumber": "1234567890",
  "bankName": "Bank Name"
}
```

### Investment
```json
{
  "id": "unique_id",
  "symbol": "AAPL",
  "shares": 100,
  "purchasePrice": 150.00,
  "currentPrice": 175.00,
  "currentValue": 17500.00
}
```

### Debt
```json
{
  "id": "unique_id",
  "person": "John Doe",
  "amount": 500.00,
  "description": "Loan for car purchase",
  "dueDate": "2024-12-31"
}
```

### Expense/Income
```json
{
  "id": "unique_id",
  "category": "Salary",
  "amount": 5000.00,
  "description": "Monthly salary",
  "date": "2024-08-01",
  "type": "income"
}
```

## Excel Import Format

The application supports importing data from Excel files with the following structure:

### Banks Sheet
| name | balance | accountNumber | bankName |
|------|---------|---------------|----------|
| Main Account | 10000 | 1234567890 | Chase Bank |

### Investments Sheet
| symbol | shares | purchasePrice | currentPrice | currentValue |
|--------|--------|---------------|--------------|--------------|
| AAPL | 100 | 150.00 | 175.00 | 17500.00 |

### Expenses Sheet
| category | amount | description | date | type |
|----------|--------|-------------|------|------|
| Salary | 5000.00 | Monthly salary | 2024-08-01 | income |
| Rent | 1500.00 | Monthly rent | 2024-08-01 | expense |

## Usage

1. **Start the application** using `npm run dev`
2. **Access the web interface** at `http://localhost:5000`
3. **Add your financial data** using the quick action buttons
4. **Import existing data** from Excel files using the Settings page
5. **Monitor your finances** through the dashboard and detailed views
6. **Track cash flow** and project future financial positions

## Development

### Project Structure
```
├── server.js                 # Main server file
├── routes/                   # API route definitions
│   ├── finance.js           # Financial data endpoints
│   └── api.js               # External API endpoints
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service layer
│   │   └── index.js         # App entry point
│   └── package.json
└── package.json              # Backend dependencies
```

### Adding New Features
1. **Backend**: Add new routes in `routes/finance.js`
2. **Frontend**: Create new components in `client/src/components/`
3. **Services**: Update `client/src/services/financeService.js`
4. **Testing**: Test API endpoints and frontend functionality

## Production Considerations

### Security
- Replace in-memory storage with a proper database
- Implement user authentication and authorization
- Add input validation and sanitization
- Use environment variables for sensitive data

### Performance
- Implement caching for external API calls
- Add database indexing for large datasets
- Use CDN for static assets
- Implement pagination for large data sets

### Monitoring
- Add logging and error tracking
- Implement health checks
- Monitor API rate limits
- Set up alerts for system issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.