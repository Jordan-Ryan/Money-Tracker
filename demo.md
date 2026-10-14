# API walkthrough

The store in `routes/finance.js` starts empty each time the API process starts. Records added with the commands below stay in memory until that process exits.

## Start the API

```bash
npm install
npm run install:client
npm start
```

Default base URL: `http://localhost:5000`. Set `PORT` to change it. `npm run dev` is the same server under nodemon.

`npm start` serves `client/build` when that directory is present. The Create React App dev server is separate: `cd client && npm start` (port 3000, proxy to port 5000).

## Add records

Bank:

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

Investment. `currentValue` is what the dashboard and balance sheet add into assets:

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

Income and expense. Monthly totals on `GET /api/finance/dashboard` and `GET /api/finance/cash-flow` include rows whose `date` falls in the current month:

```bash
curl -X POST http://localhost:5000/api/finance/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Salary",
    "amount": 5000,
    "description": "Monthly salary",
    "date": "2026-10-01",
    "type": "income"
  }'

curl -X POST http://localhost:5000/api/finance/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Rent",
    "amount": 1500,
    "description": "Monthly rent",
    "date": "2026-10-01",
    "type": "expense"
  }'
```

Debt:

```bash
curl -X POST http://localhost:5000/api/finance/debts \
  -H "Content-Type: application/json" \
  -d '{
    "person": "Jane Doe",
    "amount": 500,
    "description": "Loan",
    "dueDate": "2026-12-31"
  }'
```

Replace `2026-10-01` with a date in the current month if that month is no longer October 2026. The handlers do not validate the body.

## Read records

```bash
curl -s http://localhost:5000/api/finance/dashboard
curl -s http://localhost:5000/api/finance/balance-sheet
curl -s http://localhost:5000/api/finance/cash-flow
```

`GET /api/finance/cash-flow` returns:

```json
{
  "currentMonth": "YYYY-MM",
  "income": 0,
  "expenses": 0,
  "netCashFlow": 0,
  "transactions": []
}
```

`currentMonth` is a string. `income`, `expenses`, and `netCashFlow` are numbers for that month. `transactions` is the matching expense array.

An empty dashboard looks like this:

```json
{
  "totalAssets": 0,
  "totalLiabilities": 0,
  "netWorth": 0,
  "monthlyExpenses": 0,
  "monthlyIncome": 0,
  "banks": [],
  "investments": [],
  "debts": [],
  "expenses": []
}
```

## Update and delete

Send the existing `id` on `POST` to replace a record:

```bash
curl -X POST http://localhost:5000/api/finance/banks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "PASTE_ID",
    "name": "Main Account",
    "balance": 9000,
    "accountNumber": "1234567890",
    "bankName": "Chase Bank"
  }'
```

```bash
curl -X DELETE http://localhost:5000/api/finance/banks/PASTE_ID
curl -X DELETE http://localhost:5000/api/finance/investments/PASTE_ID
curl -X DELETE http://localhost:5000/api/finance/debts/PASTE_ID
curl -X DELETE http://localhost:5000/api/finance/expenses/PASTE_ID
```

## Prices and other external routes

```bash
curl -X POST http://localhost:5000/api/finance/update-investment-prices
curl -s http://localhost:5000/api/external/stock-price/AAPL
curl -s http://localhost:5000/api/external/exchange-rates
curl -s "http://localhost:5000/api/external/crypto-prices?ids=bitcoin,ethereum"
curl -s http://localhost:5000/api/external/market-indices
curl -s -X POST http://localhost:5000/api/external/stock-prices \
  -H "Content-Type: application/json" \
  -d '{"symbols":["AAPL","MSFT"]}'
```

`POST /api/finance/update-investment-prices` sets `currentPrice` (GBP), `currentPriceUSD`, `lastUpdated`, and `usdToGbp` on each investment that has a symbol. It leaves `currentValue` as stored.

These routes call Yahoo Finance, `api.exchangerate-api.com`, or CoinGecko. They need outbound network access.

## Excel

Export:

```bash
curl -s -D - -o finance-data.xlsx http://localhost:5000/api/finance/export-excel
```

Sheets are written only for non-empty arrays. Names are `Banks`, `Investments`, `Debts`, and `Expenses`.

Import (multipart field `file`). The handler copies sheets named `banks` and `investments` into memory:

```bash
curl -X POST http://localhost:5000/api/finance/import-excel \
  -F "file=@/path/to/workbook.xlsx"
```

Multer is configured with `dest: 'uploads/'`. That directory is not in the repository.
