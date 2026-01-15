import { UIContent, Language } from './types';

// MOCK MODE TOGGLE
export const MOCK_MODE = false;

// Default PIN for History Access
export const HISTORY_PIN = "1234";

// Anxiety Keywords for Emotional Trigger
export const ANXIETY_KEYWORDS = [
  '害怕', '恐惧', '噩梦', '恐怖', '焦虑', '发抖', '吓', '救命', '不安', '紧张', '压抑', '窒息',
  'scared', 'fear', 'nightmare', 'terrified', 'anxious', 'panic', 'help', 'horror', 'stress'
];

export const UI_TEXT: Record<Language, UIContent> = {
  zh: {
    greeting: "醒啦？趁着还没忘，快把梦告诉我吧。",
    title: "DREAMSCAPE",
    inputPlaceholder: "描述你的梦境...",
    analyzeBtn: "开始解析",
    analyzing: "解析中...",
    analysisTitle: "心理学深度解析",
    zhouGongTitle: "周公解梦",
    realityCheck: "现实锚定",
    chatTitle: "梦境对话",
    chatInputPlaceholder: "和你的潜意识聊聊...",
    navDream: "梦境",
    navGallery: "回廊",
    navSettings: "设计",
    historyTitle: "梦境回廊",
    emptyHistory: "这里还是一片空白...",
    settingsTitle: "偏好设置",
    languageLabel: "语言 / Language",
    deleteConfirm: "确定要遗忘这个梦吗？",
    pinSettingsTitle: "安全设置",
    changePinBtn: "修改回廊密码",
    enterOldPin: "输入旧密码",
    enterNewPin: "输入新密码 (4位数字)",
    savePin: "保存",
    pinSaved: "密码已修改",
    pinError: "旧密码错误",
    pinLengthError: "密码必须是4位数字",
    cancel: "取消"
  },
  en: {
    greeting: "Awake? Tell me your dream before it fades.",
    title: "DREAMSCAPE",
    inputPlaceholder: "Describe your dream...",
    analyzeBtn: "Analyze Dream",
    analyzing: "Dreaming...",
    analysisTitle: "Psychological Analysis",
    zhouGongTitle: "Traditional Interpretation",
    realityCheck: "Reality Check",
    chatTitle: "Dream Chat",
    chatInputPlaceholder: "Talk to your subconscious...",
    navDream: "Dream",
    navGallery: "Gallery",
    navSettings: "Design",
    historyTitle: "Dream Gallery",
    emptyHistory: "It is still empty here...",
    settingsTitle: "Preferences",
    languageLabel: "Language / 语言",
    deleteConfirm: "Do you want to forget this dream?",
    pinSettingsTitle: "Security",
    changePinBtn: "Change Gallery PIN",
    enterOldPin: "Enter Old PIN",
    enterNewPin: "Enter New PIN (4 digits)",
    savePin: "Save",
    pinSaved: "PIN Updated",
    pinError: "Incorrect Old PIN",
    pinLengthError: "PIN must be 4 digits",
    cancel: "Cancel"
  }
};

export const MOCK_ANALYSIS_RESPONSE = JSON.stringify({
  keywords: ["Forest", "Flying", "Mist"],
  psychological_analysis: "梦见在迷雾森林中飞翔，从心理学角度看，这代表了潜意识中对超越现状的渴望。森林通常象征着无意识的未知领域，迷雾则代表生活中的不确定性或心理上的困惑。飞翔的行为表明你拥有强大的心理韧性，试图以一种更高的视角（超我）来审视当前的问题，寻找摆脱束缚的出口。",
  zhou_gong_analysis: "【大吉】梦身飞入林中，主百事顺利。云雾缭绕虽有小碍，但飞升之势主贵人相助。此梦预示近期虽有迷茫，但终将拨云见日，名利双收。",
  grounding: "生活就像这场飞行，虽然偶尔有雾，但方向盘始终在你手里。",
  music_mood: "Ethereal Ambient",
  suggested_questions: [
    "这片森林在我的潜意识里具体代表什么？",
    "飞翔的感觉是否暗示我正在逃避某些现实压力？",
    "梦里的迷雾是否预示着我最近的某个决定？"
  ]
});

// Gemini Model Configuration
export const GEMINI_MODEL = "gemini-3-flash-preview";
export const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
