import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Zap, Target, Shield, Bot, Brain, Activity, Clock } from 'lucide-react';
import CryptoChart from './CryptoChart';

const Dashboard = ({ user }) => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePredictions, setActivePredictions] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(12);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');

  useEffect(() => {
    fetchCryptoData();
    fetchActivePredictions();
    fetchAIPredictions();
    const interval = setInterval(() => {
      fetchCryptoData();
      fetchAIPredictions();
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [user]);

  const fetchCryptoData = async () => {
    try {
      const currency = user.preferred_currency || 'USD';
      const response = await axios.get(`/api/crypto/prices?currency=${currency}&limit=50`);
      setCryptoData(response.data);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePredictions = async () => {
    try {
      const response = await axios.get('/api/binary-predictions');
      const active = response.data.filter(p => p.status === 'ACTIVE');
      setActivePredictions(active.slice(0, 3));
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchAIPredictions = async () => {
    try {
      const response = await axios.get('/api/ai-predictions');
      setAiPredictions(response.data.slice(0, 3)); // Show latest 3 AI predictions
    } catch (error) {
      console.error('Error fetching AI predictions:', error);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$', 'RUB': '₽', 'EUR': '€', 'GBP': '£',
      'JPY': '¥', 'CNY': '¥', 'KRW': '₩', 'INR': '₹'
    };
    return symbols[currency] || '$';
  };

  const getCryptoIcon = (iconUrl, symbol) => {
    if (iconUrl && iconUrl !== '') {
      return (
        <img 
          src={iconUrl} 
          alt={symbol} 
          className="crypto-icon"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    return (
      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
        {symbol.charAt(0)}
      </div>
    );
  };

  const getTimeLeft = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Завершен';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="spinner-green mx-auto"></div>
          <p className="text-green-200">Загружаем актуальные данные рынка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section with AI Stats */}
      <div className="glass-card p-8 fade-in-up">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Добро пожаловать, <span className="gradient-text">{user.name}</span>!
            </h1>
            <p className="text-green-200 text-lg">
              У вас осталось <span className="text-emerald-400 font-semibold crypto-font">{user.free_predictions}</span> бесплатных прогнозов
            </p>
            
            {/* AI Status */}
            <div className="mt-3 flex items-center space-x-4">
              <div className="ai-status">
                <div className="ai-status-dot"></div>
                <span>ИИ система активна</span>
              </div>
              <div className="text-sm text-green-300">
                {aiPredictions.length} автоматических прогнозов за сегодня
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold gradient-text">{user.total_predictions_used || 0}</div>
              <div className="text-sm text-green-300">Всего прогнозов</div>
            </div>
            <div className="stat-card">
              <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold gradient-text">75.5%</div>
              <div className="text-sm text-green-300">Точность</div>
            </div>
            <div className="ai-stat-card">
              <Bot className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold ai-gradient-text">{aiPredictions.length}</div>
              <div className="text-sm text-green-300">ИИ прогнозов</div>
            </div>
            <div className="ai-stat-card">
              <Brain className="w-6 h-6 text-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-gold">AUTO</div>
              <div className="text-sm text-green-300">Режим ИИ</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Predictions Section */}
      {aiPredictions.length > 0 && (
        <div className="glass-card p-6 ai-slide-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Bot className="w-6 h-6 text-emerald-400" />
              <span>ИИ Прогнозы</span>
              <div className="ai-status ml-2">
                <div className="ai-status-dot"></div>
                <span className="text-xs">Автоматические</span>
              </div>
            </h2>
            <a href="/ai-predictions" className="text-emerald-400 hover:text-emerald-300 text-sm">
              Все ИИ прогнозы →
            </a>
          </div>

          <div className="grid gap-4">
            {aiPredictions.map((prediction, index) => (
              <div key={prediction.id} className="ai-prediction-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      prediction.direction === 'UP' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {prediction.direction === 'UP' ? 
                        <TrendingUp className="w-6 h-6" /> : 
                        <TrendingDown className="w-6 h-6" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white crypto-font">{prediction.symbol}</h3>
                        <span className="ai-status">
                          <Bot className="w-3 h-3" />
                          <span>ИИ</span>
                        </span>
                      </div>
                      <p className="text-green-300 text-sm">{prediction.timeframe} • Анализ: {prediction.ai_reasoning?.substring(0, 50)}...</p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="text-emerald-400 font-semibold text-lg">
                      {prediction.confidence_score}%
                    </div>
                    <div className="text-sm text-green-300">
                      {getTimeLeft(prediction.expiry_time)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Manual Predictions */}
      {activePredictions.length > 0 && (
        <div className="glass-card p-6 slide-in-right">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
              <span>Ручные прогнозы</span>
            </h2>
            <a href="/trading" className="text-emerald-400 hover:text-emerald-300 text-sm">
              Все прогнозы →
            </a>
          </div>

          <div className="grid gap-4">
            {activePredictions.map((prediction, index) => (
              <div key={index} className="prediction-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      prediction.direction === 'UP' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {prediction.direction === 'UP' ? 
                        <TrendingUp className="w-6 h-6" /> : 
                        <TrendingDown className="w-6 h-6" />
                      }
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white crypto-font">{prediction.symbol}</h3>
                      <p className="text-green-300 text-sm">{prediction.timeframe} • Ставка: {prediction.stake_amount}</p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="text-emerald-400 font-semibold">
                      {getTimeLeft(prediction.expiry_time)}
                    </div>
                    <div className="text-sm text-green-300">
                      Уверенность: <span className="text-emerald-400">{prediction.confidence_score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span>График {selectedCrypto}</span>
          </h2>
          
          <div className="flex items-center space-x-2">
            {['BTC', 'ETH', 'BNB', 'SOL'].map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedCrypto(symbol)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  selectedCrypto === symbol
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        <CryptoChart symbol={selectedCrypto} timeframe="1h" />
      </div>

      {/* Crypto Prices Grid */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>Рыночные цены</span>
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-300">
              Валюта: {user.preferred_currency || 'USD'}
            </span>
            <button
              onClick={() => setDisplayLimit(displayLimit === 12 ? 50 : 12)}
              className="text-emerald-400 hover:text-emerald-300 text-sm"
            >
              {displayLimit === 12 ? 'Показать все' : 'Показать меньше'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cryptoData.slice(0, displayLimit).map((crypto, index) => (
            <div key={index} className="crypto-card glass-card p-4 cursor-pointer" onClick={() => setSelectedCrypto(crypto.symbol)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getCryptoIcon(crypto.icon_url, crypto.symbol)}
                  <div className="hidden w-8 h-8 bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {crypto.symbol.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white crypto-font">
                      {crypto.symbol}
                    </h3>
                    <p className="text-green-300 text-xs">{crypto.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  crypto.price_change_percentage_24h > 0 
                    ? 'bg-success/20 text-success' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {crypto.price_change_percentage_24h > 0 ? '+' : ''}
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="text-xl font-bold text-white crypto-font">
                  {getCurrencySymbol(user.preferred_currency || 'USD')}{crypto.current_price.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-sm text-green-300">
                  <span>Объем: {getCurrencySymbol(user.preferred_currency || 'USD')}{(crypto.volume_24h / 1000000).toFixed(1)}M</span>
                  <span className="text-emerald-400 text-xs hover:text-emerald-300">
                    Анализ →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <a href="/ai-predictions" className="glass-card p-6 hover:bg-emerald-800/20 transition-all duration-300 group">
          <Bot className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform ai-pulse" />
          <h3 className="text-lg font-semibold text-white mb-2">ИИ Прогнозы</h3>
          <p className="text-green-300 text-sm">Автоматические прогнозы на основе машинного обучения</p>
        </a>

        <a href="/trading" className="glass-card p-6 hover:bg-emerald-800/20 transition-all duration-300 group">
          <Target className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-2">Бинарная торговля</h3>
          <p className="text-green-300 text-sm">Прогнозируйте направление цены ВВЕРХ или ВНИЗ</p>
        </a>

        <a href="/investments" className="glass-card p-6 hover:bg-emerald-800/20 transition-all duration-300 group">
          <Shield className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-2">Инвестиции</h3>
          <p className="text-green-300 text-sm">Получите экспертные рекомендации для долгосрочных вложений</p>
        </a>

        <a href="/referrals" className="glass-card p-6 hover:bg-emerald-800/20 transition-all duration-300 group">
          <Zap className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-2">Пригласить друзей</h3>
          <p className="text-green-300 text-sm">Получайте бонусы за каждого приглашенного друга</p>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;