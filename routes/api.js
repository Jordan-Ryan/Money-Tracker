const express = require('express');
const router = express.Router();
const axios = require('axios');

// Yahoo Finance API base URL
const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance';

// Get live stock price
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
      
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      res.json({
        symbol: symbol.toUpperCase(),
        currentPrice,
        previousClose,
        change,
        changePercent,
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

// Get multiple stock prices
router.post('/stock-prices', async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }
    
    const stockData = [];
    
    // Fetch prices for multiple symbols (limited to avoid rate limiting)
    const limitedSymbols = symbols.slice(0, 10);
    
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
          
          stockData.push({
            symbol: symbol.toUpperCase(),
            currentPrice: meta.regularMarketPrice,
            previousClose: meta.previousClose,
            change: meta.regularMarketPrice - meta.previousClose,
            changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
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
    
    res.json({ stockData });
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

// Get market indices (S&P 500, NASDAQ, etc.)
router.get('/market-indices', async (req, res) => {
  try {
    const indices = ['^GSPC', '^IXIC', '^DJI']; // S&P 500, NASDAQ, Dow Jones
    
    const indicesData = [];
    
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
          
          indicesData.push({
            name: indexName,
            symbol: index,
            currentValue: meta.regularMarketPrice,
            change: meta.regularMarketPrice - meta.previousClose,
            changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error fetching index ${index}:`, error.message);
      }
    }
    
    res.json({ indicesData });
  } catch (error) {
    console.error('Error fetching market indices:', error.message);
    res.status(500).json({ error: 'Failed to fetch market indices' });
  }
});

module.exports = router;