# State of `main`

Facts from the tree on `main`. This file does not score readiness or launch status.

## Source that the app runs

- `server.js` — Express. Static directory `client/build`. `GET *` sends `client/build/index.html`. Error middleware logs `err.stack` and returns `{ error: 'Something went wrong!' }`.
- `routes/finance.js` — in-memory `{ banks, investments, debts, expenses }`, all starting as empty arrays.
- `routes/api.js` — outbound HTTP for quotes, FX, crypto, and three index symbols.
- `client/` — React 18, `react-scripts` 5.0.1, `react-router-dom`, `axios`, `recharts`, `moment`, `react-icons`, `react-hot-toast`, `framer-motion`.

`package.json` dependencies: `express`, `cors`, `dotenv`, `axios`, `multer`, `xlsx`, `moment`, `helmet`, `compression`. Dev dependency: `nodemon`.

`node_modules`, `client/node_modules`, and `client/build` are tracked. There is no `.gitignore` on `main`.

## Scripts and config

Root scripts: `start`, `dev`, `build`, `build:client`, `install:client`, `install:server`. See `README.md`.

`server.js` uses `process.env.PORT || 5000`. No other `process.env` read in application source. No `.env` file is committed.

`client/package.json` `proxy` is `http://localhost:5000`.

`aces.json`:

```json
{
  "status": "Idea",
  "progress": 0,
  "previewUrl": "https://github.com/Jordan-Ryan/Money-Tracker"
}
```

No application file imports `aces.json`.

`package.json` `license` is `MIT`. No `LICENSE` file is in the tree. `author` is the string `Your Name`.

## What the UI calls

| UI | Calls |
| --- | --- |
| `App.js` | `getDashboard` on mount |
| `Dashboard.js` | props from that dashboard payload; `exportExcel`, `importExcel`, `updateInvestmentPrices`; modals for bank, investment, debt, expense |
| `BalanceSheet.js` | `getBalanceSheet`, delete bank/investment/debt, `updateInvestmentPrices`, edit modals |
| `CashFlow.js` | `getCashFlow`, `deleteExpense`, add/update expense modal |
| `Settings.js` | `exportExcel`, `importExcel` |

Dashboard charts that render: two `PieChart`s (bank balances vs investment `currentValue`, and one slice per expense row). Cash Flow renders a `BarChart` of expense-type rows and a `LineChart` of a 12-step projection computed in the component.

`fetchStockPrice`, `fetchMultipleStockPrices`, `fetchExchangeRates`, `fetchCryptoPrices`, and `fetchMarketIndices` are exported from `financeService.js` and are not imported by a component.

## Response shapes the client reads

`GET /api/finance/dashboard` returns `totalAssets`, `totalLiabilities`, `netWorth`, `monthlyExpenses`, `monthlyIncome`, `banks`, `investments`, `debts`, `expenses`. Dashboard uses those names.

`GET /api/finance/balance-sheet` returns `assets.banks`, `assets.investments`, `assets.total`, `liabilities.debts`, `liabilities.total`, `netWorth`. Balance Sheet uses those names.

`GET /api/finance/cash-flow` returns `currentMonth` as a `YYYY-MM` string, plus numeric `income`, `expenses`, `netCashFlow`, and `transactions`.

`CashFlow.js` reads `cashFlowData.currentMonth.income`, `cashFlowData.currentMonth.expenses`, `cashFlowData.currentMonth.netCashFlow`, `cashFlowData.currentMonth.endingBalance`, and `cashFlowData.monthlyExpenses`.

The finance axios interceptor returns the response body. `updateInvestmentPrices` then returns `response.data` on that body. `POST /api/finance/update-investment-prices` puts `message` on the top-level JSON object, so the value returned to the caller is `undefined`. `BalanceSheet.js` reads `result.message` from that return value. `Dashboard.js` ignores the return value and toasts a fixed string.

`POST /api/finance/update-investment-prices` writes `currentPrice`, `currentPriceUSD`, `lastUpdated`, and `usdToGbp`. List and total code paths use `currentValue`.

The sidebar in `App.js` prints net worth with a `$` prefix and `toLocaleString()`. Dashboard, Balance Sheet, and Cash Flow use `formatGBP`.

Settings "Refresh Live Data" (`handleRefreshData`) waits 2000ms and calls `onDataUpdate`. Settings "Download Excel template" writes a JSON file named `finance_template.json`.

The expense pie on the dashboard maps every item in `data.expenses` to `{ name: category, value: amount }`.

## Excel import and export

Documented in `README.md`. Short version: import applies sheets named `banks` and `investments` only; export sheet names are `Banks`, `Investments`, `Debts`, `Expenses`. Multer `dest` is `uploads/`, which is not in the repository.

## Files the client HTML references

`client/public/` contains `index.html` only. That HTML file references `%PUBLIC_URL%/favicon.ico`, `%PUBLIC_URL%/logo192.png`, and `%PUBLIC_URL%/manifest.json`.

## Styles

`client/src/index.css` is the only stylesheet imported by `client/src/index.js`. It defines a fixed set of utility classes. Components also use class names that do not appear in that file, including `min-h-screen`, `lg:hidden`, `lg:ml-64`, `fixed`, `space-y-6`, `md:grid-cols-2`, and `lg:grid-cols-4`. `client/package.json` has no `tailwindcss` dependency and there is no Tailwind config in the repo.

## Not on `main`

`origin/github-pages` contains `DEPLOYMENT-SUMMARY.md`, `README-GitHub-Pages.md`, `deploy.sh`, `.github/workflows/deploy.yml`, and `client/src/services/localStorageService.js`. Those paths are absent on `main`. Before this docs refresh, `README.md` and `demo.md` had the same contents on both branches. This file describes `main` after the refresh.
