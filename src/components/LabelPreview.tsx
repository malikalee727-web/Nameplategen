import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { 
  ChevronLeft, ChevronRight, Printer, Download, Eye, 
  HelpCircle, Sparkles, Check, Edit2, CheckSquare 
} from "lucide-react";
import { LabelStyle, GridConfig, LabelItem } from "../types";

// Helper to dynamically calculate fit font size
const calculateFitFontSize = (
  text: string,
  maxWidth: number,
  fontFamily: string,
  fontWeight: string,
  baseFontSize: number
): number => {
  if (typeof window === "undefined" || !text) return baseFontSize;
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return baseFontSize;

    const fontName = fontFamily === "font-sans" ? "Inter" : 
                     fontFamily === "font-display" ? "Space Grotesk" :
                     fontFamily === "font-serif" ? "Playfair Display" :
                     fontFamily === "font-mono" ? "JetBrains Mono" : "Montserrat";

    let weight = "normal";
    if (fontWeight === "font-bold") weight = "bold";
    else if (fontWeight === "font-semibold") weight = "600";
    else if (fontWeight === "font-extrabold") weight = "800";

    ctx.font = `${weight} ${baseFontSize}px ${fontName}, sans-serif`;
    
    // Check if it fits instantly
    let currentWidth = ctx.measureText(text).width;
    if (currentWidth <= maxWidth) {
      return baseFontSize;
    }

    // Binary search shrink for maximum readable size that fits
    let low = 8;
    let high = baseFontSize;
    let optimal = baseFontSize;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      ctx.font = `${weight} ${mid}px ${fontName}, sans-serif`;
      const width = ctx.measureText(text).width;

      if (width <= maxWidth) {
        optimal = mid;
        low = mid + 1; // Try slightly larger
      } else {
        high = mid - 1; // Need smaller
      }
    }

    return optimal;
  } catch (error) {
    const estCharWidth = baseFontSize * 0.55;
    const estTotalWidth = text.length * estCharWidth;
    if (estTotalWidth > maxWidth) {
      const ratio = maxWidth / estTotalWidth;
      return Math.max(8, Math.floor(baseFontSize * ratio));
    }
    return baseFontSize;
  }
};

interface LabelPreviewProps {
  items: LabelItem[];
  style: LabelStyle;
  grid: GridConfig;
  bgImagePattern: string | null;
  bgSheetBackdrop: string | null;
  sheetOverlayMode: boolean;
  onUpdateName: (
    id: string, 
    newName: string, 
    newSubtitle?: string, 
    newExtra?: string, 
    newLogoType?: "star" | "diamond" | "crown" | "circle" | "heart" | "shield" | "flame" | "image" | "none",
    newLogoUrl?: string,
    newLogoScale?: number,
    newLogoPosition?: "left" | "right" | "both",
    newNameStyleVariety?: "standard" | "stylish" | "neon-glow" | "gold-foil" | "vintage-shadow" | "modern-outline" | "underlined"
  ) => void;
}

export default function LabelPreview({
  items,
  style,
  grid,
  bgImagePattern,
  bgSheetBackdrop,
  sheetOverlayMode,
  onUpdateName,
}: LabelPreviewProps) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editNameField, setEditNameField] = useState("");
  const [editSubField, setEditSubField] = useState("");
  const [editExtraField, setEditExtraField] = useState("");
  const [editLogoType, setEditLogoType] = useState<"star" | "diamond" | "crown" | "circle" | "heart" | "shield" | "flame" | "image" | "none">("none");
  const [editLogoUrl, setEditLogoUrl] = useState<string>("");
  const [editLogoScale, setEditLogoScale] = useState<number>(1.0);
  const [editLogoPosition, setEditLogoPosition] = useState<"left" | "right" | "both">("left");
  const [editNameStyleVariety, setEditNameStyleVariety] = useState<"standard" | "stylish" | "neon-glow" | "gold-foil" | "vintage-shadow" | "modern-outline" | "underlined">("standard");
  const [isDownloading, setIsDownloading] = useState(false);

  // Divide items based on sheet settings
  const itemsPerPage = grid.cols * grid.rows;
  const pageCount = Math.max(1, Math.ceil(items.length / itemsPerPage));
  
  // Ensure we don't end up on a non-existent page after clearing items
  React.useEffect(() => {
    if (activePageIndex >= pageCount) {
      setActivePageIndex(0);
    }
  }, [pageCount, activePageIndex]);

  // Extract items for current page active index
  const getPageItems = (pageIdx: number): (LabelItem | null)[] => {
    const startIdx = pageIdx * itemsPerPage;
    const pageSlice: (LabelItem | null)[] = [];
    
    for (let i = 0; i < itemsPerPage; i++) {
      const actualItem = items[startIdx + i];
      pageSlice.push(actualItem || null); // Put null for empty grid items
    }
    
    return pageSlice;
  };

  const currentPageItems = getPageItems(activePageIndex);

  // Render the logo based on configuration or item's custom logo
  const renderItemLogo = (item: LabelItem | null, size: number) => {
    const fillCol = style.logoColor;
    const logoType = item?.customLogoType && item.customLogoType !== "none" ? item.customLogoType : "none";
    
    const itemLogoScale = item?.customLogoScale !== undefined ? item.customLogoScale : 1.0;
    const globalLogoScale = style.logoScale !== undefined ? style.logoScale : 1.0;
    const scaledSize = size * itemLogoScale * globalLogoScale;

    switch (logoType) {
      case "star":
        return (
          <svg width={scaledSize} height={scaledSize} viewBox="0 0 24 24" fill={fillCol} className="inline-block shrink-0">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      case "diamond":
        return (
          <svg width={scaledSize} height={scaledSize} viewBox="0 0 24 24" fill={fillCol} className="inline-block shrink-0">
            <path d="M12 2L2 12l10 10 10-10L12 2z" />
          </svg>
        );
      case "crown":
        return (
          <svg width={scaledSize} height={scaledSize} viewBox="0 0 24 24" fill={fillCol} className="inline-block shrink-0">
            <path d="M22 2H2v4h20V2z M2 8l4 6h12l4-6H2z M12 14v8M9 22h6" stroke={fillCol} strokeWidth="1" />
          </svg>
        );
      case "circle":
        return (
          <svg width={scaledSize} height={scaledSize} viewBox="0 0 24 24" fill={fillCol} className="inline-block shrink-0">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case "heart":
        return (
          <svg width={scaledSize} height={scaledSize} viewBox="0 0 24 24" fill={fillCol} className="inline-block shrink-0">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        );
      case "shield":
        return (
          <svg width={scaledSize} height={scaledSize} viewBox="0 0 24 24" fill={fillCol} className="inline-block shrink-0">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
          </svg>
        );
      case "flame":
        return (
          <svg width={scaledSize} height={scaledSize} viewBox="0 0 24 24" fill={fillCol} className="inline-block shrink-0">
            <path d="M12 2.69c.05 1.01-.13 1.95-.51 2.86C10.15 8.76 7.4 10.4 7.4 14.4c0 2.54 2.06 4.6 4.6 4.6s4.6-2.06 4.6-4.6c0-3.58-2.5-6.68-4.6-11.71zM11.5 20c-3.03 0-5.5-2.47-5.5-5.5 0-3.37 2.4-5.23 4.14-8.08.31-.51.46-1.11.41-1.74-.08 1.13.25 2.14.98 3.01C13.68 10.32 17 12.4 17 14.5c0 3.03-2.47 5.5-5.5 5.5z"/>
          </svg>
        );
      case "image":
        if (item?.customLogoUrl) {
          return (
            <img 
              src={item.customLogoUrl} 
              style={{ width: `${scaledSize}px`, height: `${scaledSize}px` }} 
              className="inline-block shrink-0 rounded-sm object-contain" 
              referrerPolicy="no-referrer" 
              alt="logo" 
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  // Click to edit specific card in preview
  const startEditing = (item: LabelItem) => {
    setEditingItemId(item.id);
    setEditNameField(item.name);
    setEditSubField(item.subtitle || "");
    setEditExtraField(item.extraCode || "");
    setEditLogoType(item.customLogoType || "none");
    setEditLogoUrl(item.customLogoUrl || "");
    setEditLogoScale(item.customLogoScale || 1.0);
    setEditLogoPosition(item.customLogoPosition || "left");
    setEditNameStyleVariety(item.customNameStyleVariety || "standard");
  };

  const saveEditing = () => {
    if (editingItemId) {
      onUpdateName(
        editingItemId, 
        editNameField.trim(), 
        editSubField.trim(), 
        editExtraField.trim(), 
        editLogoType, 
        editLogoUrl, 
        editLogoScale,
        editLogoPosition,
        editNameStyleVariety
      );
      setEditingItemId(null);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditLogoUrl(event.target.result as string);
          setEditLogoType("image");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Full print trigger
  const triggerPrint = () => {
    window.print();
  };

  // Helper to draw the logo on Canvas context
  const drawCanvasLogo = async (
    ctx: CanvasRenderingContext2D,
    type: string,
    url: string | undefined,
    x: number,
    y: number,
    size: number,
    color: string
  ) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    if (type === "star") {
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y);
      ctx.quadraticCurveTo(x + size / 2, y + size / 2, x + size, y + size / 2);
      ctx.quadraticCurveTo(x + size / 2, y + size / 2, x + size / 2, y + size);
      ctx.quadraticCurveTo(x + size / 2, y + size / 2, x, y + size / 2);
      ctx.quadraticCurveTo(x + size / 2, y + size / 2, x + size / 2, y);
      ctx.fill();
    } else if (type === "diamond") {
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y);
      ctx.lineTo(x + size, y + size / 2);
      ctx.lineTo(x + size / 2, y + size);
      ctx.lineTo(x, y + size / 2);
      ctx.closePath();
      ctx.fill();
    } else if (type === "crown") {
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.8);
      ctx.lineTo(x + size, y + size * 0.8);
      ctx.lineTo(x + size * 0.9, y + size * 0.3);
      ctx.lineTo(x + size * 0.7, y + size * 0.6);
      ctx.lineTo(x + size * 0.5, y + size * 0.2);
      ctx.lineTo(x + size * 0.3, y + size * 0.6);
      ctx.lineTo(x + size * 0.1, y + size * 0.3);
      ctx.closePath();
      ctx.fill();
    } else if (type === "circle") {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "heart") {
      ctx.beginPath();
      const d = size;
      ctx.moveTo(x + d / 2, y + d / 5);
      ctx.bezierCurveTo(x + d / 2, y, x, y, x, y + d * 0.6);
      ctx.bezierCurveTo(x, y + d, x + d / 2, y + d, x + d / 2, y + d);
      ctx.bezierCurveTo(x + d / 2, y + d, x + d, y + d, x + d, y + d * 0.6);
      ctx.bezierCurveTo(x + d, y, x + d / 2, y, x + d / 2, y + d / 5);
      ctx.fill();
    } else if (type === "shield") {
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y);
      ctx.quadraticCurveTo(x + size, y + size * 0.1, x + size, y + size * 0.4);
      ctx.quadraticCurveTo(x + size, y + size * 0.85, x + size / 2, y + size);
      ctx.quadraticCurveTo(x, y + size * 0.85, x, y + size * 0.4);
      ctx.quadraticCurveTo(x, y + size * 0.1, x + size / 2, y);
      ctx.closePath();
      ctx.fill();
    } else if (type === "flame") {
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y + size);
      ctx.bezierCurveTo(x + size * 0.9, y + size, x + size, y + size * 0.6, x + size * 0.8, y + size * 0.3);
      ctx.bezierCurveTo(x + size * 0.6, y, x + size / 2, y, x + size / 2, y);
      ctx.bezierCurveTo(x + size * 0.3, y + size * 0.3, x, y + size * 0.5, x, y + size * 0.7);
      ctx.bezierCurveTo(x, y + size, x + size * 0.1, y + size, x + size / 2, y + size);
      ctx.closePath();
      ctx.fill();
    } else if (type === "image" && url) {
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = url;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        ctx.drawImage(logoImg, x, y, size, size);
      } catch (err) {
        console.error("Error drawing logo image on canvas:", err);
      }
    }
    ctx.restore();
  };

  // Compile a high-resolution canvas for a specific page slot
  const generatePageCanvas = async (pageIdx: number): Promise<HTMLCanvasElement> => {
    // Create a high resolution offscreen canvas
    const canvas = document.createElement("canvas");
    // Scale coordinates for crisp, high definition (HD) images
    const scale = style.exportDPI || 3; 
    
    const cardW = grid.cardWidth;
    const cardH = grid.cardHeight;
    const gapX = grid.gapX;
    const gapY = grid.gapY;
    const cols = grid.cols;
    const rows = grid.rows;
    const marginL = grid.sheetMarginLeft;
    const marginT = grid.sheetMarginTop;

    const totalWidth = marginL * 2 + cols * cardW + (cols - 1) * gapX;
    const totalHeight = marginT * 2 + rows * cardH + (rows - 1) * gapY;

    canvas.width = totalWidth * scale;
    canvas.height = totalHeight * scale;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) throw new Error("Could not create canvas context");
    ctx.scale(scale, scale);

    // 1. Draw Page Background
    if (sheetOverlayMode && bgSheetBackdrop) {
      // Render sheet backdrop first
      const backdropImg = new Image();
      backdropImg.crossOrigin = "anonymous";
      backdropImg.src = bgSheetBackdrop;
      await new Promise((resolve) => {
        backdropImg.onload = resolve;
        backdropImg.onerror = resolve; // Continue even if backdrop fails
      });
      ctx.drawImage(backdropImg, 0, 0, totalWidth, totalHeight);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, totalWidth, totalHeight);
    }

    // 2. Draw Cards
    const pageItems = getPageItems(pageIdx);
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const item = pageItems[index];
        const x = marginL + c * (cardW + gapX);
        const y = marginT + r * (cardH + gapY);

        // Card Background
        if (!sheetOverlayMode) {
          ctx.fillStyle = style.bgColor;
          
          // Draw rounded rectangle
          ctx.beginPath();
          ctx.roundRect(x, y, cardW, cardH, style.borderRadius);
          ctx.fill();

          // Custom Single Backdrop Image Tile
          if (style.bgType === "uploaded" && bgImagePattern) {
            const bgImg = new Image();
            bgImg.crossOrigin = "anonymous";
            bgImg.src = bgImagePattern;
            await new Promise((resolve) => {
              bgImg.onload = resolve;
              bgImg.onerror = resolve;
            });
            ctx.save();
            ctx.globalAlpha = style.cardBackgroundOpacity / 100;
            // Clip boundary to keep border radius
            ctx.beginPath();
            ctx.roundRect(x, y, cardW, cardH, style.borderRadius);
            ctx.clip();
            ctx.drawImage(bgImg, x, y, cardW, cardH);
            ctx.restore();
          }

          // Draw Border
          if (style.borderWidth > 0) {
            ctx.lineWidth = style.borderWidth;
            ctx.strokeStyle = style.borderColor;
            ctx.beginPath();
            ctx.roundRect(x, y, cardW, cardH, style.borderRadius);
            ctx.stroke();
          }
        }

        // Draw Text Contents if item exists
        if (item) {
          const fontName = style.nameFontFamily === "font-sans" ? "Inter" : 
                           style.nameFontFamily === "font-display" ? "Space Grotesk" :
                           style.nameFontFamily === "font-serif" ? "Playfair Display" :
                           style.nameFontFamily === "font-mono" ? "JetBrains Mono" : "Montserrat";

          // Draw header (small access status message) - sleek, neat top header text
          if (style.showHeader) {
            ctx.fillStyle = style.headerTextColor;
            ctx.font = `600 ${style.headerFontSize}px ${fontName}, sans-serif`;
            
            const hText = style.headerText || "VISITORPASS";
            const headerY = y + grid.paddingY + style.headerFontSize / 2;
            
            ctx.textAlign = style.nameAlignment === "left" ? "left" : style.nameAlignment === "right" ? "right" : "center";
            const headerX = style.nameAlignment === "left" ? x + grid.paddingX : style.nameAlignment === "right" ? x + cardW - grid.paddingX : x + cardW / 2;
            
            ctx.fillText(hText, headerX, headerY);
          }

          // Draw Main Name Text with adjacent logo pasted right before the name
          ctx.fillStyle = style.nameColor;
          let weightPrefix = "normal";
          if (style.nameFontWeight === "font-bold") weightPrefix = "bold";
          else if (style.nameFontWeight === "font-semibold") weightPrefix = "600";
          else if (style.nameFontWeight === "font-extrabold") weightPrefix = "800";
          
          let displayName = item.name;
          if (style.nameCase === "uppercase") displayName = displayName.toUpperCase();
          else if (style.nameCase === "lowercase") displayName = displayName.toLowerCase();

          const logoType = item.customLogoType && item.customLogoType !== "none" ? item.customLogoType : "none";
          const logoUrl = logoType === "image" ? item.customLogoUrl : undefined;
          const hasLogo = logoType !== "none";

          const itemLogoScale = item.customLogoScale !== undefined ? item.customLogoScale : 1.0;
          const globalLogoScale = style.logoScale !== undefined ? style.logoScale : 1.0;
          const itemLogoPosition = item.customLogoPosition || style.logoPosition || "left";
          const itemNameStyleVariety = item.customNameStyleVariety || style.nameStyleVariety || "standard";

          let canvasFontSize = style.nameFontSize;
          const logoPaddingMultiplier = hasLogo ? (itemLogoPosition === "both" ? 2 : 1) : 0;
          
          if (style.fitToCard) {
            const maxAllowedWidth = cardW - grid.paddingX * 2;
            const logoPadding = hasLogo ? (canvasFontSize * 1.0 * itemLogoScale * globalLogoScale * logoPaddingMultiplier + (itemLogoPosition === "both" ? 16 : 8)) : 0;
            canvasFontSize = calculateFitFontSize(displayName, maxAllowedWidth - logoPadding, itemNameStyleVariety === "stylish" ? "font-serif" : style.nameFontFamily, style.nameFontWeight, style.nameFontSize);
          }
          
          const activeFontFamily = itemNameStyleVariety === "stylish" ? "Playfair Display" : fontName;
          const fontStyleModifier = itemNameStyleVariety === "stylish" ? "italic " : "";
          
          ctx.font = `${fontStyleModifier}${weightPrefix} ${canvasFontSize}px ${activeFontFamily}, sans-serif`;
          ctx.textBaseline = "middle";

          const textWidth = ctx.measureText(displayName).width;
          const logoSize = canvasFontSize * 0.95 * itemLogoScale * globalLogoScale;
          const logoGap = 8;
          
          // Calculate overall alignment width
          const totalWidth = hasLogo 
            ? (itemLogoPosition === "both" 
                ? (logoSize * 2 + logoGap * 2 + textWidth) 
                : (logoSize + logoGap + textWidth))
            : textWidth;

          let startX = x + (cardW - totalWidth) / 2; // default center
          if (style.nameAlignment === "left") {
            startX = x + grid.paddingX;
          } else if (style.nameAlignment === "right") {
            startX = x + cardW - grid.paddingX - totalWidth;
          }

          const nameCenterY = y + cardH / 2 + style.nameYShift;
          const logoY = nameCenterY - logoSize / 2;

          // Helper method to draw Name with Style Varieties on Canvas
          const renderCanvasNameText = (textX: number, textY: number) => {
            ctx.save();
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = `${fontStyleModifier}${weightPrefix} ${canvasFontSize}px ${activeFontFamily}, sans-serif`;

            if (itemNameStyleVariety === "standard" || itemNameStyleVariety === "stylish") {
              ctx.fillStyle = style.nameColor;
              ctx.fillText(displayName, textX, textY);
            } else if (itemNameStyleVariety === "neon-glow") {
              ctx.shadowColor = style.logoColor || style.nameColor || "#ffffff";
              ctx.shadowBlur = 12 * globalLogoScale;
              ctx.fillStyle = style.nameColor;
              ctx.fillText(displayName, textX, textY);
              ctx.shadowBlur = 4 * globalLogoScale;
              ctx.fillText(displayName, textX, textY);
            } else if (itemNameStyleVariety === "gold-foil") {
              const grad = ctx.createLinearGradient(textX, textY - canvasFontSize/2, textX + textWidth, textY + canvasFontSize/2);
              grad.addColorStop(0, '#bf953f');
              grad.addColorStop(0.25, '#fcf6ba');
              grad.addColorStop(0.5, '#b38728');
              grad.addColorStop(0.75, '#fbf5b7');
              grad.addColorStop(1, '#aa771c');
              ctx.fillStyle = grad;
              ctx.fillText(displayName, textX, textY);
            } else if (itemNameStyleVariety === "vintage-shadow") {
              ctx.fillStyle = "rgba(0,0,0,0.65)";
              ctx.fillText(displayName, textX + 3, textY + 3);
              ctx.fillStyle = style.nameColor;
              ctx.fillText(displayName, textX, textY);
            } else if (itemNameStyleVariety === "modern-outline") {
              ctx.strokeStyle = style.nameColor;
              ctx.lineWidth = 1.5;
              ctx.strokeText(displayName, textX, textY);
            } else if (itemNameStyleVariety === "underlined") {
              ctx.fillStyle = style.nameColor;
              ctx.fillText(displayName, textX, textY);
              ctx.beginPath();
              ctx.strokeStyle = style.nameColor;
              ctx.lineWidth = 2;
              ctx.moveTo(textX, textY + canvasFontSize * 0.55);
              ctx.lineTo(textX + textWidth, textY + canvasFontSize * 0.55);
              ctx.stroke();
            }
            
            ctx.restore();
          };

          // Handle Logo placing and texts rendering
          if (hasLogo) {
            if (itemLogoPosition === "left") {
              // Logo on left, text beside it
              await drawCanvasLogo(ctx, logoType, logoUrl, startX, logoY, logoSize, style.logoColor);
              renderCanvasNameText(startX + logoSize + logoGap, nameCenterY);
            } else if (itemLogoPosition === "right") {
              // Text first, logo beside it
              renderCanvasNameText(startX, nameCenterY);
              await drawCanvasLogo(ctx, logoType, logoUrl, startX + textWidth + logoGap, logoY, logoSize, style.logoColor);
            } else if (itemLogoPosition === "both") {
              // Logo, text, Logo
              await drawCanvasLogo(ctx, logoType, logoUrl, startX, logoY, logoSize, style.logoColor);
              renderCanvasNameText(startX + logoSize + logoGap, nameCenterY);
              await drawCanvasLogo(ctx, logoType, logoUrl, startX + logoSize + logoGap + textWidth + logoGap, logoY, logoSize, style.logoColor);
            }
          } else {
            // Draw standard name text centered or aligned without logos
            renderCanvasNameText(startX, nameCenterY);
          }

          // Draw Footer subtitle Text
          if (style.showFooter) {
            ctx.fillStyle = style.footerColor;
            const footFont = style.footerFontFamily === "font-mono" ? "JetBrains Mono" : "Inter";
            ctx.font = `500 ${style.footerFontSize}px ${footFont}, monospace`;
            
            const footY = y + cardH - grid.paddingY;
            ctx.textBaseline = "bottom";

            let footText = "";
            if (style.footerTextPattern === "index") {
              const totalIdx = pageIdx * itemsPerPage + index + 1;
              const paddedStr = String(totalIdx).padStart(3, "0");
              footText = `${style.footerCustomText || "SLOT"}-${paddedStr}`;
            } else if (style.footerTextPattern === "custom") {
              footText = style.footerCustomText || "VIP GUEST";
            } else {
              footText = item.subtitle || item.extraCode || "";
            }

            if (style.nameAlignment === "left") {
              ctx.textAlign = "left";
              ctx.fillText(footText, x + grid.paddingX, footY);
            } else if (style.nameAlignment === "right") {
              ctx.textAlign = "right";
              ctx.fillText(footText, x + cardW - grid.paddingX, footY);
            } else {
              ctx.textAlign = "center";
              ctx.fillText(footText, x + cardW / 2, footY);
            }
          }
        }
      }
    }

    return canvas;
  };

  // High Resolution Canvas Download of single page
  const downloadPageAsPNG = async (pageIdx: number) => {
    setIsDownloading(true);
    try {
      const canvas = await generatePageCanvas(pageIdx);
      const link = document.createElement("a");
      link.download = `sticker_sheet_page_${pageIdx + 1}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("Error compiling high resolution sheet.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate and download a consolidated multi-page PDF representing the entire compiled set
  const downloadAllPagesAsPDF = async () => {
    setIsDownloading(true);
    try {
      const cardW = grid.cardWidth;
      const cardH = grid.cardHeight;
      const gapX = grid.gapX;
      const gapY = grid.gapY;
      const cols = grid.cols;
      const rows = grid.rows;
      const marginL = grid.sheetMarginLeft;
      const marginT = grid.sheetMarginTop;

      const totalWidth = marginL * 2 + cols * cardW + (cols - 1) * gapX;
      const totalHeight = marginT * 2 + rows * cardH + (rows - 1) * gapY;

      // Define PDF with correct formatting in pixels
      const pdf = new jsPDF({
        orientation: totalWidth > totalHeight ? "landscape" : "portrait",
        unit: "px",
        format: [totalWidth, totalHeight]
      });

      for (let p = 0; p < pageCount; p++) {
        if (p > 0) {
          pdf.addPage([totalWidth, totalHeight], totalWidth > totalHeight ? "landscape" : "portrait");
        }
        
        // Generate high resolution canvas for current page index
        const canvas = await generatePageCanvas(p);
        
        // Use JPEG data compression to balance output size and anti-alias crispness
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, totalWidth, totalHeight, undefined, "FAST");
      }
      
      pdf.save("compiled_sticker_sheets.pdf");
    } catch (err) {
      console.error(err);
      alert("Error compiling multi-page sheet set PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Pre-compiled sheets elements for screen display
  const renderInteractivePageSheet = (pageIdx: number, hideUIControls = false) => {
    const pageItems = getPageItems(pageIdx);
    
    // Style configurations
    const totalW = grid.sheetMarginLeft * 2 + grid.cols * grid.cardWidth + (grid.cols - 1) * grid.gapX;
    
    return (
      <div 
        id={`page-sheet-${pageIdx}`}
        className="relative bg-white shadow-md border border-zinc-200 transition-all text-left overflow-auto break-inside-avoid print-page-break print:shadow-none print:border-none"
        style={{
          width: hideUIControls ? `${totalW}px` : "100%",
          maxWidth: hideUIControls ? `${totalW}px` : "100%",
          minHeight: "450px",
          paddingTop: `${grid.sheetMarginTop}px`,
          paddingBottom: `${grid.sheetMarginTop}px`,
          paddingLeft: `${grid.sheetMarginLeft}px`,
          paddingRight: `${grid.sheetMarginLeft}px`,
        }}
      >
        {/* Full Image Backdrop Option */}
        {sheetOverlayMode && bgSheetBackdrop && (
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden text-center z-0">
            <img 
              src={bgSheetBackdrop} 
              alt="Backdrop Grid Sheet" 
              className="w-full h-full object-fill opacity-90"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Outer Label Grid layout */}
        <div 
          className="relative grid z-10" 
          style={{
            gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
            columnGap: `${grid.gapX}px`,
            rowGap: `${grid.gapY}px`,
          }}
        >
          {pageItems.map((item, index) => {
            const absoluteCellIndex = pageIdx * itemsPerPage + index;
            const hasItem = item !== null;
            
            const itemLogoType = item?.customLogoType && item.customLogoType !== "none" ? item.customLogoType : "none";
            const hasLogo = itemLogoType !== "none";
            const itemLogoScale = item?.customLogoScale !== undefined ? item.customLogoScale : 1.0;
            const globalLogoScale = style.logoScale !== undefined ? style.logoScale : 1.0;
            const itemLogoPosition = item?.customLogoPosition || style.logoPosition || "left";
            const itemNameStyleVariety = item?.customNameStyleVariety || style.nameStyleVariety || "standard";

            // Calculate best fitting font size if checked
            let cardFontSize = style.nameFontSize;
            if (hasItem) {
              if (style.fitToCard) {
                let nameString = item.name;
                if (style.nameCase === "uppercase") nameString = nameString.toUpperCase();
                else if (style.nameCase === "lowercase") nameString = nameString.toLowerCase();
                
                // Estimate logo width to shrink text appropriately
                const logoPaddingRatio = hasLogo ? (0.95 * (itemLogoPosition === "both" ? 2 : 1)) : 0;
                const approxLogoAndGap = hasLogo ? (style.nameFontSize * logoPaddingRatio * itemLogoScale * globalLogoScale + (itemLogoPosition === "both" ? 14 : 7)) : 0;
                
                const maxAllowedWidth = grid.cardWidth - (grid.paddingX * 2) - approxLogoAndGap;
                
                cardFontSize = calculateFitFontSize(
                  nameString,
                  Math.max(50, maxAllowedWidth),
                  itemNameStyleVariety === "stylish" ? "font-serif" : style.nameFontFamily,
                  style.nameFontWeight,
                  style.nameFontSize
                );
              }
            }

            // Generate footer dynamic display
            let footerLabel = "";
            if (hasItem) {
              if (style.footerTextPattern === "index") {
                const totalIdNum = absoluteCellIndex + 1;
                footerLabel = `${style.footerCustomText || "ID"}-${String(totalIdNum).padStart(3, "0")}`;
              } else if (style.footerTextPattern === "custom") {
                footerLabel = style.footerCustomText;
              } else {
                footerLabel = item.subtitle || item.extraCode || "";
              }
            }

            return (
              <div
                key={hasItem ? item.id : `empty-cell-${index}`}
                onClick={() => hasItem && !hideUIControls && startEditing(item)}
                className={`relative group box-border overflow-hidden transition-all duration-150 flex flex-col justify-between ${
                  hasItem && !hideUIControls ? "cursor-editor hover:ring-2 hover:ring-zinc-900 border" : "border"
                }`}
                style={{
                  width: `${grid.cardWidth}px`,
                  height: `${grid.cardHeight}px`,
                  paddingTop: `${grid.paddingY}px`,
                  paddingBottom: `${grid.paddingY}px`,
                  paddingLeft: `${grid.paddingX}px`,
                  paddingRight: `${grid.paddingX}px`,
                  
                  // Style logic
                  backgroundColor: sheetOverlayMode ? "transparent" : style.bgColor,
                  backgroundImage: !sheetOverlayMode && style.bgType === "uploaded" && bgImagePattern ? `url(${bgImagePattern})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderColor: sheetOverlayMode ? "transparent" : style.borderColor,
                  borderWidth: sheetOverlayMode ? "0px" : `${style.borderWidth}px`,
                  borderRadius: sheetOverlayMode ? "0px" : `${style.borderRadius}px`,
                }}
                id={`card-slot-${absoluteCellIndex}`}
              >
                {/* Background opacity filter */}
                {!sheetOverlayMode && style.bgType === "uploaded" && bgImagePattern && (
                  <div 
                    className="absolute inset-0 z-0 pointer-events-none" 
                    style={{ backgroundColor: style.bgColor, opacity: (100 - style.cardBackgroundOpacity) / 100 }}
                  />
                )}

                {/* Card Elements wrapper */}
                <div className="w-full h-full relative z-10 flex flex-col justify-between select-none">
                  
                  {/* Top Access Seal Ribbon */}
                  {style.showHeader && (
                    <div 
                      className="flex items-center gap-1.5 font-semibold shrink-0"
                      style={{ 
                        color: style.headerTextColor,
                        fontSize: `${style.headerFontSize}px`,
                        justifyContent: style.nameAlignment === "left" ? "flex-start" : style.nameAlignment === "right" ? "flex-end" : "center"
                      }}
                    >
                      <span className="truncate uppercase select-none font-sans font-semibold tracking-wider">
                        {style.headerText || "COMPILERR"}
                      </span>
                    </div>
                  )}

                  {/* Dynamic Name Header Placeholder */}
                  <div 
                    className={`w-full text-zinc-850 flex-1 flex items-center`}
                    style={{
                      transform: `translateY(${style.nameYShift}px)`,
                      justifyContent: style.nameAlignment === "left" ? "flex-start" : style.nameAlignment === "right" ? "flex-end" : "center"
                    }}
                  >
                    {hasItem ? (
                      <div className="flex items-center gap-2 max-w-full overflow-hidden">
                        {hasLogo && (itemLogoPosition === "left" || itemLogoPosition === "both") && renderItemLogo(item, cardFontSize * 0.95)}
                        
                        <span 
                          className={`whitespace-nowrap overflow-hidden text-ellipsis ${
                            itemNameStyleVariety === "stylish" ? "font-serif italic" : style.nameFontFamily
                          } ${style.nameFontWeight}`}
                          style={{
                            fontSize: `${cardFontSize}px`,
                            textTransform: style.nameCase === "uppercase" ? "uppercase" : style.nameCase === "lowercase" ? "lowercase" : "none",
                            letterSpacing: style.nameLetterSpacing === "tracking-widest" ? "0.15em" : style.nameLetterSpacing === "tracking-wider" ? "0.08em" : "0.01em",
                            
                            // Text Variety Styles mapping:
                            ...(itemNameStyleVariety === "standard" ? {
                              color: style.nameColor,
                            } : itemNameStyleVariety === "stylish" ? {
                              color: style.nameColor,
                              letterSpacing: "0.01em",
                            } : itemNameStyleVariety === "neon-glow" ? {
                              color: style.nameColor,
                              textShadow: `0 0 4px ${style.nameColor}, 0 0 10px ${style.nameColor}, 0 0 18px ${style.logoColor || style.nameColor}`,
                            } : itemNameStyleVariety === "gold-foil" ? {
                              backgroundImage: "linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              color: "transparent",
                            } : itemNameStyleVariety === "vintage-shadow" ? {
                              color: style.nameColor,
                              textShadow: "2px 2px 0px rgba(0,0,0,0.6)",
                            } : itemNameStyleVariety === "modern-outline" ? {
                              color: "transparent",
                              WebkitTextStroke: `1px ${style.nameColor}`,
                            } : itemNameStyleVariety === "underlined" ? {
                              color: style.nameColor,
                              borderBottom: `2px solid ${style.nameColor}`,
                              paddingBottom: "1px"
                            } : {})
                          }}
                        >
                          {item.name}
                        </span>

                        {hasLogo && (itemLogoPosition === "right" || itemLogoPosition === "both") && renderItemLogo(item, cardFontSize * 0.95)}
                      </div>
                    ) : (
                      <span className="text-[11px] font-mono text-zinc-500 font-medium select-none uppercase tracking-widest opacity-25">
                        -- Empty --
                      </span>
                    )}
                  </div>

                  {/* Small card Footer label */}
                  {style.showFooter && (
                    <div 
                      className={`text-[10px] uppercase font-mono tracking-wider truncate shrink-0`}
                      style={{ 
                        color: style.footerColor,
                        fontSize: `${style.footerFontSize}px`,
                        textAlign: style.nameAlignment,
                        fontFamily: style.footerFontFamily === "font-mono" ? "monospace" : "sans-serif"
                      }}
                    >
                      {hasItem ? footerLabel : `ID-${String(absoluteCellIndex + 1).padStart(3, "0")}`}
                    </div>
                  )}

                  {/* Overlay edit prompt on hover */}
                  {hasItem && !hideUIControls && editingItemId !== item.id && (
                    <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-100 bg-zinc-900/90 text-white p-1 rounded-tl-md transition-opacity duration-100 flex items-center gap-0.5 pointer-events-none">
                      <Edit2 size={9} />
                      <span className="text-[8px] font-semibold uppercase tracking-widest px-0.5">Edit</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5" id="visual-preview-component">
      
      {/* 1. Header with Output Controller buttons */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-zinc-900 text-sm flex items-center gap-1.5">
            <Eye size={16} className="text-zinc-500" />
            <span>Compiled Sticker Sheets</span>
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Displaying grid sheet <span className="font-semibold text-zinc-800">{activePageIndex + 1} of {pageCount}</span> ({items.length} cards total)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Pagination controls */}
          <div className="flex items-center gap-1 border border-zinc-200 rounded-lg p-0.5 bg-zinc-50 shrink-0">
            <button
              onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))}
              disabled={activePageIndex === 0}
              className="p-1 px-1.5 hover:bg-white text-zinc-650 hover:text-zinc-900 font-medium text-xs disabled:opacity-40 disabled:hover:bg-transparent rounded transition-colors"
              title="Previous sheet page"
              type="button"
              id="btn-prev-page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-mono font-medium px-2 text-zinc-700 select-none">
              Sheet {activePageIndex + 1}/{pageCount}
            </span>
            <button
              onClick={() => setActivePageIndex(prev => Math.min(pageCount - 1, prev + 1))}
              disabled={activePageIndex === pageCount - 1}
              className="p-1 px-1.5 hover:bg-white text-zinc-650 hover:text-zinc-900 font-medium text-xs disabled:opacity-40 disabled:hover:bg-transparent rounded transition-colors"
              title="Next sheet page"
              type="button"
              id="btn-next-page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Export sheet image PNG */}
          <button
            onClick={() => downloadPageAsPNG(activePageIndex)}
            disabled={isDownloading || items.length === 0}
            className="flex-1 md:flex-none justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold py-2 px-3.5 rounded-lg border border-zinc-250 transition-colors flex items-center gap-1.5"
            type="button"
            id="btn-export-sheet-png"
          >
            <Download size={14} className={isDownloading ? "animate-bounce" : ""} />
            <span>{isDownloading ? "Save PNG" : "Save PNG"}</span>
          </button>

          {/* Export entire set as a multi-page PDF */}
          <button
            onClick={downloadAllPagesAsPDF}
            disabled={isDownloading || items.length === 0}
            className="flex-1 md:flex-none justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-3.5 rounded-lg border border-indigo-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            type="button"
            id="btn-export-set-pdf"
          >
            <Download size={14} className={isDownloading ? "animate-bounce" : ""} />
            <span>{isDownloading ? "Compiling PDF..." : "Save Multi-page PDF"}</span>
          </button>

          {/* Print browser command */}
          <button
            onClick={triggerPrint}
            title="Press to trigger browser layout printing directly to label page sheets"
            className="flex-1 md:flex-none justify-center bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            type="button"
            id="btn-trigger-print-flow"
          >
            <Printer size={14} />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* 2. Calibration visual notification */}
      {sheetOverlayMode && bgSheetBackdrop && (
        <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg flex items-center gap-2.5 text-xs text-zinc-600">
          <Sparkles size={14} className="text-zinc-650 stroke-[2]" />
          <div>
            <span className="font-semibold text-zinc-800">Calibration Active:</span> Overlaid on your template sheet. Adjust widths, margins, and gaps in side controls to overlay perfectly.
          </div>
        </div>
      )}

      {/* 3. Central Canvas Sheet Workspace */}
      <div className="w-full flex justify-center bg-zinc-100 rounded-2xl border border-zinc-200 p-6 md:p-8 overflow-auto min-h-[400px]">
        <div className="shrink-0 transition-transform duration-200 hover:scale-[1.002]">
          {items.length === 0 ? (
            <div className="text-center py-20 px-8 flex flex-col items-center justify-center gap-3 max-w-sm">
              <div className="p-4 bg-zinc-200 text-zinc-500 rounded-full animate-pulse">
                <Printer size={28} />
              </div>
              <h3 className="font-semibold text-zinc-800 text-sm">Design Preview Area</h3>
              <p className="text-xs text-zinc-400 font-medium">
                Your compiled labels will render here. Load or paste an Excel name list in the drawer on the left to start customizing!
              </p>
            </div>
          ) : (
            // Active Layout Sheet
            renderInteractivePageSheet(activePageIndex, false)
          )}
        </div>
      </div>

      {/* HELP INSTRUCTIONS ON USE */}
      <div className="bg-white/50 rounded-xl border border-zinc-200 p-4 text-xs text-zinc-500 flex gap-2">
        <HelpCircle size={15} className="mt-0.5 text-zinc-400 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold text-zinc-700">Quick Hacks & Formatting Guidelines:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li><strong>Fixing Typos:</strong> Click on any label card in the preview above to edit its text directly on-screen.</li>
            <li><strong>Aligning labels:</strong> Standard grids differ slightly. Use margin sliders under “Sheet Grid & Print Margins” to nudge cards onto printed boundary slots.</li>
            <li><strong>Printing:</strong> Recommended browser padding is "None", and paper margins should be "Default / None" inside of your print options box for exact alignment.</li>
          </ul>
        </div>
      </div>

      {/* 4. CARD PERSONALIZATION PROFILE EDIT MODAL */}
      {editingItemId !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl max-w-md w-full border border-zinc-200 shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-teal-400" />
                <h3 className="font-semibold text-sm tracking-tight">Card Personalization Profile</h3>
              </div>
              <button 
                onClick={() => setEditingItemId(null)}
                className="text-zinc-400 hover:text-white transition-colors text-xs font-semibold px-2 py-1 rounded hover:bg-zinc-800 cursor-pointer"
                type="button"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Sticker/Card Name</label>
                <input
                  type="text"
                  value={editNameField}
                  onChange={(e) => setEditNameField(e.target.value)}
                  className="w-full text-xs font-medium border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white text-zinc-900"
                  placeholder="e.g. Dr. Jordan Peterson"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Subtitle / Second Line Info</label>
                <input
                  type="text"
                  value={editSubField}
                  onChange={(e) => setEditSubField(e.target.value)}
                  className="w-full text-xs border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white text-zinc-900"
                  placeholder="e.g. Keynote Speaker / Advisory Group"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Code / Footer Ticket ID</label>
                <input
                  type="text"
                  value={editExtraField}
                  onChange={(e) => setEditExtraField(e.target.value)}
                  className="w-full text-xs border border-zinc-250 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white text-zinc-900"
                  placeholder="e.g. VVIP-9021"
                />
              </div>

              {/* Logo Adding Option for Specific Name */}
              <div className="bg-zinc-50 rounded-xl border border-zinc-150 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800 flex items-center gap-1">
                    👑 Specific Logo Accent Option
                  </span>
                  <span className="text-[10px] bg-teal-100 text-teal-850 px-1.5 py-0.5 rounded font-mono font-semibold uppercase">New</span>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Selection Model</label>
                  <select
                    value={editLogoType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setEditLogoType(val);
                      if (val !== "image") {
                        setEditLogoUrl(""); // clear custom logo URL unless selected
                      }
                    }}
                    className="w-full text-xs border border-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white text-zinc-800"
                  >
                    <option value="none">No Specific Accent Logo (Use General Default)</option>
                    <option value="star">Star Accent Icon ✦</option>
                    <option value="diamond">Diamond Accent Icon ♦</option>
                    <option value="crown">Crown Accent Icon 👑</option>
                    <option value="circle">Circle Accent Icon ●</option>
                    <option value="heart">Heart Accent Icon ♥</option>
                    <option value="shield">Shield Accent Icon 🛡️</option>
                    <option value="flame">Flame Accent Flame 🔥</option>
                    <option value="image">Uploaded Custom Sticker Image Logo 🖼️</option>
                  </select>
                </div>

                {editLogoType === "image" && (
                  <div className="space-y-2 border-t border-dashed border-zinc-200 pt-3">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Custom Logo Upload (PNG/JPG)</label>
                    
                    {editLogoUrl ? (
                      <div className="flex items-center gap-3 bg-white p-2 border border-zinc-150 rounded-lg">
                        <img 
                          src={editLogoUrl} 
                          className="w-10 h-10 object-contain rounded border border-zinc-100 p-0.5 bg-zinc-50 shrink-0" 
                          alt="custom preview" 
                        />
                        <div className="overflow-hidden flex-1">
                          <p className="text-[11px] text-emerald-600 font-semibold truncate">Uploaded Custom Logo Loaded</p>
                          <button
                            onClick={() => setEditLogoUrl("")}
                            className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                            type="button"
                          >
                            Remove Logo Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-zinc-250 rounded-lg p-4 text-center hover:bg-zinc-100 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <p className="text-xs text-zinc-500">
                          Click to upload dynamic logo image
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-1">Accepts PNG, JPG (Matches label text scale size)</p>
                      </div>
                    )}
                  </div>
                )}
                
                {editLogoType !== "none" && (
                  <div className="space-y-1.5 border-t border-dashed border-zinc-200 pt-3">
                    <div className="flex justify-between text-[11px] font-bold text-zinc-650 uppercase">
                      <span>Logo Size Scale multiplier</span>
                      <span className="font-mono text-zinc-500 font-semibold">{editLogoScale.toFixed(2)}x</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0.4"
                        max="3.0"
                        step="0.1"
                        value={editLogoScale}
                        onChange={(e) => setEditLogoScale(parseFloat(e.target.value))}
                        className="flex-1 accent-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => setEditLogoScale(1.0)}
                        className="text-[10px] bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-1.5 py-0.5 rounded font-medium"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 border-t border-dashed border-zinc-250 pt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Individual Logo Placement</label>
                    <select
                      value={editLogoPosition}
                      onChange={(e) => setEditLogoPosition(e.target.value as any)}
                      className="w-full text-xs border border-zinc-200 rounded-lg p-2 focus:outline-none bg-white text-zinc-800"
                    >
                      <option value="left">Left Side of Name</option>
                      <option value="right">Right Side of Name</option>
                      <option value="both">Both Sides of Name</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Individual Name Text Variety</label>
                    <select
                      value={editNameStyleVariety}
                      onChange={(e) => setEditNameStyleVariety(e.target.value as any)}
                      className="w-full text-xs border border-zinc-200 rounded-lg p-2 focus:outline-none bg-white text-zinc-800 font-medium"
                    >
                      <option value="standard">Standard Style (Use General Default)</option>
                      <option value="stylish">Stylish Serif Italic 🍇</option>
                      <option value="neon-glow">Neon Glowing Light ⚡</option>
                      <option value="gold-foil">Gold Foil Metallic 👑</option>
                      <option value="vintage-shadow">Classy Drop Shadow 🕶️</option>
                      <option value="modern-outline">Hollow Outline 💎</option>
                      <option value="underlined">Elegant Underline ✒️</option>
                    </select>
                  </div>
                </div>

                <p className="text-[9px] text-zinc-400">
                  ⚡ <strong>Note:</strong> Custom logos selected here completely override the global stamp icon style specifically for this individual card.
                </p>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-zinc-50 p-4 border-t border-zinc-150 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setEditingItemId(null)}
                className="bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold py-2 px-4 border border-zinc-250 rounded-lg transition-colors cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={saveEditing}
                className="bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold py-2 px-5 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                type="button"
              >
                <Check size={13} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECRET PRINTABLE DOM ELEMENTS (Only visible to printer @media print styles) */}
      <div className="hidden print:block print-area absolute inset-0 text-center">
        {Array.from({ length: pageCount }).map((_, pageIdx) => (
          <div key={pageIdx} className="w-full h-full flex justify-center break-inside-avoid print-page-break">
            {renderInteractivePageSheet(pageIdx, true)}
          </div>
        ))}
      </div>

    </div>
  );
}
