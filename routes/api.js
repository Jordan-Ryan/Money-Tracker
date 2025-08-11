const express = require('express');
const router = express.Router();
const axios = require('axios');

// Yahoo Finance API base URL
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance';

// Get live stock price with GBP conversion
router.get('/stock-price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Using Yahoo Finance API
    const response = await axios.get(`${YAHOO_FINANCE_BASE}/chart/${symbol}`, {
      params: {
        interval: '1d',
        range: '1d'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.data && response.data.chart && response.data.chart.result) {
      const result = response.data.chart.result[0];
      const quote = result.indicators.quote[0];
      const meta = result.meta;
      
      const currentPriceUSD = meta.regularMarketPrice;
      const previousCloseUSD = meta.previousClose;
      const changeUSD = currentPriceUSD - previousCloseUSD;
      const changePercent = (changeUSD / previousCloseUSD) * 100;
      
      // Get USD to GBP exchange rate
      let usdToGbp = 0.79; // Default fallback rate
      try {
        const exchangeResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        usdToGbp = exchangeResponse.data.rates.GBP || 0.79;
      } catch (exchangeError) {
        console.warn('Using fallback exchange rate:', usdToGbp);
      }
      
      // Convert to GBP
      const currentPriceGBP = currentPriceUSD * usdToGbp;
      const previousCloseGBP = previousCloseUSD * usdToGbp;
      const changeGBP = changeUSD * usdToGbp;
      
      res.json({
        symbol: symbol.toUpperCase(),
        currentPrice: currentPriceGBP,
        currentPriceUSD,
        previousClose: previousCloseGBP,
        previousCloseUSD,
        change: changeGBP,
        changeUSD,
        changePercent,
        usdToGbp,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({ error: 'Stock data not found' });
    }
  } catch (error) {
    console.error('Error fetching stock price:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock price' });
  }
});

// Get multiple stock prices with GBP conversion
router.post('/stock-prices', async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }
    
    const stockData = [];
    
    // Fetch prices for multiple symbols (limited to avoid rate limiting)
    const limitedSymbols = symbols.slice(0, 10);
    
    // Get USD to GBP exchange rate once for all symbols
    let usdToGbp = 0.79; // Default fallback rate
    try {
      const exchangeResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      usdToGbp = exchangeResponse.data.rates.GBP || 0.79;
    } catch (exchangeError) {
      console.warn('Using fallback exchange rate:', usdToGbp);
    }
    
    for (const symbol of limitedSymbols) {
      try {
        const response = await axios.get(`${YAHOO_FINANCE_BASE}/chart/${symbol}`, {
          params: {
            interval: '1d',
            range: '1d'
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.data && response.data.chart && response.data.chart.result) {
          const result = response.data.chart.result[0];
          const meta = result.meta;
          
          const currentPriceUSD = meta.regularMarketPrice;
          const previousCloseUSD = meta.previousClose;
          const changeUSD = currentPriceUSD - previousCloseUSD;
          const changePercent = ((currentPriceUSD - previousCloseUSD) / previousCloseUSD) * 100;
          
          // Convert to GBP
          const currentPriceGBP = currentPriceUSD * usdToGbp;
          const previousCloseGBP = previousCloseUSD * usdToGbp;
          const changeGBP = changeUSD * usdToGbp;
          
          stockData.push({
            symbol: symbol.toUpperCase(),
            currentPrice: currentPriceGBP,
            currentPriceUSD,
            previousClose: previousCloseGBP,
            previousCloseUSD,
            change: changeGBP,
            changeUSD,
            changePercent,
            usdToGbp,
            timestamp: new Date().toISOString()
          });
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error.message);
        stockData.push({
          symbol: symbol.toUpperCase(),
          error: 'Failed to fetch price'
        });
      }
    }
    
    res.json({ stockData, usdToGbp });
  } catch (error) {
    console.error('Error fetching stock prices:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock prices' });
  }
});

// Get currency exchange rates (using a free API)
router.get('/exchange-rates', async (req, res) => {
  try {
    // Using exchangerate-api.com (free tier)
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    
    res.json({
      base: response.data.base,
      rates: response.data.rates,
      timestamp: response.data.date
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

// Get crypto prices (using CoinGecko free API)
router.get('/crypto-prices', async (req, res) => {
  try {
    const { ids } = req.query;
    const coinIds = ids || 'bitcoin,ethereum,cardano';
    
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: coinIds,
        vs_currencies: 'usd',
        include_24hr_change: true
      }
    });
    
    res.json({
      cryptoData: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching crypto prices:', error.message);
    res.status(500).json({ error: 'Failed to fetch crypto prices' });
  }
});

// Get market indices (S&P 500, NASDAQ, etc.) with GBP conversion
router.get('/market-indices', async (req, res) => {
  try {
    const indices = ['^GSPC', '^IXIC', '^DJI']; // S&P 500, NASDAQ, Dow Jones
    
    const indicesData = [];
    
    // Get USD to GBP exchange rate once for all indices
    let usdToGbp = 0.79; // Default fallback rate
    try {
      const exchangeResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      usdToGbp = exchangeResponse.data.rates.GBP || 0.79;
    } catch (exchangeError) {
      console.warn('Using fallback exchange rate:', usdToGbp);
    }
    
    for (const index of indices) {
      try {
        const response = await axios.get(`${YAHOO_FINANCE_BASE}/chart/${index}`, {
          params: {
            interval: '1d',
            range: '1d'
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.data && response.data.chart && response.data.chart.result) {
          const result = response.data.chart.result[0];
          const meta = result.meta;
          
          const indexName = {
            '^GSPC': 'S&P 500',
            '^IXIC': 'NASDAQ',
            '^DJI': 'Dow Jones'
          }[index] || index;
          
          const currentValueUSD = meta.regularMarketPrice;
          const previousCloseUSD = meta.previousClose;
          const changeUSD = currentValueUSD - previousCloseUSD;
          const changePercent = ((currentValueUSD - previousCloseUSD) / previousCloseUSD) * 100;
          
          // Convert to GBP
          const currentValueGBP = currentValueUSD * usdToGbp;
          const changeGBP = changeUSD * usdToGbp;
          
          indicesData.push({
            name: indexName,
            symbol: index,
            currentValue: currentValueGBP,
            currentValueUSD,
            change: changeGBP,
            changeUSD,
            changePercent,
            usdToGbp
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error fetching index ${index}:`, error.message);
      }
    }
    
    res.json({ indicesData, usdToGbp });
  } catch (error) {
    console.error('Error fetching market indices:', error.message);
    res.status(500).json({ error: 'Failed to fetch market indices' });
  }
});

module.exports = router;