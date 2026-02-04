# NSE Market Dashboard

A real-time market dashboard for National Stock Exchange of India (NSE) displaying live market statistics and indices data.

## Overview

This application provides a clean, professional interface to monitor NSE market data with automatic updates every 100 milliseconds. It displays market summary statistics and a comprehensive table of all market indices.

## Features

- Real-time market statistics (stocks traded, advances, declines, unchanged)
- Live indices data table with price movements
- Automatic data refresh every 100ms
- Professional, responsive design
- CORS-compliant proxy server for NSE API access

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

The dashboard will automatically begin fetching and displaying market data.

## Project Structure

```
nse/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── script.js           # Client-side JavaScript
├── server.js           # Express server (CORS proxy)
├── package.json        # Node.js dependencies
└── .gitignore          # Git ignore file
```

## API Endpoints

The server exposes two proxy endpoints:

- `GET /api/market-stats` - Market statistics data
- `GET /api/all-indices` - All NSE indices data

## Technical Details

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express
- Data Source: NSE India API
- Update Frequency: 100ms

## License

This project is for educational purposes only.
