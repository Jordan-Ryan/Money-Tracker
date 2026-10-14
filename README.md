# Personal Finance Tracker

Express API and React client for recording bank accounts, investments, debts, and income or expense rows. The API keeps those records in memory for the life of the process (`routes/finance.js`).

`package.json` names the package `personal-finance-tracker` at version `1.0.0`. Its `license` field is `MIT`. There is no `LICENSE` file in the tree.

## Setup

`package.json` has no `engines` field. Install with npm:

```bash
npm install
npm run install:client
```

`npm run install:client` runs `npm install` in `client/`. Root and client lockfiles are `package-lock.json` and `client/package-lock.json`.

## Run

The API listens on `process.env.PORT` or `5000` (`server.js`).

Serve the files in `client/build` from Express:

```bash
npm start
```

`npm run dev` runs the same server with nodemon. Open `http://localhost:5000` (or the port you set). Express serves `client/build` and sends `client/build/index.html` for other GET paths.

Regenerate `client/build` with:

```bash
npm run build:client
```

That runs `npm run build` in `client/` (`react-scripts build`).

To run the Create React App dev server against the API, start the API, then in another shell:

```bash
cd client
npm start
```

`client/package.json` sets `"proxy": "http://localhost:5000"`. `react-scripts start` uses port `3000` unless that port is already taken.

## Scripts

Root `package.json`:

| Script | Command |
| --- | --- |
| `start` | `node server.js` |
| `dev` | `nodemon server.js` |
| `build` | `npm run build:client` |
| `build:client` | `cd client && npm run build` |
| `install:client` | `cd client && npm install` |
| `install:server` | `npm install` |

Client `package.json`:

| Script | Command |
| --- | --- |
| `start` | `react-scripts start` |
| `build` | `react-scripts build` |
| `test` | `react-scripts test` |
| `eject` | `react-scripts eject` |

There are no test files under `client/src`.

## Environment

`server.js` loads `dotenv`. The only variable the server reads is `PORT`. There is no `.env` file in the repository. `NODE_ENV` is not read by `server.js`.

## Pages

`client/src/App.js` registers these routes:

| Path | Component |
| --- | --- |
| `/` | `Dashboard` |
| `/balance-sheet` | `BalanceSheet` |
| `/cash-flow` | `CashFlow` |
| `/settings` | `Settings` |

`App` loads `GET /api/finance/dashboard` once on mount and passes that payload to the pages. Balance Sheet and Cash Flow also call their own GET routes.

## HTTP API

Mounted in `server.js`:

- `/api/finance` → `routes/finance.js`
- `/api/external` → `routes/api.js`

JSON bodies are limited to 10mb. `cors()`, `helmet()`, and `compression()` are enabled with their default options. There is no authentication middleware.

The in-memory store starts empty:

```js
{ banks: [], investments: [], debts: [], expenses: [] }
```

Creating a record omits `id`. The handler sets `id` to `Date.now().toString()`. Sending an `id` that already exists replaces that record. Sending an `id` that is not in the array leaves the array unchanged and still returns HTTP 200 with `success: true`.

### Finance

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/api/finance/dashboard` | Sums bank `balance` and investment `currentValue` as assets, sums debt `amount` as liabilities, and sums expense rows whose `date` is in the current `YYYY-MM` into `monthlyIncome` and `monthlyExpenses`. |
| `GET` | `/api/finance/balance-sheet` | Returns `{ assets: { banks, investments, total }, liabilities: { debts, total }, netWorth }`. |
| `GET` | `/api/finance/cash-flow` | Returns `{ currentMonth, income, expenses, netCashFlow, transactions }`. `currentMonth` is a `YYYY-MM` string from `moment()`. `transactions` are expense rows in that month. |
| `POST` | `/api/finance/banks` | Body fields read: `id`, `name`, `balance`, `accountNumber`, `bankName`. |
| `POST` | `/api/finance/investments` | Body fields read: `id`, `symbol`, `shares`, `purchasePrice`, `currentPrice`, `currentValue`. |
| `POST` | `/api/finance/debts` | Body fields read: `id`, `person`, `amount`, `description`, `dueDate`. |
| `POST` | `/api/finance/expenses` | Body fields read: `id`, `category`, `amount`, `description`, `date`, `type`. |
| `DELETE` | `/api/finance/banks/:id` | Removes the bank or returns 404 `{ message: 'Bank account not found' }`. |
| `DELETE` | `/api/finance/investments/:id` | Removes the investment or returns 404. |
| `DELETE` | `/api/finance/debts/:id` | Removes the debt or returns 404. |
| `DELETE` | `/api/finance/expenses/:id` | Removes the expense or returns 404. |
| `POST` | `/api/finance/import-excel` | Multipart field name `file`. See Excel below. |
| `GET` | `/api/finance/export-excel` | Downloads `finance-data.xlsx`. |
| `POST` | `/api/finance/update-investment-prices` | For each investment with a `symbol`, reads Yahoo Finance `regularMarketPrice`, converts USD to GBP, and sets `currentPrice`, `currentPriceUSD`, `lastUpdated`, and `usdToGbp`. |

Create and update responses look like `{ success: true, banks }` (or `investments`, `debts`, `expenses`). Delete responses look like `{ message: 'Bank account deleted successfully' }`.

`POST /api/finance/update-investment-prices` does not write `currentValue`. Dashboard totals, the balance sheet, and the investment lists use `currentValue`.

USD to GBP uses `https://api.exchangerate-api.com/v4/latest/USD`. If that request fails, the rate used is `0.79`.

### External

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/api/external/stock-price/:symbol` | Yahoo Finance chart, `interval=1d`, `range=1d`. Prices in the JSON `currentPrice` field are GBP. |
| `POST` | `/api/external/stock-prices` | Body `{ "symbols": ["AAPL"] }`. Uses the first 10 symbols. |
| `GET` | `/api/external/exchange-rates` | `https://api.exchangerate-api.com/v4/latest/USD`. |
| `GET` | `/api/external/crypto-prices` | CoinGecko `simple/price`. Query `ids` defaults to `bitcoin,ethereum,cardano`. `vs_currencies` is `usd`. |
| `GET` | `/api/external/market-indices` | Yahoo symbols `^GSPC`, `^IXIC`, `^DJI`, converted to GBP the same way as stock prices. |

`client/src/services/financeService.js` exports `fetchStockPrice`, `fetchMultipleStockPrices`, `fetchExchangeRates`, `fetchCryptoPrices`, and `fetchMarketIndices`. No component imports those functions. The Dashboard and Balance Sheet call `updateInvestmentPrices`. Settings does not.

## Client forms

The modals require these fields before submit. The API handlers store the body fields listed in the tables above.

- Bank: `name`, `balance`, `bankName`. `accountNumber` is optional in the form. `balance` is sent as a number.
- Investment: `symbol`, `shares`, `purchasePrice`. If `currentPrice` is empty, the modal sends `purchasePrice`. If `currentValue` is empty, the modal sends `shares * currentPrice`.
- Debt: `person`, `amount`.
- Expense: `category`, `amount`. `type` is `expense` or `income`. `date` defaults to today (`YYYY-MM-DD`). Categories in the select are Salary, Rent, Utilities, Groceries, Transportation, Entertainment, Healthcare, Insurance, Gym, Phone, TV/Internet, Shopping, Dining, Travel, Other.

Amounts on Dashboard, Balance Sheet, and Cash Flow use `formatGBP` (`en-GB`, currency `GBP`). The sidebar net-worth figure is a `$` prefix plus `toLocaleString()`.

## Excel

Import (`routes/finance.js`):

- Multer stores the upload in `uploads/` (`dest: 'uploads/'`). That directory is not in the repository.
- Sheet names are used as keys. The handler replaces `financeData.banks` only when a sheet is named `banks`, and `financeData.investments` only when a sheet is named `investments`.
- Bank columns accepted: `name` or `Name`, `balance` or `Balance`, `accountNumber` or `Account Number`, `bankName` or `Bank Name`.
- Investment columns accepted: `symbol` or `Symbol`, `shares` or `Shares`, `purchasePrice` or `Purchase Price`, `currentPrice` or `Current Price`, `currentValue` or `Current Value`.
- Other sheets are included in the JSON response field `importedData` and are not copied into `financeData`.

Export writes one sheet per non-empty array, named `Banks`, `Investments`, `Debts`, and `Expenses`, using the object fields currently stored.

The Settings control labeled "Download Excel template" saves `finance_template.json` (a JSON blob). The "Refresh Live Data" button waits two seconds, then reloads the dashboard. It does not call `/api/finance/update-investment-prices` or `/api/external/*`.

## Layout

```
server.js
routes/api.js
routes/finance.js
client/package.json
client/public/index.html
client/src/App.js
client/src/index.js
client/src/index.css
client/src/services/financeService.js
client/src/components/Dashboard.js
client/src/components/BalanceSheet.js
client/src/components/CashFlow.js
client/src/components/Settings.js
client/src/components/modals/
aces.json
demo.md
```

`client/src/index.css` defines the utility classes listed in that file (grid, flex, spacing, colors, `.card`, `.btn`, `.spinner`). `client/package.json` does not depend on Tailwind. Components also use class names that are not defined in `index.css`.

`client/public/index.html` links `favicon.ico`, `logo192.png`, and `manifest.json`. Those files are not in `client/public/`.

`aces.json` is not read by the server or the client. See `docs/STATE.md`.

`demo.md` is a curl walkthrough of the routes above.
