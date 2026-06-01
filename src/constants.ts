import { LabelStyle, GridConfig, TemplatePreset, LabelItem } from "./types";

export const FONT_OPTIONS = [
  { id: "font-sans", name: "Inter (Modern Sans)" },
  { id: "font-display", name: "Space Grotesk (Tech/Display)" },
  { id: "font-serif", name: "Playfair Display (Elegant Serif)" },
  { id: "font-mono", name: "JetBrains Mono (Console/Developer)" },
  { id: "font-montserrat", name: "Montserrat (Geometric Bold)" },
];

export const LOGO_OPTIONS = [
  { id: "star", name: "Star ✦" },
  { id: "diamond", name: "Diamond ⬥" },
  { id: "crown", name: "Crown 👑" },
  { id: "circle", name: "Circle ●" },
  { id: "none", name: "None" },
];

export const DEFAULT_STYLE: LabelStyle = {
  bgType: "color",
  bgColor: "#09090b", // Rich Zinc-950 black
  borderColor: "#27272a", // Zinc-800
  borderWidth: 1,
  borderRadius: 8,
  
  // Name
  nameColor: "#ffffff",
  nameFontSize: 24,
  nameFontFamily: "font-display", // Space Grotesk
  nameFontWeight: "font-bold",
  nameLetterSpacing: "tracking-widest",
  nameCase: "uppercase",
  nameYShift: 0,
  nameAlignment: "center",

  // Header Logo/Text
  showHeader: true,
  headerText: "ACCESS PASS",
  headerTextColor: "#ef4444", // Red indicators matching user upload
  headerFontSize: 11,
  logoType: "star",
  logoColor: "#ef4444",
  logoScale: 1.0,
  logoPosition: "left",
  nameStyleVariety: "standard",

  // Footer text
  showFooter: true,
  footerTextPattern: "index",
  footerCustomText: "VIP GUEST",
  footerColor: "#a1a1aa", // Zinc-400
  footerFontSize: 10,
  footerFontFamily: "font-mono",

  cardBackgroundOpacity: 100,
  fitToCard: true,
  exportDPI: 3, // Default 3x (Super HD 300+ DPI equivalent scale)
};

export const DEFAULT_GRID: GridConfig = {
  cols: 2,
  rows: 6,
  cardAspectRatio: "wide",
  cardWidth: 320,
  cardHeight: 96,
  gapX: 16,
  gapY: 16,
  paddingX: 20,
  paddingY: 16,
  sheetMarginTop: 24,
  sheetMarginLeft: 24,
};

export const PRESETS: TemplatePreset[] = [
  {
    id: "midnight-carbon",
    name: "Midnight Orange/Red (Matches Upload)",
    description: "Deep carbon black backing with red-orange accent headers and spaced uppercase typography.",
    style: {
      bgColor: "#09090b",
      borderColor: "#1e1e24",
      nameColor: "#ffffff",
      nameFontFamily: "font-display",
      nameLetterSpacing: "tracking-widest",
      nameCase: "uppercase",
      showHeader: true,
      headerText: "MEMBER ID",
      headerTextColor: "#f97316", // Orange
      logoType: "circle",
      logoColor: "#f97316",
      showFooter: true,
      footerColor: "#52525b",
      footerFontSize: 10,
    },
    grid: {
      cols: 2,
      rows: 6,
      cardWidth: 310,
      cardHeight: 92,
      gapX: 16,
      gapY: 14,
    }
  },
  {
    id: "minimalist-ivory",
    name: "Minimalist Ivory & Gold",
    description: "Serene light cream colorway with high-contrast serif font and elegant top border details.",
    style: {
      bgColor: "#fafaf9", // Stone-50 cream
      borderColor: "#e7e5e4",
      borderWidth: 1,
      nameColor: "#1c1917", // Stone-900
      nameFontFamily: "font-serif",
      nameFontWeight: "font-medium",
      nameLetterSpacing: "tracking-normal",
      nameCase: "none",
      showHeader: true,
      headerText: "INVITÈ SPECIAL",
      headerTextColor: "#b45309", // Warm amber
      logoType: "diamond",
      logoColor: "#b45309",
      showFooter: true,
      footerColor: "#78716c",
      footerFontSize: 11,
      footerFontFamily: "font-sans",
    },
    grid: {
      cols: 2,
      rows: 6,
      cardWidth: 310,
      cardHeight: 92,
    }
  },
  {
    id: "cyan-cyberpunk",
    name: "Terminal Blueprint",
    description: "Technical glowing developer theme with monospace lettering and subtle coordinate footers.",
    style: {
      bgColor: "#020617", // Slate-950
      borderColor: "#0ea5e9", // Sky-500
      borderWidth: 1,
      nameColor: "#38bdf8", // Sky-400
      nameFontFamily: "font-mono",
      nameLetterSpacing: "tracking-wider",
      nameCase: "uppercase",
      showHeader: true,
      headerText: "SYSTEM_NODE_OK",
      headerTextColor: "#06b6d4", // Cyan
      logoType: "star",
      logoColor: "#06b6d4",
      showFooter: true,
      footerColor: "#475569",
      footerFontSize: 9,
      footerFontFamily: "font-mono",
    },
    grid: {
      cols: 2,
      rows: 6,
      cardWidth: 310,
      cardHeight: 92,
    }
  },
  {
    id: "royal-gold",
    name: "Imperial Crest",
    description: "Deep luxurious midnight blue frame highlighting premium golden letter style and crown seals.",
    style: {
      bgColor: "#0f172a", // Slate-900
      borderColor: "#eab308", // Golden Yellow
      borderWidth: 2,
      nameColor: "#fef08a", // Yellow-200
      nameFontFamily: "font-montserrat",
      nameFontWeight: "font-extrabold",
      nameLetterSpacing: "tracking-widest",
      nameCase: "uppercase",
      showHeader: true,
      headerText: "EXCLUSIVE GUEST",
      headerTextColor: "#eab308",
      logoType: "crown",
      logoColor: "#eab308",
      showFooter: true,
      footerColor: "#94a3b8",
      footerFontSize: 10,
    },
    grid: {
      cols: 2,
      rows: 6,
    }
  }
];

export const SAMPLE_NAMES: string[] = [
  "Alexander Wright",
  "Sophia Loren",
  "Liam Vance",
  "Olivia Martinez",
  "Elijah Brooks",
  "Isabella Sterling",
  "Jameson Carter",
  "Mia Thorne",
  "Gabriel Thorne",
  "Charlotte Hayes",
  "Benjamin Fletcher",
  "Amelia Vance",
  "William Pierce",
  "Elena Rostova",
  "Lucas Sterling",
  "Victoria Thorne",
  "Zackary Thorne"
];
