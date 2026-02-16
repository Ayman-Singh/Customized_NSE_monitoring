// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const timestampEl = document.getElementById('timestamp');
    if (timestampEl) {
        timestampEl.textContent = now.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'medium'
        });
    }
}

// Track if currently fetching to prevent overlaps
let isFetching = false;

async function fetchMarketStats() {
    const statsEl = document.getElementById('stats');
    try {
        const response = await fetch('http://localhost:3000/api/market-stats');
        if (!response.ok) return;
        const data = await response.json();
        const cm = data.data?.snapshotCapitalMarket || {};

        if (!statsEl.hasChildNodes()) {
            statsEl.innerHTML = `
                <div class="stat-card">
                    <div class="stat-label">Stock Traded</div>
                    <div class="stat-value" id="stat-total">${cm.total || 'N/A'}</div>
                </div>
                <div class="stat-card advances">
                    <div class="stat-label">Advances</div>
                    <div class="stat-value" id="stat-advances">${cm.advances || 'N/A'}</div>
                </div>
                <div class="stat-card declines">
                    <div class="stat-label">Declines</div>
                    <div class="stat-value" id="stat-declines">${cm.declines || 'N/A'}</div>
                </div>
                <div class="stat-card unchanged">
                    <div class="stat-label">Unchanged</div>
                    <div class="stat-value" id="stat-unchanged">${cm.unchange || 'N/A'}</div>
                </div>
            `;
        } else {
            const totalEl = document.getElementById('stat-total');
            const advancesEl = document.getElementById('stat-advances');
            const declinesEl = document.getElementById('stat-declines');
            const unchangedEl = document.getElementById('stat-unchanged');
            if (totalEl) totalEl.textContent = cm.total || 'N/A';
            if (advancesEl) advancesEl.textContent = cm.advances || 'N/A';
            if (declinesEl) declinesEl.textContent = cm.declines || 'N/A';
            if (unchangedEl) unchangedEl.textContent = cm.unchange || 'N/A';
        }
    } catch (error) {}
}

async function fetchIndices() {
    const tableBody = document.getElementById('indices-body');
    try {
        const response = await fetch('http://localhost:3000/api/all-indices');
        if (!response.ok) return;
        const data = await response.json();
        const allIndices = data.data || [];
        const sectorNames = ['NIFTY AUTO', 'NIFTY FMCG', 'NIFTY IT', 'NIFTY MEDIA', 'NIFTY METAL', 'NIFTY PHARMA', 'NIFTY PSU BANK', 'NIFTY PRIVATE BANK', 'NIFTY REALTY', 'NIFTY HEALTHCARE INDEX', 'NIFTY MIDSMALL IT & TELECOM', 'NIFTY OIL & GAS', 'NIFTY CHEMICALS', 'NIFTY ENERGY', 'NIFTY INDIA DIGITAL', 'NIFTY INDIA DEFENCE', 'NIFTY CAPITAL MARKETS'];
        const indices = allIndices.filter(index => sectorNames.includes(index.index));

        if (tableBody.children.length === 0) {
            indices.forEach(index => {
                const row = document.createElement('tr');
                const pChange = parseFloat(index.percentChange) || 0;
                row.innerHTML = `
                    <td class="index-name">${index.index || 'N/A'}</td>
                    <td class="number">${parseFloat(index.last || 0).toFixed(2)}</td>
                    <td class="number ${pChange >= 0 ? 'positive' : 'negative'}">${pChange >= 0 ? '+' : ''}${pChange.toFixed(2)}%</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            const rows = tableBody.querySelectorAll('tr');
            indices.forEach((index, i) => {
                if (rows[i]) {
                    const pChange = parseFloat(index.percentChange) || 0;
                    const cells = rows[i].cells;
                    cells[1].textContent = parseFloat(index.last || 0).toFixed(2);
                    cells[2].textContent = `${pChange >= 0 ? '+' : ''}${pChange.toFixed(2)}%`;
                    cells[2].className = `number ${pChange >= 0 ? 'positive' : 'negative'}`;
                }
            });
        }
    } catch (error) {}
}

async function fetchMainIndices() {
    const tableBody = document.getElementById('main-indices-body');
    try {
        const response = await fetch('http://localhost:3000/api/all-indices');
        if (!response.ok) return;
        const data = await response.json();
        const allIndices = data.data || [];
        const mainIndexNames = ['NIFTY 50', 'NIFTY BANK', 'NIFTY FINANCIAL SERVICES', 'NIFTY MIDCAP 100', 'NIFTY SMLCAP 400', 'NIFTY LARGEMIDCAP 250'];
        const indices = allIndices.filter(index => mainIndexNames.includes(index.index));

        if (tableBody.children.length === 0) {
            indices.forEach(index => {
                const row = document.createElement('tr');
                const pChange = parseFloat(index.percentChange) || 0;
                row.innerHTML = `
                    <td class="index-name">${index.index || 'N/A'}</td>
                    <td class="number">${parseFloat(index.last || 0).toFixed(2)}</td>
                    <td class="number ${pChange >= 0 ? 'positive' : 'negative'}">${pChange >= 0 ? '+' : ''}${pChange.toFixed(2)}%</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            const rows = tableBody.querySelectorAll('tr');
            indices.forEach((index, i) => {
                if (rows[i]) {
                    const pChange = parseFloat(index.percentChange) || 0;
                    const cells = rows[i].cells;
                    cells[1].textContent = parseFloat(index.last || 0).toFixed(2);
                    cells[2].textContent = `${pChange >= 0 ? '+' : ''}${pChange.toFixed(2)}%`;
                    cells[2].className = `number ${pChange >= 0 ? 'positive' : 'negative'}`;
                }
            });
        }
    } catch (error) {}
}

async function fetchMetals() {
    const tableBody = document.getElementById('metals-body');
    try {
        const response = await fetch('http://localhost:3000/api/metals');
        if (!response.ok) return;
        const data = await response.json();
        const metals = data.data || [];

        if (tableBody.children.length === 0) {
            metals.forEach(metal => {
                const row = document.createElement('tr');
                const change = parseFloat(metal.change) || 0;
                row.innerHTML = `
                    <td class="index-name">${metal.name || 'N/A'}</td>
                    <td class="number">${parseFloat(metal.rate || 0).toFixed(2)}</td>
                    <td class="number ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            const rows = tableBody.querySelectorAll('tr');
            metals.forEach((metal, i) => {
                if (rows[i]) {
                    const change = parseFloat(metal.change) || 0;
                    const cells = rows[i].cells;
                    cells[1].textContent = parseFloat(metal.rate || 0).toFixed(2);
                    cells[2].textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                    cells[2].className = `number ${change >= 0 ? 'positive' : 'negative'}`;
                }
            });
        }
    } catch (error) {}
}

async function fetchIntlMetals() {
    const tableBody = document.getElementById('intl-metals-body');
    try {
        const response = await fetch('http://localhost:3000/api/intl-metals');
        if (!response.ok) return;
        const data = await response.json();
        const metals = data.data || [];

        if (tableBody.children.length === 0) {
            metals.forEach(metal => {
                const row = document.createElement('tr');
                const change = parseFloat(metal.change) || 0;
                row.innerHTML = `
                    <td class="index-name">${metal.name || 'N/A'}</td>
                    <td class="number">${parseFloat(metal.rate || 0).toFixed(2)}</td>
                    <td class="number ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            const rows = tableBody.querySelectorAll('tr');
            metals.forEach((metal, i) => {
                if (rows[i]) {
                    const change = parseFloat(metal.change) || 0;
                    const cells = rows[i].cells;
                    cells[1].textContent = parseFloat(metal.rate || 0).toFixed(2);
                    cells[2].textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                    cells[2].className = `number ${change >= 0 ? 'positive' : 'negative'}`;
                }
            });
        }
    } catch (error) {}
}

async function fetchFiiDiiReact() {
    const tableBody = document.getElementById('fii-dii-react-body');
    try {
        const response = await fetch('http://localhost:3000/api/fii-dii-react');
        if (!response.ok) return;
        const data = await response.json();

        if (tableBody.children.length === 0) {
            data.forEach(item => {
                const row = document.createElement('tr');
                const netValue = parseFloat(item.netValue) || 0;
                row.innerHTML = `
                    <td class="index-name">${item.category || 'N/A'}</td>
                    <td class="number">${item.date || 'N/A'}</td>
                    <td class="number ${netValue >= 0 ? 'positive' : 'negative'}">${netValue >= 0 ? '+' : ''}${netValue.toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            const rows = tableBody.querySelectorAll('tr');
            data.forEach((item, i) => {
                if (rows[i]) {
                    const netValue = parseFloat(item.netValue) || 0;
                    const cells = rows[i].cells;
                    cells[1].textContent = item.date || 'N/A';
                    cells[2].textContent = `${netValue >= 0 ? '+' : ''}${netValue.toFixed(2)}`;
                    cells[2].className = `number ${netValue >= 0 ? 'positive' : 'negative'}`;
                }
            });
        }
    } catch (error) {}
}

async function fetchFiiDiiNse() {
    const tableBody = document.getElementById('fii-dii-nse-body');
    try {
        const response = await fetch('http://localhost:3000/api/fii-dii-nse');
        if (!response.ok) return;
        const data = await response.json();

        if (tableBody.children.length === 0) {
            data.forEach(item => {
                const row = document.createElement('tr');
                const netValue = parseFloat(item.netValue) || 0;
                row.innerHTML = `
                    <td class="index-name">${item.category || 'N/A'}</td>
                    <td class="number">${item.date || 'N/A'}</td>
                    <td class="number ${netValue >= 0 ? 'positive' : 'negative'}">${netValue >= 0 ? '+' : ''}${netValue.toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            const rows = tableBody.querySelectorAll('tr');
            data.forEach((item, i) => {
                if (rows[i]) {
                    const netValue = parseFloat(item.netValue) || 0;
                    const cells = rows[i].cells;
                    cells[1].textContent = item.date || 'N/A';
                    cells[2].textContent = `${netValue >= 0 ? '+' : ''}${netValue.toFixed(2)}`;
                    cells[2].className = `number ${netValue >= 0 ? 'positive' : 'negative'}`;
                }
            });
        }
    } catch (error) {}
}

async function fetchVolumeGainers() {
    const tableBody = document.getElementById('volume-gainers-body');
    try {
        const response = await fetch('http://localhost:3000/api/volume-gainers');
        if (!response.ok) return;
        const data = await response.json();
        const stocks = data.data || [];

        if (tableBody.children.length === 0) {
            stocks.forEach(stock => {
                const row = document.createElement('tr');
                const pChange = parseFloat(stock.pChange) || 0;
                const percentageIncrease = parseFloat(stock.percentageIncrease) || 0;
                row.innerHTML = `
                    <td class="index-name">${stock.symbol || 'N/A'}</td>
                    <td class="number">${parseFloat(stock.ltp || 0).toFixed(2)}</td>
                    <td class="number positive">+${pChange.toFixed(2)}%</td>
                    <td class="number positive">+${percentageIncrease.toFixed(1)}%</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            const rows = tableBody.querySelectorAll('tr');
            stocks.forEach((stock, i) => {
                if (rows[i]) {
                    const pChange = parseFloat(stock.pChange) || 0;
                    const percentageIncrease = parseFloat(stock.percentageIncrease) || 0;
                    const cells = rows[i].cells;
                    cells[0].textContent = stock.symbol || 'N/A';
                    cells[1].textContent = parseFloat(stock.ltp || 0).toFixed(2);
                    cells[2].textContent = `+${pChange.toFixed(2)}%`;
                    cells[3].textContent = `+${percentageIncrease.toFixed(1)}%`;
                }
            });
        }
    } catch (error) {}
}

async function updateAllData() {
    if (isFetching) return;
    isFetching = true;
    try {
        await Promise.allSettled([
            fetchMarketStats(),
            fetchMainIndices(),
            fetchIndices(),
            fetchMetals(),
            fetchIntlMetals(),
            fetchFiiDiiReact(),
            fetchFiiDiiNse(),
            fetchVolumeGainers()
        ]);
    } finally {
        isFetching = false;
    }
}

updateTimestamp();
setInterval(updateTimestamp, 1000);
updateAllData();
setInterval(updateAllData, 1000);

// Company news search
const searchInput = document.getElementById('company-search');
const searchBtn = document.getElementById('search-btn');

function searchCompanyNews() {
    const companyName = searchInput.value.trim();
    if (companyName) {
        const searchQuery = encodeURIComponent(`recent news ${companyName}`);
        window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
        searchInput.value = '';
    }
}

searchBtn.addEventListener('click', searchCompanyNews);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchCompanyNews();
    }
});
