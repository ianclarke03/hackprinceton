// Mock Market Update Function (You can replace this with a real API)
function fetchMarketUpdate() {
    const marketData = [
      "The S&P 500 saw a 0.5% gain after positive earnings reports from tech companies.",
      "Bitcoin is currently experiencing a slight pullback after hitting an all-time high earlier this month.",
      "Oil prices have been volatile due to geopolitical tensions in the Middle East.",
      "Tesla's stock is seeing a surge after a successful earnings report last week.",
    ];
    
    const randomUpdate = marketData[Math.floor(Math.random() * marketData.length)];
    document.getElementById('market-update').textContent = randomUpdate;
  }
  
  // List of trading tips (You can expand this list)
  const tradingTips = [
    "Tip: Never trade with money you can't afford to lose.",
    "Tip: Always use stop losses to manage risk in volatile markets.",
    "Tip: Keep a trading journal to track your progress and mistakes.",
    "Tip: Diversify your portfolio to reduce risk exposure.",
    "Tip: Keep emotions in check—greed and fear are your worst enemies.",
    "Tip: Understand and calculate your risk-reward ratio before every trade."
  ];
  
  // Function to rotate trading tips
  let tipIndex = 0;
  function updateTradingTip() {
    document.getElementById('tip-of-the-day').textContent = tradingTips[tipIndex];
    tipIndex = (tipIndex + 1) % tradingTips.length;
  }
  
  // Initial load
  window.onload = () => {
    fetchMarketUpdate(); // Fetch initial market update
    updateTradingTip();  // Show initial trading tip
  
    // Set up a timer to refresh the trading tip every 10 seconds (this can be adjusted)
    setInterval(updateTradingTip, 10000);
    
    // Initialize charts
    initializeCharts();
  };
  
  // Chart.js - Initializing Charts (Line, Bar, and Candlestick)
  function initializeCharts() {
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const ctxCandlestick = document.getElementById('candlestickChart').getContext('2d');
  
    // Line Chart for Stock Price (Sample Data)
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['1', '2', '3', '4', '5', '6', '7'],
        datasets: [{
          label: 'Stock Price',
          data: [100, 105, 103, 107, 110, 108, 115],
          fill: false,
          borderColor: '#4caf50',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Stock Price Movement'
          }
        }
      }
    });
  
    // Bar Chart for Trading Volume (Sample Data)
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['1', '2', '3', '4', '5', '6', '7'],
        datasets: [{
          label: 'Volume',
          data: [1200, 1500, 1800, 2000, 2200, 2100, 2500],
          backgroundColor: '#ff6384',
          borderColor: '#ff6384',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Trading Volume'
          }
        }
      }
    });
  
    // Candlestick Chart (Sample Data)
    const candlestickData = {
      datasets: [{
        label: 'Price Data',
        data: [
          { x: '2024-11-01', o: 100, h: 105, l: 99, c: 103 },
          { x: '2024-11-02', o: 103, h: 107, l: 102, c: 106 },
          { x: '2024-11-03', o: 106, h: 109, l: 104, c: 108 },
          { x: '2024-11-04', o: 108, h: 112, l: 107, c: 110 },
          { x: '2024-11-05', o: 110, h: 113, l: 109, c: 112 }
        ],
        borderColor: '#4caf50',
        borderWidth: 1,
        itemStyle: {
          upColor: '#4caf50',
          downColor: '#f44336'
        }
      }]
    };
  
    new Chart(ctxCandlestick, {
      type: 'candlestick',
      data: candlestickData,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Candlestick Chart'
          }
        }
      }
    });
  }
  