const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

let mainWindow;
let serverApp;
let server;

const PORT = 3000;

function createServer() {
    serverApp = express();
    serverApp.use(cors());
    serverApp.use(express.static(__dirname));

    serverApp.get('/api/market-stats', async (req, res) => {
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

    serverApp.get('/api/all-indices', async (req, res) => {
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

    serverApp.get('/api/metals', async (req, res) => {
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

    serverApp.get('/api/fii-dii-react', async (req, res) => {
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

    serverApp.get('/api/fii-dii-nse', async (req, res) => {
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

    server = serverApp.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        icon: path.join(__dirname, 'icon.png'),
        backgroundColor: '#0f2027',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        },
        autoHideMenuBar: true,
        frame: true,
        title: 'NSE Market Dashboard'
    });

    mainWindow.loadFile('index.html');

    // Open DevTools in development
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createServer();
    setTimeout(createWindow, 1000); // Wait for server to start
});

app.on('window-all-closed', function () {
    if (server) {
        server.close();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('quit', () => {
    if (server) {
        server.close();
    }
});
