# Agent notes

Personal finance tracker on `main`: one Express process (`server.js`) and a Create React App in `client/`. Behavior below is taken from the files on `main`. `docs/STATE.md` records response shapes and places where the client reads fields the routes do not return.

## Commands

From the repository root:

```bash
npm install
npm run install:client
npm start          # node server.js, port 5000 or PORT
npm run dev        # nodemon server.js
npm run build:client
```

Client dev server: `cd client && npm start` (`react-scripts`, proxy `http://localhost:5000`).

`package.json` does not set `engines`. The server reads `PORT` only. There is no `.env` in the tree.

## Where code lives

- HTTP mounting, static files, and the GET fallback: `server.js`
- In-memory banks, investments, debts, expenses, Excel, and price refresh: `routes/finance.js`
- Yahoo Finance, exchangerate-api.com, and CoinGecko: `routes/api.js`
- Browser API wrapper: `client/src/services/financeService.js`
- Routes `/`, `/balance-sheet`, `/cash-flow`, `/settings`: `client/src/App.js`
- Forms: `client/src/components/modals/`

Records live in module-level arrays in `routes/finance.js`. Restarting the process clears them. There is no database client and no migration directory.

## When changing behavior

Update `README.md`, `demo.md`, and `docs/STATE.md` in the same change if a route, script, env var, or client field changes.

`client/src` has no test files. The client `test` script is `react-scripts test`.

`aces.json` is not imported by the app.

`origin/github-pages` is a separate branch. It contains `DEPLOYMENT-SUMMARY.md`, `README-GitHub-Pages.md`, `deploy.sh`, `.github/workflows/deploy.yml`, and `client/src/services/localStorageService.js`, which are absent on `main`. Use the files in this checkout when describing `main`.
