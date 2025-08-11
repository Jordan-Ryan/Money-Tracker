# Personal Finance Tracker - GitHub Pages Version

This is a static version of the Personal Finance Tracker application that can be deployed on GitHub Pages. All data is stored locally in the browser using localStorage.

## Features

- **Dashboard Overview**: View your total assets, liabilities, net worth, and monthly cash flow
- **Balance Sheet**: Track bank accounts, investments, and debts
- **Cash Flow**: Monitor income and expenses with detailed categorization
- **Data Management**: Add, edit, and delete financial records
- **Import/Export**: CSV import/export functionality
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: All data is stored in your browser (no server required)

## GitHub Pages Deployment

### Prerequisites

1. A GitHub account
2. This repository cloned to your local machine

### Deployment Steps

1. **Update the homepage URL** in `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/your-repo-name"
   ```
   Replace `yourusername` and `your-repo-name` with your actual GitHub username and repository name.

2. **Install dependencies**:
   ```bash
   npm install
   cd client && npm install
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

4. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

5. **Configure GitHub Pages**:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "GitHub Pages" section
   - Select "gh-pages" branch as source
   - Save the changes

### Alternative Manual Deployment

If you prefer manual deployment:

1. Build the application: `npm run build`
2. Copy the contents of `client/build/` to your GitHub Pages branch
3. Commit and push the changes

## Local Development

To run the application locally for development:

```bash
npm start
```

This will start the React development server at `http://localhost:3000`.

## Data Storage

- All financial data is stored in your browser's localStorage
- Data persists between browser sessions
- No data is sent to external servers
- You can export your data as CSV for backup

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Limitations

Since this is a static GitHub Pages application:

- No real-time stock prices (mock data is used)
- No server-side data persistence
- No user authentication
- No data sharing between devices

## Customization

You can customize the application by:

- Modifying the color scheme in `client/src/index.css`
- Adding new financial categories
- Customizing the dashboard layout
- Adding new data visualization charts

## Support

For issues or questions:

1. Check the browser console for error messages
2. Ensure your browser supports localStorage
3. Try clearing browser cache and localStorage
4. Check GitHub Pages deployment status

## License

MIT License - see LICENSE file for details.