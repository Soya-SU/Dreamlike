import React, { useState, useEffect } from 'react';
import { Language, UIContent } from '../types';
import { HISTORY_PIN } from '../constants';
import { Check, Shield, Lock, Save, X } from 'lucide-react';

interface SettingsViewProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  ui: UIContent;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentLang, onLanguageChange, ui }) => {
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDefaultPin, setIsDefaultPin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dream_pin');
    setIsDefaultPin(!stored);
  }, []);

  const handleSavePin = () => {
    const currentStoredPin = localStorage.getItem('dream_pin') || HISTORY_PIN;
    
    if (oldPin !== currentStoredPin) {
      setMessage(ui.pinError);
      setIsSuccess(false);
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setMessage(ui.pinLengthError);
      setIsSuccess(false);
      return;
    }

    localStorage.setItem('dream_pin', newPin);
    setMessage(ui.pinSaved);
    setIsSuccess(true);
    setIsDefaultPin(false);
    setOldPin('');
    setNewPin('');

    setTimeout(() => {
      setIsChangingPin(false);
      setMessage('');
    }, 1500);
  };

  return (
    <div className="animate-fade-in space-y-8 p-4 pb-24">
      <h2 className="text-3xl font-light mb-8">{ui.settingsTitle}</h2>
      
      {/* Language Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg text-white/80 mb-6 font-light">{ui.languageLabel}</h3>
        
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => onLanguageChange('zh')}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              currentLang === 'zh' 
                ? 'bg-purple-900/30 border-purple-500/50 text-white' 
                : 'bg-transparent border-white/10 text-white/40 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">中文 (Chinese)</span>
            {currentLang === 'zh' && <Check size={20} className="text-purple-400" />}
          </button>

          <button 
            onClick={() => onLanguageChange('en')}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              currentLang === 'en' 
                ? 'bg-purple-900/30 border-purple-500/50 text-white' 
                : 'bg-transparent border-white/10 text-white/40 hover:bg-white/5'
            }`}
          >
            <span className="text-lg">English</span>
            {currentLang === 'en' && <Check size={20} className="text-purple-400" />}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg text-white/80 mb-6 font-light flex items-center gap-2">
          <Shield size={18} className="text-purple-300" />
          {ui.pinSettingsTitle}
        </h3>

        {!isChangingPin ? (
          <button
            onClick={() => setIsChangingPin(true)}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 transition-colors flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            {ui.changePinBtn}
          </button>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <input
                type="password"
                maxLength={4}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder={ui.enterOldPin}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 placeholder:text-white/20"
              />
              {isDefaultPin && (
                <p className="text-xs text-white/30 px-1 pt-1">
                  {currentLang === 'zh' ? '默认密码: 1234' : 'Default PIN: 1234'}
                </p>
              )}
            </div>
            
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder={ui.enterNewPin}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 placeholder:text-white/20"
            />
            
            {message && (
              <p className={`text-xs ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setIsChangingPin(false); setMessage(''); setOldPin(''); setNewPin(''); }}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"
              >
                {ui.cancel}
              </button>
              <button
                onClick={handleSavePin}
                className="flex-1 py-2 rounded-lg bg-purple-600/50 hover:bg-purple-600/70 text-white text-sm transition-colors"
              >
                {ui.savePin}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-white/20 text-xs mt-12">
        <p>Dreamscape v2.1</p>
        <p className="mt-2">Zero-Cost & Fluid Design</p>
      </div>
    </div>
  );
};

export default SettingsView;