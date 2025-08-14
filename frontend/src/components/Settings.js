import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SourceGear, User, Globe, Bell, Palette, Bot, Save, CheckCircle } from 'lucide-react';

const Settings = ({ user, setUser }) => {
  const [settings, setSettings] = useState({
    theme: 'green',
    language: 'ru',
    notifications_enabled: true,
    preferred_currency: 'USD',
    auto_predictions_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/user/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    setSaving(true);
    setSaved(false);
    
    try {
      await axios.put('/api/user/settings', settings);
      setSaved(true);
      
      // Update user object if setUser is provided
      if (setUser) {
        setUser(prev => ({ ...prev, ...settings }));
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const themes = [
    { value: 'green', name: 'Зеленая тема', colors: ['#22c55e', '#eab308', '#10b981'] },
    { value: 'blue', name: 'Синяя тема', colors: ['#3b82f6', '#06b6d4', '#8b5cf6'] },
    { value: 'purple', name: 'Фиолетовая тема', colors: ['#8b5cf6', '#a855f7', '#06b6d4'] },
    { value: 'dark', name: 'Темная тема', colors: ['#374151', '#4b5563', '#6b7280'] }
  ];

  const languages = [
    { value: 'ru', name: 'Русский', flag: '🇷🇺' },
    { value: 'en', name: 'English', flag: '🇺🇸' },
    { value: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const currencies = [
    { value: 'USD', name: 'US Dollar', symbol: '$' },
    { value: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { value: 'EUR', name: 'Euro', symbol: '€' },
    { value: 'GBP', name: 'British Pound', symbol: '£' },
    { value: 'JPY', name: 'Japanese Yen', symbol: '¥' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="spinner-green mx-auto"></div>
          <p className="text-green-200">Загрузка настроек...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-8 fade-in-up">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-yellow-500 rounded-xl flex items-center justify-center">
            <SourceGear className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Настройки</h1>
            <p className="text-green-200">Персонализация вашего опыта</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-green-300">
            Настройки сохраняются автоматически
          </div>
          
          <button
            onClick={updateSettings}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="spinner-green w-4 h-4"></div>
                <span>Сохранение...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Сохранено</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Сохранить</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Settings */}
        <div className="glass-card p-6 slide-in-right">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Тема оформления</h2>
          </div>

          <div className="space-y-4">
            {themes.map((theme) => (
              <div
                key={theme.value}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  settings.theme === theme.value
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-400/50'
                }`}
                onClick={() => handleSettingChange('theme', theme.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{theme.name}</div>
                    <div className="text-sm text-green-300">
                      {theme.value === 'green' && 'Криптовалютная тема (по умолчанию)'}
                      {theme.value === 'blue' && 'Классическая синяя тема'}
                      {theme.value === 'purple' && 'Современная фиолетовая тема'}
                      {theme.value === 'dark' && 'Минималистичная темная тема'}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {theme.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language & Currency */}
        <div className="glass-card p-6 slide-in-right">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Язык и валюта</h2>
          </div>

          <div className="space-y-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-semibold text-green-200 mb-3">Язык интерфейса</label>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div
                    key={lang.value}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                      settings.language === lang.value
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-400/50'
                    }`}
                    onClick={() => handleSettingChange('language', lang.value)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-white font-medium">{lang.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-semibold text-green-200 mb-3">Основная валюта</label>
              <select
                value={settings.preferred_currency}
                onChange={(e) => handleSettingChange('preferred_currency', e.target.value)}
                className="form-select w-full"
              >
                {currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* AI & Notifications */}
        <div className="glass-card p-6 slide-in-right">
          <div className="flex items-center space-x-3 mb-6">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">ИИ и уведомления</h2>
          </div>

          <div className="space-y-6">
            {/* AI Predictions Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white mb-1">Автоматические ИИ прогнозы</div>
                <div className="text-sm text-green-300">
                  Получать автоматические прогнозы каждые 5 минут
                </div>
              </div>
              <div className="theme-switch">
                <input
                  type="checkbox"
                  checked={settings.auto_predictions_enabled}
                  onChange={(e) => handleSettingChange('auto_predictions_enabled', e.target.checked)}
                />
                <span className="theme-slider"></span>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white mb-1">Push уведомления</div>
                <div className="text-sm text-green-300">
                  Уведомления о новых прогнозах и результатах
                </div>
              </div>
              <div className="theme-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={(e) => handleSettingChange('notifications_enabled', e.target.checked)}
                />
                <span className="theme-slider"></span>
              </div>
            </div>

            {/* AI Learning Notice */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Bot className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-200 mb-1">Обучение ИИ</div>
                  <div className="text-sm text-green-300">
                    Наша система машинного обучения анализирует технические индикаторы, 
                    настроения рынка и исторические данные для создания точных прогнозов.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="glass-card p-6 slide-in-right">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Информация об аккаунте</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={user?.picture || '/default-avatar.png'}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-emerald-400"
              />
              <div>
                <div className="font-bold text-white text-lg">{user?.name}</div>
                <div className="text-green-300">{user?.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="ai-stat-card">
                <div className="text-2xl font-bold ai-gradient-text crypto-font">{user?.free_predictions || 0}</div>
                <div className="text-sm text-green-300">Бесплатных прогнозов</div>
              </div>
              
              <div className="ai-stat-card">
                <div className="text-2xl font-bold text-success crypto-font">{user?.total_predictions_used || 0}</div>
                <div className="text-sm text-green-300">Всего использовано</div>
              </div>
            </div>

            {/* Referral Code */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-green-200 mb-2">Ваш реферальный код</label>
              <div className="referral-code">
                {user?.referral_code || 'LOADING...'}
              </div>
              <div className="text-xs text-green-400 mt-2 text-center">
                Поделитесь кодом с друзьями и получайте бонусы
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;