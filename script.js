// ─── Timestamp ───
function updateTimestamp() {
    const now = new Date();
    const el = document.getElementById('timestamp');
    if (el) {
        el.textContent = now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' });
    }
}

let isFetching = false;

// ─── Market Stats (top bar) ───
async function fetchMarketStats() {
    try {
        const response = await fetch('http://localhost:3000/api/market-stats');
        if (!response.ok) return;
        const data = await response.json();
        const cm = data.data?.snapshotCapitalMarket || {};

        document.getElementById('stat-total').textContent = cm.total || '-';
        document.getElementById('stat-advances').textContent = cm.advances || '-';
        document.getElementById('stat-declines').textContent = cm.declines || '-';
        document.getElementById('stat-unchanged').textContent = cm.unchange || '-';

        // PROPEN - use fiftyTwoWeek high/low counts
        const fw = data.data?.fiftyTwoWeek || {};
        document.getElementById('stat-propen-adv').textContent = fw.high || '-';
        document.getElementById('stat-propen-dec').textContent = fw.low || '-';
    } catch (e) {}
}

// ─── Main Indices (Column 1 top) ───
const mainIndexNames = [
    'NIFTY 50', 'NIFTY BANK', 'NIFTY FINANCIAL SERVICES',
    'NIFTY LARGEMIDCAP 250', 'NIFTY MIDCAP 150', 'NIFTY MIDCAP SELECT',
    'NIFTY MIDSMALLCAP 400', 'NIFTY SMALLCAP 250', 'NIFTY MICROCAP 250'
];

// ─── Sector Indices (Column 1 bottom) ───
const sectorNames = [
    'NIFTY AUTO', 'NIFTY FINANCIAL SERVICES 25/50', 'NIFTY FMCG',
    'NIFTY IT', 'NIFTY MEDIA', 'NIFTY METAL', 'NIFTY PHARMA',
    'NIFTY PSU BANK', 'NIFTY PRIVATE BANK', 'NIFTY REALTY',
    'NIFTY HEALTHCARE INDEX', 'NIFTY CONSUMER DURABLES',
    'NIFTY OIL & GAS', 'NIFTY MIDSMALL HEALTHCARE',
    'NIFTY FINANCIAL SERVICES EX-BANK', 'NIFTY MIDSMALL FINANCIAL SERVICES',
    'NIFTY MIDSMALL IT & TELECOM', 'NIFTY CHEMICALS'
];

// ─── Thematic Indices (Column 2 top) ───
const thematicNames = [
    'NIFTY CAPITAL MARKETS', 'NIFTY COMMODITIES', 'NIFTY CORE HOUSING',
    'NIFTY CPSE', 'NIFTY ENERGY', 'NIFTY EV & NEW AGE AUTOMOTIVE',
    'NIFTY HOUSING', 'NIFTY INDIA CONSUMPTION',
    'NIFTY INDIA DEFENCE', 'NIFTY INDIA DIGITAL',
    'NIFTY INDIA MANUFACTURING', 'NIFTY INDIA NEW AGE CONSUMPTION',
    'NIFTY INDIA TOURISM', 'NIFTY INFRASTRUCTURE',
    'NIFTY MNC', 'NIFTY MOBILITY', 'NIFTY PSE',
    'NIFTY SERVICES SECTOR'
];

function renderRows(tbody, items, getRow) {
    if (tbody.children.length === 0) {
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = getRow(item);
            tbody.appendChild(row);
        });
    } else {
        const rows = tbody.querySelectorAll('tr');
        items.forEach((item, i) => {
            if (rows[i]) {
                rows[i].innerHTML = getRow(item);
            }
        });
    }
}

function indexRow(item) {
    const pChange = parseFloat(item.percentChange) || 0;
    const cls = pChange >= 0 ? 'positive' : 'negative';
    const sign = pChange >= 0 ? '+' : '';
    return `
        <td class="index-name">${item.index || 'N/A'}</td>
        <td>${parseFloat(item.last || 0).toFixed(2)}</td>
        <td class="${cls}">${sign}${pChange.toFixed(2)}%</td>
    `;
}

async function fetchAllIndices() {
    try {
        const response = await fetch('http://localhost:3000/api/all-indices');
        if (!response.ok) return;
        const data = await response.json();
        const all = data.data || [];

        // Main indices
        const mainIndices = mainIndexNames.map(n => all.find(i => i.index === n)).filter(Boolean);
        renderRows(document.getElementById('main-indices-body'), mainIndices, indexRow);

        // Sector indices
        const sectorIndices = sectorNames.map(n => all.find(i => i.index === n)).filter(Boolean);
        renderRows(document.getElementById('sector-body'), sectorIndices, indexRow);

        // Thematic indices
        const thematicIndices = thematicNames.map(n => all.find(i => i.index === n)).filter(Boolean);
        renderRows(document.getElementById('thematic-body'), thematicIndices, indexRow);
    } catch (e) {}
}

// ─── International Metals ───
async function fetchIntlMetals() {
    try {
        const response = await fetch('http://localhost:3000/api/intl-metals');
        if (!response.ok) return;
        const data = await response.json();
        const metals = data.data || [];

        renderRows(document.getElementById('intl-metals-body'), metals, (m) => {
            const change = parseFloat(m.change) || 0;
            const cls = change >= 0 ? 'positive' : 'negative';
            const sign = change >= 0 ? '+' : '';
            return `
                <td class="index-name">${m.name}</td>
                <td>${parseFloat(m.rate || 0).toFixed(2)}</td>
                <td class="${cls}">${sign}${change.toFixed(2)}%</td>
            `;
        });
    } catch (e) {}
}

// ─── Indian Metals ───
async function fetchIndianMetals() {
    try {
        const response = await fetch('http://localhost:3000/api/metals');
        if (!response.ok) return;
        const data = await response.json();
        const metals = data.data || [];

        renderRows(document.getElementById('indian-metals-body'), metals, (m) => {
            const change = parseFloat(m.change) || 0;
            const cls = change >= 0 ? 'positive' : 'negative';
            const sign = change >= 0 ? '+' : '';
            return `
                <td class="index-name">${m.name}</td>
                <td>${parseFloat(m.rate || 0).toFixed(2)}</td>
                <td class="${cls}">${sign}${change.toFixed(2)}%</td>
            `;
        });
    } catch (e) {}
}

// ─── FII/DII BSE (React) ───
async function fetchFiiDiiBse() {
    try {
        const response = await fetch('http://localhost:3000/api/fii-dii-react');
        if (!response.ok) return;
        const data = await response.json();

        renderRows(document.getElementById('fii-dii-bse-body'), data, (item) => {
            const nv = parseFloat(item.netValue) || 0;
            const cls = nv >= 0 ? 'positive' : 'negative';
            const sign = nv >= 0 ? '+' : '';
            return `
                <td class="index-name">${item.category || 'N/A'}</td>
                <td>${item.date || 'N/A'}</td>
                <td class="${cls}">${sign}${nv.toFixed(2)}</td>
            `;
        });
    } catch (e) {}
}

// ─── FII/DII NSE ───
async function fetchFiiDiiNse() {
    try {
        const response = await fetch('http://localhost:3000/api/fii-dii-nse');
        if (!response.ok) return;
        const data = await response.json();

        renderRows(document.getElementById('fii-dii-nse-body'), data, (item) => {
            const nv = parseFloat(item.netValue) || 0;
            const cls = nv >= 0 ? 'positive' : 'negative';
            const sign = nv >= 0 ? '+' : '';
            return `
                <td class="index-name">${item.category || 'N/A'}</td>
                <td>${item.date || 'N/A'}</td>
                <td class="${cls}">${sign}${nv.toFixed(2)}</td>
            `;
        });
    } catch (e) {}
}

// ─── Volume Gainers ───
async function fetchVolumeGainers() {
    try {
        const response = await fetch('http://localhost:3000/api/volume-gainers');
        if (!response.ok) return;
        const data = await response.json();
        const stocks = data.data || [];

        renderRows(document.getElementById('volume-gainers-body'), stocks, (stock, i) => {
            const pChange = parseFloat(stock.pChange) || 0;
            const volPct = parseFloat(stock.percentageIncrease) || 0;
            return `
                <td class="index-name">${stock.symbol || 'N/A'}</td>
                <td class="positive">+${pChange.toFixed(2)}%</td>
                <td class="positive">+${volPct.toFixed(1)}%</td>
            `;
        });
    } catch (e) {}
}

// ─── 52 Week High ───
async function fetch52WeekHigh() {
    try {
        const response = await fetch('http://localhost:3000/api/52-week-high');
        if (!response.ok) return;
        const data = await response.json();
        const stocks = data.data || [];

        renderRows(document.getElementById('week52-body'), stocks, (stock, i) => {
            return `
                <td class="index-name">${stock.symbol || 'N/A'}</td>
                <td></td>
                <td class="rank-num">${i + 1}</td>
            `;
        });
    } catch (e) {}
}

// Extend renderRows to pass index
const _origRenderRows = renderRows;
function renderRowsIdx(tbody, items, getRow) {
    if (tbody.children.length === 0) {
        items.forEach((item, i) => {
            const row = document.createElement('tr');
            row.innerHTML = getRow(item, i);
            tbody.appendChild(row);
        });
    } else {
        const rows = tbody.querySelectorAll('tr');
        items.forEach((item, i) => {
            if (rows[i]) {
                rows[i].innerHTML = getRow(item, i);
            } else {
                const row = document.createElement('tr');
                row.innerHTML = getRow(item, i);
                tbody.appendChild(row);
            }
        });
    }
}

// Override for 52 week and volume gainers to use index-aware render
async function fetch52WeekHighFull() {
    try {
        const response = await fetch('http://localhost:3000/api/52-week-high');
        if (!response.ok) return;
        const data = await response.json();
        const stocks = data.data || [];

        renderRowsIdx(document.getElementById('week52-body'), stocks, (stock, i) => {
            return `
                <td class="index-name">${stock.symbol || 'N/A'}</td>
                <td></td>
                <td class="rank-num">${i + 1}</td>
            `;
        });
    } catch (e) {}
}

// ─── Main update loop ───
async function updateAllData() {
    if (isFetching) return;
    isFetching = true;
    try {
        await Promise.allSettled([
            fetchMarketStats(),
            fetchAllIndices(),
            fetchIntlMetals(),
            fetchIndianMetals(),
            fetchFiiDiiBse(),
            fetchFiiDiiNse(),
            fetchVolumeGainers(),
            fetch52WeekHighFull()
        ]);
    } finally {
        isFetching = false;
    }
}

updateTimestamp();
setInterval(updateTimestamp, 1000);
updateAllData();
setInterval(updateAllData, 2000);

// ─── Search ───
const searchInput = document.getElementById('company-search');

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const name = searchInput.value.trim();
        if (name) {
            const q = encodeURIComponent(`recent news ${name}`);
            window.open(`https://www.google.com/search?q=${q}`, '_blank');
            searchInput.value = '';
        }
    }
});
