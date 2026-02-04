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

async function fetchMarketStats() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const statsEl = document.getElementById('stats');

    try {
        const response = await fetch('http://localhost:3000/api/market-stats');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const cm = data.data?.snapshotCapitalMarket || {};

        // Display the stats
        statsEl.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Stock Traded</div>
                <div class="stat-value">${cm.total || 'N/A'}</div>
            </div>
            <div class="stat-card advances">
                <div class="stat-label">Advances</div>
                <div class="stat-value">${cm.advances || 'N/A'}</div>
            </div>
            <div class="stat-card declines">
                <div class="stat-label">Declines</div>
                <div class="stat-value">${cm.declines || 'N/A'}</div>
            </div>
            <div class="stat-card unchanged">
                <div class="stat-label">Unchanged</div>
                <div class="stat-value">${cm.unchange || 'N/A'}</div>
            </div>
        `;

        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.textContent = `Error: ${error.message}. Make sure the server is running (npm start).`;
        errorEl.style.display = 'block';
        console.error('Error fetching market stats:', error);
    }
}

async function fetchIndices() {
    const loadingEl = document.getElementById('indices-loading');
    const errorEl = document.getElementById('indices-error');
    const tableBody = document.getElementById('indices-body');

    try {
        const response = await fetch('http://localhost:3000/api/all-indices');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const indices = data.data || [];

        // Clear existing rows
        tableBody.innerHTML = '';

        // Populate table
        indices.forEach(index => {
            const row = document.createElement('tr');
            const change = parseFloat(index.variation) || 0;
            const pChange = parseFloat(index.percentChange) || 0;
            
            row.innerHTML = `
                <td class="index-name">${index.indexName || index.index || 'N/A'}</td>
                <td>${parseFloat(index.last || index.lastPrice || 0).toFixed(2)}</td>
                <td class="${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}</td>
                <td class="${pChange >= 0 ? 'positive' : 'negative'}">${pChange >= 0 ? '+' : ''}${pChange.toFixed(2)}%</td>
                <td>${parseFloat(index.open || 0).toFixed(2)}</td>
                <td>${parseFloat(index.high || 0).toFixed(2)}</td>
                <td>${parseFloat(index.low || 0).toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });

        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.textContent = `Error: ${error.message}. Make sure the server is running (npm start).`;
        errorEl.style.display = 'block';
        console.error('Error fetching indices:', error);
    }
}

// Fetch data when page loads and then every 100ms
updateTimestamp();
setInterval(updateTimestamp, 1000);

fetchMarketStats();
fetchIndices();

setInterval(fetchMarketStats, 100);
setInterval(fetchIndices, 100);

