import React, { useState, useEffect } from 'react';
import { DreamRecord } from '../types';
import { HISTORY_PIN } from '../constants';
import { Lock, Calendar, Trash2 } from 'lucide-react';

interface HistoryViewProps {
  onBack: () => void;
  onSelectDream: (dream: DreamRecord) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onBack, onSelectDream }) => {
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [records, setRecords] = useState<DreamRecord[]>([]);
  const [currentPin, setCurrentPin] = useState(HISTORY_PIN);

  useEffect(() => {
    // Load records
    const saved = localStorage.getItem('dream_history');
    if (saved) {
      setRecords(JSON.parse(saved));
    }

    // Load custom PIN if exists
    const storedPin = localStorage.getItem('dream_pin');
    if (storedPin) {
      setCurrentPin(storedPin);
    }
  }, []);

  const handlePinSubmit = () => {
    if (pin === currentPin) {
      setLocked(false);
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  const deleteRecord = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Using a simple window.confirm, ideally use UI text
    if (confirm("Delete this dream?")) {
        const newRecords = records.filter(r => r.id !== id);
        setRecords(newRecords);
        localStorage.setItem('dream_history', JSON.stringify(newRecords));
    }
  };

  if (locked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-fade-in">
        <div className="p-5 bg-white/5 rounded-full backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <Lock size={28} className="text-purple-300/80" />
        </div>
        <div className="flex flex-col items-center space-y-5">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-28 text-center bg-transparent border-b border-white/10 text-xl tracking-[0.5em] py-2 focus:outline-none focus:border-purple-400/50 transition-all placeholder:text-white/10"
          />
          {error && <p className="text-red-400/80 text-xs tracking-wide">Error</p>}
          <button
            onClick={handlePinSubmit}
            className="px-8 py-2 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/20 rounded-full text-xs text-purple-200/80 backdrop-blur-sm transition-all shadow-[0_0_10px_rgba(168,85,247,0.1)]"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 animate-fade-in">
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center text-white/20 py-16 text-sm font-light tracking-wide">Empty...</div>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              onClick={() => onSelectDream(record)}
              className="bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/5 hover:border-purple-500/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 group relative shadow-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono text-purple-300/60 flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar size={10} />
                  {new Date(record.date).toLocaleDateString()}
                </span>
                <button 
                    onClick={(e) => deleteRecord(e, record.id)}
                    className="text-white/10 hover:text-red-400/70 transition-colors p-1"
                >
                    <Trash2 size={14} />
                </button>
              </div>
              <p className="text-white/80 line-clamp-2 text-sm font-light mb-4 leading-relaxed">
                {record.content}
              </p>
              <div className="flex gap-2 flex-wrap">
                {record.analysis.keywords.map((k, i) => (
                  <span key={i} className="text-[10px] px-2.5 py-1 bg-black/20 border border-white/5 rounded-full text-white/40">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;
