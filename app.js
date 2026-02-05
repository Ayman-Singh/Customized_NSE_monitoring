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

// Serve static files
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

app.get('/styles.css', (req, res) => {
    const cssPath = path.join(__dirname, 'styles.css');
    res.sendFile(cssPath);
});

app.get('/script.js', (req, res) => {
    const jsPath = path.join(__dirname, 'script.js');
    res.sendFile(jsPath);
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
