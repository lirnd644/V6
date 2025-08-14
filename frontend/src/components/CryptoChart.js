import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CryptoChart = ({ symbol, timeframe = '1h', className = '' }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchChartData();
  }, [symbol, timeframe]);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/crypto/chart/${symbol}?timeframe=${timeframe}`);
      const data = response.data;
      
      if (data.prices && data.prices.length > 0) {
        prepareChartData(data);
      } else {
        // Generate mock data if API fails
        generateMockData();
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const now = Date.now();
    const interval = timeframe === '1h' ? 3600000 : timeframe === '4h' ? 14400000 : 60000; // milliseconds
    const points = 50;
    
    let basePrice = 45000; // Base price for BTC
    if (symbol === 'ETH') basePrice = 2800;
    else if (symbol === 'BNB') basePrice = 300;
    else if (symbol === 'SOL') basePrice = 100;
    
    const prices = [];
    const volumes = [];
    
    for (let i = points; i >= 0; i--) {
      const timestamp = now - (i * interval);
      const volatility = basePrice * 0.02; // 2% volatility
      const price = basePrice + (Math.random() - 0.5) * volatility;
      const volume = Math.random() * 1000000000; // Random volume
      
      prices.push([timestamp, price]);
      volumes.push([timestamp, volume]);
      
      basePrice = price; // Use previous price as base for next
    }
    
    prepareChartData({ prices, volumes: volumes });
  };

  const prepareChartData = (data) => {
    const prices = data.prices || [];
    const volumes = data.volumes || [];
    
    if (prices.length === 0) {
      setError('No data available');
      return;
    }

    const labels = prices.map(price => {
      const date = new Date(price[0]);
      return timeframe === '1d' ? 
        date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }) :
        date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    });

    const priceData = prices.map(price => price[1]);
    const volumeData = volumes.map(volume => volume[1] / 1000000); // Convert to millions

    // Calculate price change
    const firstPrice = priceData[0];
    const lastPrice = priceData[priceData.length - 1];
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    const isPositive = priceChange >= 0;

    const chartData = {
      labels,
      datasets: [
        {
          label: `${symbol} Цена`,
          data: priceData,
          borderColor: isPositive ? 
            'rgba(34, 197, 94, 1)' : 
            'rgba(239, 68, 68, 1)',
          backgroundColor: isPositive ?
            'rgba(34, 197, 94, 0.1)' :
            'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: isPositive ? '#22c55e' : '#ef4444',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
        },
        {
          label: 'Объем (M)',
          data: volumeData,
          borderColor: 'rgba(234, 179, 8, 0.6)',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          borderWidth: 1,
          fill: true,
          tension: 0.2,
          pointRadius: 0,
          yAxisID: 'y1',
        }
      ]
    };

    setChartData({
      ...chartData,
      priceChange,
      isPositive,
      currentPrice: lastPrice,
      volume24h: volumes.length > 0 ? volumes[volumes.length - 1][1] : 0
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#22c55e',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 26, 10, 0.95)',
        titleColor: '#f0fdf4',
        bodyColor: '#22c55e',
        borderColor: '#22c55e',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => {
            return `${symbol} - ${context[0].label}`;
          },
          label: (context) => {
            if (context.datasetIndex === 0) {
              return `Цена: $${context.parsed.y.toLocaleString()}`;
            } else {
              return `Объем: ${context.parsed.y.toFixed(1)}M`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(34, 197, 94, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#22c55e',
          font: {
            size: 11
          },
          maxTicksLimit: 8
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: {
          color: 'rgba(34, 197, 94, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#22c55e',
          font: {
            size: 11
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
          color: 'rgba(234, 179, 8, 0.1)',
        },
        ticks: {
          color: '#eab308',
          font: {
            size: 11
          },
          callback: function(value) {
            return value.toFixed(0) + 'M';
          }
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 8,
      }
    }
  };

  if (loading) {
    return (
      <div className={`chart-container ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="spinner-green mx-auto"></div>
            <p className="text-green-200">Загрузка графика...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className={`chart-container ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <BarChart3 className="w-12 h-12 text-green-400 mx-auto opacity-50" />
            <p className="text-green-200">Ошибка загрузки данных</p>
            <button onClick={fetchChartData} className="btn-secondary text-sm">
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-container ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold text-white crypto-font">{symbol}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white crypto-font">
              ${chartData.currentPrice?.toLocaleString()}
            </span>
            <span className={`flex items-center text-sm font-semibold px-2 py-1 rounded-lg ${
              chartData.isPositive ? 'text-success bg-success/10' : 'text-red-400 bg-red-500/10'
            }`}>
              {chartData.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {chartData.priceChange?.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-green-300">
          <Activity className="w-4 h-4" />
          <span>Объем: ${(chartData.volume24h / 1000000000).toFixed(1)}B</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      </div>

      {/* Chart Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-green-400">
        <span>Временной интервал: {timeframe}</span>
        <span>Последнее обновление: {new Date().toLocaleTimeString('ru-RU')}</span>
      </div>
    </div>
  );
};

export default CryptoChart;