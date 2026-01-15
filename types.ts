export interface DreamAnalysis {
  keywords: string[];
  psychological_analysis: string; // Renamed/New: Psychological perspective
  zhou_gong_analysis: string;     // New: Traditional interpretation
  grounding: string;
  music_mood: string;
  suggested_questions: string[];
  // Legacy compatibility
  analysis?: string;
}

export interface DreamRecord {
  id: string;
  date: number;
  content: string;
  analysis: DreamAnalysis;
  imageUrl?: string;
  chatHistory?: ChatMessage[]; // New: Persist chat history
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppView {
  INPUT = 'INPUT',
  ANALYSIS = 'ANALYSIS',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS'
}

export type Language = 'zh' | 'en';

export interface UIContent {
  greeting: string; // New greeting text
  title: string;
  inputPlaceholder: string;
  analyzeBtn: string;
  analyzing: string;
  analysisTitle: string; // General title or Psychological
  zhouGongTitle: string; // New title
  realityCheck: string;
  chatTitle: string;
  chatInputPlaceholder: string;
  navDream: string;
  navGallery: string;
  navSettings: string;
  historyTitle: string;
  emptyHistory: string;
  settingsTitle: string;
  languageLabel: string;
  deleteConfirm: string;
  // PIN Settings
  pinSettingsTitle: string;
  changePinBtn: string;
  enterOldPin: string;
  enterNewPin: string;
  savePin: string;
  pinSaved: string;
  pinError: string;
  pinLengthError: string;
  cancel: string;
}
