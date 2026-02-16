#!/usr/bin/env node
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const open = require('open');

const app = express();
const PORT = 3000;

app.use(cors());

// Cache for international metals (refresh every 60 seconds to avoid rate limiting)
let intlMetalsCache = { data: null, lastFetch: 0 };
const INTL_CACHE_DURATION = 60000; // 60 seconds

// Serve static files - read from pkg snapshot filesystem with no-cache headers
app.get('/', (req, res) => {
    const content = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.type('html').send(content);
});

app.get('/styles.css', (req, res) => {
    const content = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.type('css').send(content);
});

app.get('/script.js', (req, res) => {
    const content = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.type('js').send(content);
});

app.get('/api/market-stats', async (req, res) => {
    try {
        const response = await fetch('https://www.nseindia.com/api/NextApi/apiClient?functionName=getMarketStatistics', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.nseindia.com/'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/all-indices', async (req, res) => {
    try {
        const response = await fetch('https://www.nseindia.com/api/allIndices', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.nseindia.com/'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/metals', async (req, res) => {
    try {
        const response = await fetch('https://priceapi.moneycontrol.com/technicalCompanyData/commodity/getMajorCommodities?tabName=MCX&deviceType=W');
        const data = await response.json();
        
        const targetMetals = ['GOLD', 'SILVER', 'COPPER'];
        const metals = (data.data?.list || [])
            .filter(item => targetMetals.some(metal => item.symbol?.toUpperCase().includes(metal)))
            .map(item => ({
                name: item.symbol.toUpperCase(),
                rate: parseFloat(item.lastPrice),
                change: parseFloat(item.priceChangePercentage)
            }));
        
        res.json({ data: metals });
    } catch (error) {
        console.error('Error fetching metals data:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/intl-metals', async (req, res) => {
    try {
        const now = Date.now();
        
        // Return cached data if still fresh
        if (intlMetalsCache.data && (now - intlMetalsCache.lastFetch) < INTL_CACHE_DURATION) {
            return res.json({ data: intlMetalsCache.data });
        }
        
        // Fetch the commodities listing page - has ALL metals in one request
        const response = await fetch('https://tradingeconomics.com/commodities', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await response.text();
        const lines = html.split('\n');
        
        // Check if we got blocked (captcha page returns very few lines)
        if (lines.length < 100) {
            console.log('[INTL-METALS] Rate limited! Got only', lines.length, 'lines. Using cache.');
            if (intlMetalsCache.data) {
                return res.json({ data: intlMetalsCache.data });
            }
        }
        
        console.log('[INTL-METALS] Fetched', lines.length, 'lines');
        
        const metals = [];
        const targets = [
            { search: 'Gold', name: 'GOLD' },
            { search: 'Silver', name: 'SILVER' },
            { search: 'Copper', name: 'COPPER' },
            { search: 'Aluminum', name: 'ALUMINIUM' }
        ];
        
        for (const target of targets) {
            try {
                const idx = lines.findIndex(l => l.includes('<b>' + target.search + '</b>'));
                if (idx === -1) {
                    metals.push({ name: target.name, rate: 0, change: 0 });
                    continue;
                }
                
                // Price is in <td id="p"> a few lines after the name
                let rate = 0;
                for (let j = idx; j < idx + 12; j++) {
                    if (lines[j] && lines[j].includes('id="p"')) {
                        for (let k = j + 1; k < j + 3; k++) {
                            const val = lines[k].trim();
                            if (val.match(/^[0-9.]+$/)) {
                                rate = parseFloat(val);
                                break;
                            }
                        }
                        break;
                    }
                }
                
                // % change is in <td id="pch" ... data-value="X.XX">
                let change = 0;
                for (let j = idx; j < idx + 20; j++) {
                    if (lines[j] && lines[j].includes('id="pch"')) {
                        const dvMatch = lines[j].match(/data-value="([+-]?[0-9.]+)"/);
                        if (dvMatch) {
                            change = parseFloat(dvMatch[1]);
                        }
                        break;
                    }
                }
                
                metals.push({ name: target.name, rate: rate || 0, change: parseFloat((change || 0).toFixed(2)) });
            } catch (e) {
                metals.push({ name: target.name, rate: 0, change: 0 });
            }
        }
        
        // Cache the result
        if (metals.some(m => m.rate > 0)) {
            intlMetalsCache.data = metals;
            intlMetalsCache.lastFetch = now;
        }
        
        res.json({ data: metals });
    } catch (error) {
        console.error('Error fetching tradingeconomics data:', error);
        // Return cached data if available
        if (intlMetalsCache.data) {
            return res.json({ data: intlMetalsCache.data });
        }
        res.json({ data: [
            { name: 'GOLD', rate: 0, change: 0 },
            { name: 'SILVER', rate: 0, change: 0 },
            { name: 'COPPER', rate: 0, change: 0 },
            { name: 'ALUMINIUM', rate: 0, change: 0 }
        ]});
    }
});

app.get('/api/fii-dii-react', async (req, res) => {
    try {
        const response = await fetch('https://www.nseindia.com/api/fiidiiTradeReact', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.nseindia.com/'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/fii-dii-nse', async (req, res) => {
    try {
        const response = await fetch('https://www.nseindia.com/api/fiidiiTradeNse', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.nseindia.com/'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/volume-gainers', async (req, res) => {
    try {
        const response = await fetch('https://www.nseindia.com/api/live-analysis-volume-gainers?index=ALL', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.nseindia.com/market-data/volume-gainers-spurts'
            }
        });
        const data = await response.json();
        
        // Filter and calculate
        const filtered = (data.data || [])
            .filter(item => item.pChange > 0)
            .map(item => {
                const avgVolume = (item.week1AvgVolume + item.week2AvgVolume) / 2;
                const volumeDiff = item.volume - avgVolume;
                const percentageIncrease = (volumeDiff / avgVolume) * 100;
                return {
                    ...item,
                    volumeDiff,
                    percentageIncrease
                };
            })
            .sort((a, b) => b.percentageIncrease - a.percentageIncrease)
            .slice(0, 5);
        
        res.json({ data: filtered });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

const server = app.listen(PORT, () => {
    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║     NSE MARKET DASHBOARD - STARTING...       ║');
    console.log('╚═══════════════════════════════════════════════╝\n');
    console.log('✅ Server started successfully');
    console.log('🌐 Opening dashboard...\n');
    console.log('⚠️  DO NOT CLOSE THIS WINDOW!\n');
    console.log('Press Ctrl+C to exit the application\n');
    
    // Open browser automatically
    setTimeout(() => {
        open(`http://localhost:${PORT}`).catch(err => {
            console.log('\n⚠️  Please open your browser and go to: http://localhost:3000\n');
        });
    }, 1500);
});

process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...\n');
    server.close(() => {
        console.log('✅ Server stopped successfully\n');
        process.exit(0);
    });
});
