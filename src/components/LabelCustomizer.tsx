import React, { useRef } from "react";
import { 
  Grid, Palette, Type, LayoutTemplate, ShieldCheck, 
  Sparkles, Sliders, Image as ImageIcon, Trash2, Maximize2 
} from "lucide-react";
import { LabelStyle, GridConfig, TemplatePreset } from "../types";
import { FONT_OPTIONS, LOGO_OPTIONS, PRESETS } from "../constants";

interface LabelCustomizerProps {
  style: LabelStyle;
  setStyle: (style: LabelStyle) => void;
  grid: GridConfig;
  setGrid: (grid: GridConfig) => void;
  
  // Custom uploaded backgrounds
  bgImagePattern: string | null;            // Repeat card background
  setBgImagePattern: (url: string | null) => void;
  bgSheetBackdrop: string | null;           // Full page backdrop
  setBgSheetBackdrop: (url: string | null) => void;
  
  sheetOverlayMode: boolean;                // Whether overlaying text on full sheet image
  setSheetOverlayMode: (val: boolean) => void;
}

export default function LabelCustomizer({
  style,
  setStyle,
  grid,
  setGrid,
  bgImagePattern,
  setBgImagePattern,
  bgSheetBackdrop,
  setBgSheetBackdrop,
  sheetOverlayMode,
  setSheetOverlayMode,
}: LabelCustomizerProps) {
  
  const patternInputRef = useRef<HTMLInputElement>(null);
  const backdropInputRef = useRef<HTMLInputElement>(null);

  // Apply style preset
  const applyPreset = (preset: TemplatePreset) => {
    setStyle({
      ...style,
      ...preset.style,
    });
    setGrid({
      ...grid,
      ...preset.grid,
    });
  };

  const handleStyleChange = (key: keyof LabelStyle, value: any) => {
    setStyle({
      ...style,
      [key]: value
    });
  };

  const handleGridChange = (key: keyof GridConfig, value: any) => {
    setGrid({
      ...grid,
      [key]: value
    });
  };

  // Image Upload Handlers
  const handlePatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImagePattern(event.target?.result as string);
        setStyle({ ...style, bgType: "uploaded" });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleBackdropUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgSheetBackdrop(event.target?.result as string);
        setSheetOverlayMode(true); // Auto-enable backdrop placement mode
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6" id="label-controls-panel">
      
      {/* 1. PRESETS */}
      <div className="bg-white p-5 rounded-xl border border-zinc-250 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
          <Sparkles size={16} className="text-zinc-650" />
          <h3 className="font-semibold text-zinc-900 text-sm">Visual Design Presets</h3>
        </div>
        <p className="text-xs text-zinc-500">Pick a baseline card concept. Update colors & layouts beneath.</p>
        
        <div className="grid grid-cols-1 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="group text-left p-3 rounded-lg border border-zinc-200 hover:border-zinc-900 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col gap-1.5"
              type="button"
              id={`preset-${p.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-800 group-hover:text-zinc-900">{p.name}</span>
                <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded font-medium">Use layout</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. BACKGROUND TEMPLATES UPLOAD (Critical requested feature!) */}
      <div className="bg-white p-5 rounded-xl border border-zinc-250 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
          <ImageIcon size={16} className="text-zinc-650" />
          <h3 className="font-semibold text-zinc-900 text-sm">Upload Design Templates</h3>
        </div>

        <div className="space-y-4">
          {/* Method A: Upload Full Backdrop Page Sheet */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-zinc-700">Option A: Upload Sheet Backdrop</span>
              <span className="text-[10px] text-zinc-400 font-mono">(Upload full grid sheets)</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-2">
              Have an image template with sticker squares already arranged (like the 2x6 black grid)? Upload it here. We will overlay names in grid squares aligned perfectly on top.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => backdropInputRef.current?.click()}
                className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold py-2 px-3 border border-zinc-250 rounded-lg transition-colors flex items-center justify-center gap-2"
                type="button"
                id="btn-upload-sheet-backdrop"
              >
                <Maximize2 size={14} />
                <span>Upload Sheet Template</span>
              </button>
              <input
                ref={backdropInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackdropUpload}
                className="hidden"
              />
              
              {bgSheetBackdrop && (
                <button
                  onClick={() => {
                    setBgSheetBackdrop(null);
                    setSheetOverlayMode(false);
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-250 rounded-lg p-2 transition-colors shrink-0"
                  title="Remove Backdrop"
                  type="button"
                  id="btn-remove-sheet-backdrop"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {bgSheetBackdrop && (
              <div className="mt-3 bg-zinc-50 p-2.5 rounded-lg border border-zinc-150 flex items-center justify-between">
                <span className="text-xs text-zinc-600 font-medium">Sheet grid mode:</span>
                <button
                  type="button"
                  onClick={() => setSheetOverlayMode(!sheetOverlayMode)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                    sheetOverlayMode 
                      ? "bg-zinc-900 text-white" 
                      : "bg-white text-zinc-600 border border-zinc-200"
                  }`}
                  id="btn-toggle-sheet-overlay"
                >
                  {sheetOverlayMode ? "Active (Names Overlayed)" : "Disabled (Using Card Colors)"}
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-zinc-100 my-2"></div>

          {/* Method B: Repeat Card Badge/Logo background */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-zinc-700">Option B: Repeat Background Card</span>
              <span className="text-[10px] text-zinc-400 font-mono">(Tile background)</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-2">
              Upload a single sticker background or watermark (e.g., logo frame). It will repeat inside every card automatically.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => patternInputRef.current?.click()}
                className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold py-2 px-3 border border-zinc-250 rounded-lg transition-colors flex items-center justify-center gap-2"
                type="button"
                id="btn-upload-card-pattern"
              >
                <Sliders size={14} />
                <span>Upload Label Background</span>
              </button>
              <input
                ref={patternInputRef}
                type="file"
                accept="image/*"
                onChange={handlePatternUpload}
                className="hidden"
              />
              
              {bgImagePattern && (
                <button
                  onClick={() => {
                    setBgImagePattern(null);
                    handleStyleChange("bgType", "color");
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-250 rounded-lg p-2 transition-colors shrink-0"
                  title="Remove Pattern"
                  type="button"
                  id="btn-remove-card-pattern"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            
            {bgImagePattern && (
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-zinc-600">Card-Background opacity:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={style.cardBackgroundOpacity}
                    onChange={(e) => handleStyleChange("cardBackgroundOpacity", parseInt(e.target.value))}
                    className="w-24 accent-zinc-900"
                  />
                  <span className="font-mono text-zinc-500 text-[11px]">{style.cardBackgroundOpacity}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. CARD STYLING AND DECORATION */}
      <div className="bg-white p-5 rounded-xl border border-zinc-250 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
          <Palette size={16} className="text-zinc-650" />
          <h3 className="font-semibold text-zinc-900 text-sm">Design & Color Customizer</h3>
        </div>

        {/* Backdrop Card Colors (Hidden if sheetOverlayMode active, or shown as subtitle helper) */}
        {!sheetOverlayMode && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Background & Border</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Fill Color</label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={style.bgColor}
                    onChange={(e) => handleStyleChange("bgColor", e.target.value)}
                    className="w-7 h-7 border border-zinc-250 cursor-pointer rounded-md shrink-0 p-0"
                  />
                  <input
                    type="text"
                    value={style.bgColor}
                    onChange={(e) => handleStyleChange("bgColor", e.target.value)}
                    className="w-full text-xs font-mono border border-zinc-250 rounded px-1 text-center bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Border Color</label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={style.borderColor}
                    onChange={(e) => handleStyleChange("borderColor", e.target.value)}
                    className="w-7 h-7 border border-zinc-250 cursor-pointer rounded-md shrink-0 p-0"
                  />
                  <input
                    type="text"
                    value={style.borderColor}
                    onChange={(e) => handleStyleChange("borderColor", e.target.value)}
                    className="w-full text-xs font-mono border border-zinc-250 rounded px-1 text-center bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Border radius ({style.borderRadius}px)</label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={style.borderRadius}
                  onChange={(e) => handleStyleChange("borderRadius", parseInt(e.target.value))}
                  className="w-full accent-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Border width ({style.borderWidth}px)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={style.borderWidth}
                  onChange={(e) => handleStyleChange("borderWidth", parseInt(e.target.value))}
                  className="w-full accent-zinc-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Name Formatting */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Type size={12} />
            <span>Name Styling</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Name Color</label>
              <div className="flex gap-1.5">
                <input
                  type="color"
                  value={style.nameColor}
                  onChange={(e) => handleStyleChange("nameColor", e.target.value)}
                  className="w-7 h-7 border border-zinc-250 cursor-pointer rounded-md p-0 shrink-0"
                />
                <input
                  type="text"
                  value={style.nameColor}
                  onChange={(e) => handleStyleChange("nameColor", e.target.value)}
                  className="w-full text-xs font-mono border border-zinc-250 rounded px-1 text-center bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Font Family</label>
              <select
                value={style.nameFontFamily}
                onChange={(e) => handleStyleChange("nameFontFamily", e.target.value)}
                className="w-full text-xs border border-zinc-250 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Text Case</label>
              <select
                value={style.nameCase}
                onChange={(e) => handleStyleChange("nameCase", e.target.value)}
                className="w-full text-[11px] border border-zinc-250 rounded p-1 p-y-1.5 focus:outline-none bg-white"
              >
                <option value="uppercase">ALL CAPS</option>
                <option value="none">Original Case</option>
                <option value="lowercase">lowercase</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Align</label>
              <select
                value={style.nameAlignment}
                onChange={(e) => handleStyleChange("nameAlignment", e.target.value)}
                className="w-full text-[11px] border border-zinc-250 rounded p-1 focus:outline-none bg-white font-medium"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Weight</label>
              <select
                value={style.nameFontWeight}
                onChange={(e) => handleStyleChange("nameFontWeight", e.target.value)}
                className="w-full text-[11px] border border-zinc-250 rounded p-1 focus:outline-none bg-white"
              >
                <option value="font-normal">Regular</option>
                <option value="font-medium">Medium</option>
                <option value="font-semibold">Semi Bold</option>
                <option value="font-bold">Bold</option>
                <option value="font-extrabold">Extra Bold</option>
              </select>
            </div>
          </div>

          <div className="pt-1">
            <label className="block text-xs font-semibold text-zinc-650 mb-1">Name Text Style Variety</label>
            <select
              value={style.nameStyleVariety || "standard"}
              onChange={(e) => handleStyleChange("nameStyleVariety", e.target.value)}
              className="w-full text-xs font-medium border border-zinc-250 rounded p-1.5 focus:outline-none bg-white"
            >
              <option value="standard">Standard Name Style</option>
              <option value="stylish">Stylish Serif Italic 🍇</option>
              <option value="neon-glow">Neon Glowing Light ⚡</option>
              <option value="gold-foil">Gold Foil Metallic 👑</option>
              <option value="vintage-shadow">Classy Drop Shadow 🕶️</option>
              <option value="modern-outline">Hollow Outline 💎</option>
              <option value="underlined">Elegant Underline ✒️</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Font Size ({style.nameFontSize}px)</span>
              </div>
              <input
                type="range"
                min="12"
                max="54"
                value={style.nameFontSize}
                onChange={(e) => handleStyleChange("nameFontSize", parseInt(e.target.value))}
                className="w-full accent-zinc-900"
              />
              
              <div className="flex items-center gap-2 mt-2 select-none">
                <input
                  type="checkbox"
                  id="checkbox-fit-to-card"
                  checked={style.fitToCard}
                  onChange={(e) => handleStyleChange("fitToCard", e.target.checked)}
                  className="accent-zinc-900 rounded-sm w-4 h-4 cursor-pointer"
                />
                <label htmlFor="checkbox-fit-to-card" className="text-xs font-semibold text-zinc-700 cursor-pointer flex flex-col">
                  <span>Fit to Card</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Auto-adjusts font size to prevent name text boundary overflow</span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Vertical Name Offset/Shift ({style.nameYShift}px)</span>
              </div>
              <input
                type="range"
                min="-60"
                max="60"
                value={style.nameYShift}
                onChange={(e) => handleStyleChange("nameYShift", parseInt(e.target.value))}
                className="w-full accent-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Secondary Details - Badge Crest & Header Access Level */}
        <div className="space-y-3 pt-3 border-t border-zinc-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={13} />
              <span>Badge Seal & Header</span>
            </label>
            <input
              type="checkbox"
              checked={style.showHeader}
              onChange={(e) => handleStyleChange("showHeader", e.target.checked)}
              className="accent-zinc-900 rounded-sm"
            />
          </div>

          {style.showHeader && (
            <div className="space-y-3 p-3 bg-zinc-50 rounded-lg border border-zinc-150">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-0.5">Top Text</label>
                  <input
                    type="text"
                    value={style.headerText}
                    onChange={(e) => handleStyleChange("headerText", e.target.value)}
                    className="w-full text-xs p-1.5 border border-zinc-250 bg-white rounded"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-0.5">Seal Symbol</label>
                  <select
                    value={style.logoType}
                    onChange={(e) => handleStyleChange("logoType", e.target.value)}
                    className="w-full text-xs border border-zinc-250 bg-white rounded p-1.5 focus:outline-none"
                  >
                    {LOGO_OPTIONS.map((logo) => (
                      <option key={logo.id} value={logo.id}>
                        {logo.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-0.5">Seal/Icon Color</label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={style.logoColor}
                      onChange={(e) => handleStyleChange("logoColor", e.target.value)}
                      className="w-6 h-6 border cursor-pointer rounded shrink-0 p-0"
                    />
                    <input
                      type="text"
                      value={style.logoColor}
                      onChange={(e) => handleStyleChange("logoColor", e.target.value)}
                      className="w-full text-[11px] font-mono border rounded px-1 text-center bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-0.5">Header Font Size</label>
                  <input
                    type="range"
                    min="8"
                    max="18"
                    value={style.headerFontSize}
                    onChange={(e) => handleStyleChange("headerFontSize", parseInt(e.target.value))}
                    className="w-full accent-zinc-900 mt-1"
                  />
                </div>
              </div>

              <div className="border-t border-dashed border-zinc-200 my-2 pt-2"></div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-0.5">Logo Placement Position</label>
                  <select
                    value={style.logoPosition || "left"}
                    onChange={(e) => handleStyleChange("logoPosition", e.target.value)}
                    className="w-full text-xs border border-zinc-250 bg-white rounded p-1.5 focus:outline-none"
                  >
                    <option value="left">Left of Name</option>
                    <option value="right">Right of Name</option>
                    <option value="both">Both Sides (Double)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] uppercase font-semibold text-zinc-500 mb-0.5">
                    <span>Logo Size Resizer</span>
                    <span className="font-mono text-zinc-400 font-bold">{(style.logoScale || 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="3.0"
                    step="0.1"
                    value={style.logoScale || 1.0}
                    onChange={(e) => handleStyleChange("logoScale", parseFloat(e.target.value))}
                    className="w-full accent-zinc-900 mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Subtitles Options */}
        <div className="space-y-3 pt-3 border-t border-zinc-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Card Footer / Secondary Label</span>
            </label>
            <input
              type="checkbox"
              checked={style.showFooter}
              onChange={(e) => handleStyleChange("showFooter", e.target.checked)}
              className="accent-zinc-900 rounded-sm"
            />
          </div>

          {style.showFooter && (
            <div className="space-y-3 p-3 bg-zinc-50 rounded-lg border border-zinc-150">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-0.5">Footer Pattern</label>
                  <select
                    value={style.footerTextPattern}
                    onChange={(e) => handleStyleChange("footerTextPattern", e.target.value)}
                    className="w-full text-xs border border-zinc-250 bg-white rounded p-1.5 focus:outline-none"
                  >
                    <option value="index">Unique Serial ID (eg. C-01)</option>
                    <option value="custom">Generic Text</option>
                    <option value="none">Excel Column (Line 3 if loaded)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-0.5">Custom/Index Prefix</label>
                  <input
                    type="text"
                    value={style.footerCustomText}
                    onChange={(e) => handleStyleChange("footerCustomText", e.target.value)}
                    placeholder="VIP PASS"
                    disabled={style.footerTextPattern === "none"}
                    className="w-full text-xs p-1.5 border border-zinc-250 bg-white rounded disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-0.5">Color</label>
                  <div className="flex gap-1.5">
                    <input
                      type="color"
                      value={style.footerColor}
                      onChange={(e) => handleStyleChange("footerColor", e.target.value)}
                      className="w-6 h-6 border cursor-pointer rounded shrink-0 p-0"
                    />
                    <input
                      type="text"
                      value={style.footerColor}
                      onChange={(e) => handleStyleChange("footerColor", e.target.value)}
                      className="w-full text-[11px] font-mono border rounded px-1 text-center bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-0.5">Font Size</label>
                  <input
                    type="range"
                    min="8"
                    max="18"
                    value={style.footerFontSize}
                    onChange={(e) => handleStyleChange("footerFontSize", parseInt(e.target.value))}
                    className="w-full accent-zinc-900 mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. SHEET GRID DIMENSIONS (Alignment with Avery sheets or print layout) */}
      <div className="bg-white p-5 rounded-xl border border-zinc-250 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
          <Grid size={16} className="text-zinc-650" />
          <h3 className="font-semibold text-zinc-900 text-sm">Sheet Grid & Print Margins</h3>
        </div>
        <p className="text-xs text-zinc-500">Fine-tune the size and grid layout to fit standard printing sheets or backdrops perfectly.</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1 font-medium">Grid Columns</label>
            <input
              type="number"
              min="1"
              max="5"
              value={grid.cols}
              onChange={(e) => handleGridChange("cols", Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-xs border border-zinc-250 rounded p-1.5 focus:outline-none bg-white text-center font-bold"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1 font-medium">Grid Rows</label>
            <input
              type="number"
              min="1"
              max="15"
              value={grid.rows}
              onChange={(e) => handleGridChange("rows", Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-xs border border-zinc-250 rounded p-1.5 focus:outline-none bg-white text-center font-bold"
            />
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          <div>
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Card Width ({grid.cardWidth}px)</span>
            </div>
            <input
              type="range"
              min="150"
              max="500"
              value={grid.cardWidth}
              onChange={(e) => handleGridChange("cardWidth", parseInt(e.target.value))}
              className="w-full accent-zinc-900"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Card Height ({grid.cardHeight}px)</span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              value={grid.cardHeight}
              onChange={(e) => handleGridChange("cardHeight", parseInt(e.target.value))}
              className="w-full accent-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Col Gap ({grid.gapX}px)</label>
              <input
                type="range"
                min="0"
                max="50"
                value={grid.gapX}
                onChange={(e) => handleGridChange("gapX", parseInt(e.target.value))}
                className="w-full accent-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Row Gap ({grid.gapY}px)</label>
              <input
                type="range"
                min="0"
                max="50"
                value={grid.gapY}
                onChange={(e) => handleGridChange("gapY", parseInt(e.target.value))}
                className="w-full accent-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Padding X ({grid.paddingX}px)</label>
              <input
                type="range"
                min="5"
                max="40"
                value={grid.paddingX}
                onChange={(e) => handleGridChange("paddingX", parseInt(e.target.value))}
                className="w-full accent-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Padding Y ({grid.paddingY}px)</label>
              <input
                type="range"
                min="5"
                max="40"
                value={grid.paddingY}
                onChange={(e) => handleGridChange("paddingY", parseInt(e.target.value))}
                className="w-full accent-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Top Margin ({grid.sheetMarginTop}px)</label>
              <input
                type="range"
                min="0"
                max="120"
                value={grid.sheetMarginTop}
                onChange={(e) => handleGridChange("sheetMarginTop", parseInt(e.target.value))}
                className="w-full accent-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Left Margin ({grid.sheetMarginLeft}px)</label>
              <input
                type="range"
                min="0"
                max="120"
                value={grid.sheetMarginLeft}
                onChange={(e) => handleGridChange("sheetMarginLeft", parseInt(e.target.value))}
                className="w-full accent-zinc-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. EXPORT QUALITY CONTROL (Pristine 300+ DPI equivalent outputs) */}
      <div className="bg-white p-5 rounded-xl border border-zinc-250 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
          <Sparkles size={16} className="text-zinc-650" />
          <h3 className="font-semibold text-zinc-900 text-sm">Export Quality (HD Settings)</h3>
        </div>
        <p className="text-xs text-zinc-500">Pick image density output for printing and template assembly. High DPI matches laser-precision sheets.</p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">PNG Resolution Multiplier</label>
            <select
              value={style.exportDPI || 3}
              onChange={(e) => handleStyleChange("exportDPI", parseInt(e.target.value))}
              className="w-full text-xs border border-zinc-250 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
            >
              <option value={1}>1x Standard Screen Quality (96 DPI)</option>
              <option value={2}>2x Retina HD Quality (192 DPI)</option>
              <option value={3}>3x Premium Laser Print HD Quality (300 DPI) [Best]</option>
              <option value={4}>4x Ultra-High Definition Precision (450 DPI)</option>
            </select>
          </div>
          <div className="text-[10px] text-zinc-400 font-medium bg-zinc-50 border border-zinc-150 p-2.5 rounded">
            💡 <b className="text-zinc-700">HD Quality Alert:</b> Higher scaling ratios preserve sharp anti-aliased curves on logos, icons, and small type details during close-up physical printouts.
          </div>
        </div>
      </div>

    </div>
  );
}
