export interface LabelStyle {
  bgType: "color" | "uploaded"; // Whether using solid color or uploaded background image per card
  bgColor: string;             // Hex code (default dark rich black/charcoal)
  borderColor: string;         // Box border color if any
  borderWidth: number;         // Border width in pixels
  borderRadius: number;        // Border radius in pixels
  
  // Name (Main text) formatting
  nameColor: string;
  nameFontSize: number;
  nameFontFamily: string;
  nameFontWeight: string;      // e.g. "font-bold", "font-medium"
  nameLetterSpacing: string;   // e.g. "tracking-widest", "tracking-normal"
  nameCase: "uppercase" | "none" | "lowercase";
  nameAlignment: "left" | "center" | "right";
  nameYShift: number;          // Vertical offset in percentage/pixels
  
  // Accent Logo / Top Header
  showHeader: boolean;
  headerText: string;          // Small text e.g., "TEAM MEMBER", "VVIP"
  headerTextColor: string;
  headerFontSize: number;
  logoType: "star" | "diamond" | "crown" | "circle" | "none";
  logoColor: string;
  logoScale?: number;          // Size scale multiplier of logo (0.5 to 3.0, default 1.0)
  logoPosition?: "left" | "right" | "both"; // Logo placement relative to name
  nameStyleVariety?: "standard" | "stylish" | "neon-glow" | "gold-foil" | "vintage-shadow" | "modern-outline" | "underlined"; // Decorative styles for the name text
  
  // Footer / Subtitle / ID Formatting
  showFooter: boolean;
  footerTextPattern: "index" | "custom" | "none"; // e.g., "ID-001" or a column from Excel
  footerCustomText: string;
  footerColor: string;
  footerFontSize: number;
  footerFontFamily: string;
  
  // Backdrop image behavior (if template uploaded)
  cardBackgroundOpacity: number;
  fitToCard: boolean;
  exportDPI: number;
}

export interface GridConfig {
  cols: number;                // e.g., 2 cols (like the user's image)
  rows: number;                // e.g., 6 rows (giving 12 items per sheet)
  cardAspectRatio: "custom" | "standard-label" | "badge" | "business-card" | "wide";
  cardWidth: number;           // width in mm or px
  cardHeight: number;          // height in mm or px
  gapX: number;                // column gap in px
  gapY: number;                // row gap in px
  paddingX: number;            // horizontal label padding
  paddingY: number;            // vertical label padding
  sheetMarginTop: number;      // printer offset/margin
  sheetMarginLeft: number;
}

export interface LabelItem {
  id: string;
  name: string;
  subtitle?: string;           // Optional secondary info (like Department, Role, Ticket Class)
  extraCode?: string;         // E.g., unique serial number generated
  customLogoType?: "star" | "diamond" | "crown" | "circle" | "heart" | "shield" | "flame" | "image" | "none";
  customLogoUrl?: string;     // Data URI of a specific individual uploaded logo
  customLogoScale?: number;   // Specific individual logo scale multiplier (0.5 to 3.0, default 1.0)
  customLogoPosition?: "left" | "right" | "both";
  customNameStyleVariety?: "standard" | "stylish" | "neon-glow" | "gold-foil" | "vintage-shadow" | "modern-outline" | "underlined";
}

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  style: Partial<LabelStyle>;
  grid: Partial<GridConfig>;
}
