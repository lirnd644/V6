import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, TrendingUp, TrendingDown, Clock, Zap, Brain, Target, Activity } from 'lucide-react';

const AIPredictions = ({ user }) => {
  const [aiPredictions, setAiPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchAIPredictions();
    const interval = setInterval(fetchAIPredictions, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAIPredictions = async () => {
    try {
      const response = await axios.get('/api/ai-predictions');
      setAiPredictions(response.data);
    } catch (error) {
      console.error('Error fetching AI predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateManualPrediction = async (symbol = 'BTC', timeframe = '1h') => {
    setGenerating(true);
    try {
      const response = await axios.post('/api/ai-predictions/manual', {
        symbol,
        timeframe
      });
      
      // Add new prediction to the list
      setAiPredictions(prev => [response.data, ...prev]);
      
      // Show success message (you can add a toast notification here)
      console.log('AI prediction generated successfully!');
    } catch (error) {
      console.error('Error generating AI prediction:', error);
    } finally {
      setGenerating(false);
    }
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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 65) return 'text-gold';
    return 'text-orange-400';
  };

  const getConfidenceBarWidth = (confidence) => {
    return `${Math.min(100, Math.max(0, confidence))}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="spinner-green mx-auto"></div>
          <p className="text-green-200">ИИ анализирует рынок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="glass-card p-8 fade-in-up">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-2xl flex items-center justify-center ai-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                <span className="ai-gradient-text">ИИ Прогнозы</span>
              </h1>
              <p className="text-green-200 text-lg">
                Автоматические прогнозы на основе машинного обучения
              </p>
            </div>
          </div>
          
          {/* AI Status */}
          <div className="flex flex-col items-center lg:items-end space-y-4">
            <div className="ai-status">
              <div className="ai-status-dot"></div>
              <span>ИИ Активен</span>
            </div>
            
            <button
              onClick={() => generateManualPrediction()}
              disabled={generating}
              className="btn-ai flex items-center space-x-2"
            >
              {generating ? (
                <>
                  <div className="spinner-green w-4 h-4"></div>
                  <span>Анализ...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Запросить прогноз</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="ai-stat-card">
          <Bot className="w-8 h-8 ai-gradient-text mx-auto mb-3" />
          <div className="text-2xl font-bold ai-gradient-text crypto-font">{aiPredictions.length}</div>
          <div className="text-sm text-green-300">Всего прогнозов</div>
        </div>
        
        <div className="ai-stat-card">
          <Target className="w-8 h-8 text-success mx-auto mb-3" />
          <div className="text-2xl font-bold text-success crypto-font">
            {aiPredictions.filter(p => p.status === 'ACTIVE').length}
          </div>
          <div className="text-sm text-green-300">Активных</div>
        </div>
        
        <div className="ai-stat-card">
          <Activity className="w-8 h-8 text-gold mx-auto mb-3" />
          <div className="text-2xl font-bold text-gold crypto-font">
            {aiPredictions.length > 0 ? 
              Math.round(aiPredictions.reduce((acc, p) => acc + p.confidence_score, 0) / aiPredictions.length) : 0}%
          </div>
          <div className="text-sm text-green-300">Средняя точность</div>
        </div>
        
        <div className="ai-stat-card">
          <Clock className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <div className="text-2xl font-bold text-emerald-400 crypto-font">5м</div>
          <div className="text-sm text-green-300">Частота анализа</div>
        </div>
      </div>

      {/* AI Predictions List */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            <span>Автоматические прогнозы</span>
          </h2>
          
          {aiPredictions.length > 0 && (
            <div className="text-sm text-green-300">
              Последнее обновление: {new Date().toLocaleTimeString('ru-RU')}
            </div>
          )}
        </div>

        {aiPredictions.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-2">Прогнозы загружаются</h3>
            <p className="text-green-300 mb-4">ИИ система анализирует рынок каждые 5 минут</p>
            <button
              onClick={() => generateManualPrediction()}
              className="btn-ai"
            >
              Запросить прогноз сейчас
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {aiPredictions.map((prediction, index) => (
              <div key={prediction.id} className="ai-prediction-card ai-slide-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      prediction.direction === 'UP' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {prediction.direction === 'UP' ? 
                        <TrendingUp className="w-7 h-7" /> : 
                        <TrendingDown className="w-7 h-7" />
                      }
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold text-white crypto-font">{prediction.symbol}</h3>
                        <span className="ai-status">
                          <Bot className="w-3 h-3" />
                          <span>ИИ</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-green-300">
                        <span>{prediction.timeframe}</span>
                        <span>•</span>
                        <span>Вход: ${prediction.entry_price?.toLocaleString()}</span>
                        <span>•</span>
                        <span className={prediction.status === 'ACTIVE' ? 'text-gold' : 'text-green-400'}>
                          {prediction.status === 'ACTIVE' ? getTimeLeft(prediction.expiry_time) : prediction.status}
                        </span>
                      </div>
                      
                      {prediction.ai_reasoning && (
                        <div className="mt-2 text-sm text-green-200 bg-emerald-500/10 rounded-lg p-2 max-w-md">
                          <span className="font-semibold">Анализ ИИ:</span> {prediction.ai_reasoning}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Confidence Meter */}
                  <div className="text-right space-y-2">
                    <div className="confidence-meter">
                      <span className={`text-sm font-semibold ${getConfidenceColor(prediction.confidence_score)}`}>
                        {prediction.confidence_score}%
                      </span>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill" 
                          style={{ width: getConfidenceBarWidth(prediction.confidence_score) }}
                        ></div>
                      </div>
                    </div>
                    
                    {prediction.technical_indicators && (
                      <div className="text-xs text-green-400">
                        RSI: {prediction.technical_indicators.rsi?.toFixed(1)}
                        {prediction.sentiment_analysis?.overall_sentiment && (
                          <span className="ml-2">
                            📊 {(prediction.sentiment_analysis.overall_sentiment * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Technical Analysis Preview */}
                {prediction.technical_indicators && Object.keys(prediction.technical_indicators).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-emerald-500/20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      {prediction.technical_indicators.sma_5 && (
                        <div className="text-center">
                          <div className="text-green-400 font-semibold">SMA5</div>
                          <div className="text-white">${prediction.technical_indicators.sma_5.toFixed(2)}</div>
                        </div>
                      )}
                      {prediction.technical_indicators.rsi && (
                        <div className="text-center">
                          <div className="text-gold font-semibold">RSI</div>
                          <div className="text-white">{prediction.technical_indicators.rsi.toFixed(1)}</div>
                        </div>
                      )}
                      {prediction.technical_indicators.volatility && (
                        <div className="text-center">
                          <div className="text-emerald-400 font-semibold">Волатильность</div>
                          <div className="text-white">{prediction.technical_indicators.volatility.toFixed(1)}%</div>
                        </div>
                      )}
                      {prediction.sentiment_analysis?.overall_sentiment && (
                        <div className="text-center">
                          <div className="text-yellow-400 font-semibold">Настроение</div>
                          <div className={`${prediction.sentiment_analysis.overall_sentiment > 0 ? 'text-success' : 'text-red-400'}`}>
                            {prediction.sentiment_analysis.overall_sentiment > 0 ? '📈' : '📉'} 
                            {(Math.abs(prediction.sentiment_analysis.overall_sentiment) * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Generate Section */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-gold" />
          <span>Быстрый анализ</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['BTC', 'ETH', 'BNB', 'SOL'].map((symbol) => (
            <button
              key={symbol}
              onClick={() => generateManualPrediction(symbol, '1h')}
              disabled={generating}
              className="btn-secondary text-sm py-2"
            >
              {symbol}
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-green-300 text-center">
          ИИ проанализирует технические индикаторы, настроения рынка и создаст прогноз за 2-3 секунды
        </div>
      </div>
    </div>
  );
};

export default AIPredictions;