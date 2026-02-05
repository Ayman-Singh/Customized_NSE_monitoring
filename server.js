const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('.'));

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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
