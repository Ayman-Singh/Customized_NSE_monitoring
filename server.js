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

app.get('/api/intl-metals', async (req, res) => {
    try {
        // Fetch the commodities listing page - has ALL metals in one request
        const response = await fetch('https://tradingeconomics.com/commodities', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await response.text();
        const lines = html.split('\n');
        
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
                if (idx === -1) continue;
                
                // Price is in <td id="p"> a few lines after the name (line idx+7 has the number)
                let rate = 0;
                for (let j = idx; j < idx + 12; j++) {
                    if (lines[j] && lines[j].includes('id="p"')) {
                        // Price value is on the next non-empty line
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
                
                if (rate > 0) {
                    metals.push({ name: target.name, rate: rate, change: parseFloat(change.toFixed(2)) });
                }
            } catch (e) {
                console.log(target.name + ' extraction failed:', e.message);
            }
        }
        
        res.json({ data: metals.length > 0 ? metals : [
            { name: 'GOLD', rate: 0, change: 0 },
            { name: 'SILVER', rate: 0, change: 0 },
            { name: 'COPPER', rate: 0, change: 0 },
            { name: 'ALUMINIUM', rate: 0, change: 0 }
        ]});
    } catch (error) {
        console.error('Error fetching tradingeconomics data:', error);
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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
