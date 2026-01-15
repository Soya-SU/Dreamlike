import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Send, Music, Pause, Sparkles, MessageCircle, RefreshCcw, Cloud, Images, Sliders, Feather, BookOpen, BrainCircuit } from 'lucide-react';
import { AppView, DreamAnalysis, DreamRecord, ChatMessage, Language } from './types';
import { analyzeDream, generateDreamImage, chatWithDream } from './services/geminiService';
import { audioService } from './services/audioService';
import { UI_TEXT, ANXIETY_KEYWORDS } from './constants';
import Background from './components/Background';
import ParticleImage from './components/ParticleImage';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  // Global App State
  const [lang, setLang] = useState<Language>('zh');
  const [activeTab, setActiveTab] = useState<'dream' | 'gallery' | 'settings'>('dream');
  
  // Specific View State (within Tabs)
  const [dreamViewMode, setDreamViewMode] = useState<'input' | 'analysis'>('input');
  
  // Data State
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null); // New: Track active ID for persistence
  const [currentAnalysis, setCurrentAnalysis] = useState<DreamAnalysis | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [currentDreamText, setCurrentDreamText] = useState('');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  
  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Chat scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Derived UI Text
  const ui = UI_TEXT[lang];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  // Persist Chat History whenever it changes
  useEffect(() => {
    if (currentDreamId && chatHistory.length > 0) {
        const savedHistory = localStorage.getItem('dream_history');
        if (savedHistory) {
            const records: DreamRecord[] = JSON.parse(savedHistory);
            const updatedRecords = records.map(record => {
                if (record.id === currentDreamId) {
                    return { ...record, chatHistory: chatHistory };
                }
                return record;
            });
            localStorage.setItem('dream_history', JSON.stringify(updatedRecords));
        }
    }
  }, [chatHistory, currentDreamId]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    
    try {
      // 1. Text Analysis
      const result = await analyzeDream(input, lang);
      setCurrentAnalysis(result);
      setCurrentDreamText(input);

      // 2. Image Generation
      const imageUrl = await generateDreamImage(result.keywords);
      setCurrentImageUrl(imageUrl);
      
      const newId = uuidv4();
      setCurrentDreamId(newId);

      // 3. Save to History
      const newRecord: DreamRecord = {
        id: newId,
        date: Date.now(),
        content: input,
        analysis: result,
        imageUrl: imageUrl,
        chatHistory: [] // Initialize empty chat history
      };
      
      try {
        const existingHistory = JSON.parse(localStorage.getItem('dream_history') || '[]');
        localStorage.setItem('dream_history', JSON.stringify([newRecord, ...existingHistory]));
      } catch (e) {
        console.warn("Storage full, clearing old history to make space.");
        localStorage.setItem('dream_history', JSON.stringify([newRecord]));
      }

      setDreamViewMode('analysis');
      setInput('');
      setChatHistory([]);
    } catch (e) {
      console.error(e);
      alert("Error / 解析失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (record: DreamRecord) => {
    setCurrentDreamId(record.id);
    setCurrentAnalysis(record.analysis);
    setCurrentDreamText(record.content);
    
    // Restore chat history if exists
    setChatHistory(record.chatHistory || []);

    if (record.imageUrl) {
      setCurrentImageUrl(record.imageUrl);
    } else {
      const query = encodeURIComponent(record.analysis.keywords.join(' '));
      setCurrentImageUrl(`https://pollinations.ai/p/${query}?width=800&height=600&nologo=true`);
    }
    // Switch to dream tab and show analysis
    setActiveTab('dream');
    setDreamViewMode('analysis');
  };

  const toggleMusic = async () => {
    if (isPlayingMusic) {
      audioService.stop();
      setIsPlayingMusic(false);
    } else {
      await audioService.start();
      setIsPlayingMusic(true);
    }
  };

  const handleChatSend = async (text: string = chatInput) => {
    if (!text.trim()) return;
    
    // Check for anxiety/fear keywords
    const lowerText = text.toLowerCase();
    const isAnxious = ANXIETY_KEYWORDS.some(k => lowerText.includes(k));

    if (isAnxious && isPlayingMusic) {
        // Dim music for soothing effect
        audioService.setVolume(0.1, 2); 
    }

    const newUserMsg: ChatMessage = { role: 'user', text };
    setChatHistory(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const contextHistory = chatHistory.length === 0 
        ? [{ role: 'user' as const, text: `Context: Dream="${currentDreamText}". Analysis=${JSON.stringify(currentAnalysis)}.` }]
        : chatHistory.map(m => ({ role: m.role, text: m.text }));

      const response = await chatWithDream(contextHistory, text, lang, isAnxious);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'model', text: "..." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSuggestedQuestionClick = (question: string) => {
    // For suggested questions (user perspective), we treat it as the user asking
    handleChatSend(question);
  };

  return (
    <div className="relative min-h-screen text-gray-100 selection:bg-purple-500/30 pb-24">
      <Background />

      <main className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header Title */}
        <div className="pt-8 px-6 pb-2 text-center opacity-70">
          <h1 className="text-xl font-serif tracking-[0.3em] font-light text-white/90 drop-shadow-lg">{ui.title}</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col px-5">
          
          {/* --- TAB: DREAM --- */}
          {activeTab === 'dream' && (
            <>
              {dreamViewMode === 'input' && (
                <div className="flex-1 flex flex-col justify-center animate-fade-in space-y-8 mt-[-60px]">
                  
                  {/* Greeting Message */}
                  <div className="text-center opacity-80 mb-2">
                    <p className="text-sm font-light text-purple-200/80 tracking-widest animate-pulse duration-[3000ms]">
                        {ui.greeting}
                    </p>
                  </div>

                  <div className="space-y-3 text-center">
                    <h2 className="text-3xl font-light text-white/90 drop-shadow-sm tracking-wide">
                      {lang === 'zh' ? '昨夜，你梦见了什么？' : 'What did you dream?'}
                    </h2>
                    <p className="text-sm text-white/40 font-light tracking-wide">
                      {lang === 'zh' ? '梦是潜意识写给你的信。' : 'Dreams are letters from your subconscious.'}
                    </p>
                  </div>

                  <div className="relative group">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={ui.inputPlaceholder}
                      className="w-full h-56 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-lg placeholder:text-white/20 focus:outline-none focus:border-purple-500/30 focus:bg-white/10 transition-all resize-none no-scrollbar shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
                    />
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={!input.trim() || isLoading}
                    className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-500 border border-white/5 ${
                      input.trim() 
                        ? 'bg-purple-900/20 backdrop-blur-md hover:bg-purple-800/30 text-white shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] border-purple-500/20' 
                        : 'bg-white/5 text-white/20 cursor-not-allowed border-transparent'
                    }`}
                  >
                    {isLoading ? (
                      <RefreshCcw className="animate-spin text-purple-300" />
                    ) : (
                      <>
                        <Sparkles size={18} className={input.trim() ? "text-purple-300" : ""} />
                        <span className="font-light tracking-widest">{ui.analyzeBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {dreamViewMode === 'analysis' && currentAnalysis && (
                <div className="animate-fade-in pb-24 mt-4">
                  {/* Back to Input Button (Small) */}
                  <button 
                    onClick={() => setDreamViewMode('input')}
                    className="text-xs text-white/30 hover:text-white mb-4 flex items-center gap-1 transition-colors"
                  >
                     ← {lang === 'zh' ? '记录新梦境' : 'New Dream'}
                  </button>

                  <ParticleImage 
                    src={currentImageUrl} 
                    alt="Dream visualization" 
                  />

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-2 overflow-x-auto no-scrollbar mask-linear-fade">
                      {currentAnalysis.keywords.map((k, i) => (
                        <span key={i} className="px-3 py-1 text-xs border border-white/10 bg-white/5 backdrop-blur-sm rounded-full text-white/60 whitespace-nowrap">
                          {k}
                        </span>
                      ))}
                    </div>
                    <button onClick={toggleMusic} className="p-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all flex-shrink-0 ml-2 text-purple-200">
                      {isPlayingMusic ? <Pause size={16} /> : <Music size={16} />}
                    </button>
                  </div>

                  {/* 1. Psychological Analysis */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4 shadow-lg hover:border-purple-500/20 transition-colors">
                    <h3 className="text-sm uppercase tracking-widest text-purple-300/80 mb-4 flex items-center gap-2">
                      <BrainCircuit size={16} />
                      {ui.analysisTitle}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/80 text-justify font-light">
                      {currentAnalysis.psychological_analysis || currentAnalysis.analysis}
                    </p>
                  </div>

                   {/* 2. Zhou Gong Analysis (New) */}
                   {currentAnalysis.zhou_gong_analysis && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 shadow-lg hover:border-emerald-500/20 transition-colors">
                      <h3 className="text-sm uppercase tracking-widest text-emerald-300/80 mb-4 flex items-center gap-2">
                        <BookOpen size={16} />
                        {ui.zhouGongTitle}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/80 text-justify font-serif italic">
                        {currentAnalysis.zhou_gong_analysis}
                      </p>
                    </div>
                   )}

                  {/* Reality Check - Updated: Removed Label, cleaner style */}
                  <div className="bg-white/5 backdrop-blur-md border-y border-white/10 p-6 mb-8 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"></div>
                    <Feather className="w-4 h-4 text-white/20 mx-auto mb-3" />
                    <p className="text-sm font-light text-white/70 italic tracking-wide">
                      "{currentAnalysis.grounding}"
                    </p>
                  </div>

                  <div className="mt-8 border-t border-white/5 pt-6">
                    <h3 className="flex items-center gap-2 text-lg font-light mb-6 text-white/80">
                      <MessageCircle size={18} />
                      <span>{ui.chatTitle}</span>
                    </h3>

                    {/* Chat Area */}
                    <div className="space-y-4 mb-24">
                      {/* Render Suggested Questions first if chat is empty */}
                      {chatHistory.length === 0 && (
                        <div className="mb-8 animate-fade-in">
                          <p className="text-xs text-white/30 mb-3 ml-1">你可能想问：</p>
                          <div className="flex flex-col gap-2">
                            {currentAnalysis.suggested_questions.map((q, i) => (
                              <button
                                key={i}
                                onClick={() => handleSuggestedQuestionClick(q)}
                                className="text-left px-4 py-3 bg-white/5 hover:bg-purple-900/20 border border-white/10 hover:border-purple-500/30 rounded-xl text-sm text-purple-100/90 transition-all active:scale-[0.99]"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div 
                            className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-sm border ${
                              msg.role === 'user' 
                                ? 'bg-purple-900/20 border-purple-500/20 text-white rounded-br-none' 
                                : 'bg-white/5 border-white/10 text-white/90 rounded-bl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="fixed bottom-[72px] left-0 w-full p-4 bg-gradient-to-t from-[#0a0c16] via-[#0a0c16] to-transparent z-20 pointer-events-none">
                       <div className="max-w-md mx-auto flex items-center gap-2 bg-[#1a1a1a]/80 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 shadow-2xl pointer-events-auto ring-1 ring-white/5">
                        <input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                          placeholder={ui.chatInputPlaceholder}
                          className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1 placeholder:text-white/20"
                        />
                        <button 
                          onClick={() => handleChatSend()}
                          disabled={!chatInput.trim() || isChatLoading}
                          className="p-1.5 bg-white/10 rounded-full text-white/60 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-30"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </>
          )}

          {/* --- TAB: GALLERY --- */}
          {activeTab === 'gallery' && (
            <div className="mt-4">
               <HistoryView 
                 onBack={() => {}} 
                 onSelectDream={handleSelectHistory} 
               />
            </div>
          )}

          {/* --- TAB: SETTINGS --- */}
          {activeTab === 'settings' && (
            <SettingsView 
              currentLang={lang} 
              onLanguageChange={setLang} 
              ui={ui}
            />
          )}

        </div>
      </main>

      {/* FIXED BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#0a0c16]/80 backdrop-blur-xl border-t border-white/5 pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
          
          <button 
            onClick={() => setActiveTab('dream')}
            className={`flex flex-col items-center justify-center w-20 space-y-1 transition-all duration-300 ${
              activeTab === 'dream' ? 'text-purple-300 -translate-y-1 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'text-white/20 hover:text-white/40'
            }`}
          >
            <Cloud size={24} strokeWidth={activeTab === 'dream' ? 2 : 1.5} />
            <span className="text-[10px] font-medium tracking-wide">{ui.navDream}</span>
          </button>

          <button 
            onClick={() => setActiveTab('gallery')}
            className={`flex flex-col items-center justify-center w-20 space-y-1 transition-all duration-300 ${
              activeTab === 'gallery' ? 'text-purple-300 -translate-y-1 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'text-white/20 hover:text-white/40'
            }`}
          >
            <Images size={24} strokeWidth={activeTab === 'gallery' ? 2 : 1.5} />
            <span className="text-[10px] font-medium tracking-wide">{ui.navGallery}</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-20 space-y-1 transition-all duration-300 ${
              activeTab === 'settings' ? 'text-purple-300 -translate-y-1 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'text-white/20 hover:text-white/40'
            }`}
          >
            <Sliders size={24} strokeWidth={activeTab === 'settings' ? 2 : 1.5} />
            <span className="text-[10px] font-medium tracking-wide">{ui.navSettings}</span>
          </button>

        </div>
      </nav>
    </div>
  );
};

export default App;
