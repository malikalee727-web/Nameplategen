import React, { useState } from "react";
import { 
  FileSpreadsheet, Sliders, Eye, RefreshCw, Sparkles, 
  Settings, HelpCircle, HardDriveUpload, Smartphone
} from "lucide-react";
import { LabelItem, LabelStyle, GridConfig } from "./types";
import { DEFAULT_STYLE, DEFAULT_GRID, SAMPLE_NAMES } from "./constants";
import ExcelLoader from "./components/ExcelLoader";
import LogoNameMapper from "./components/LogoNameMapper";
import LabelCustomizer from "./components/LabelCustomizer";
import LabelPreview from "./components/LabelPreview";
import ApkDownloadSection from "./components/ApkDownloadSection";

export default function App() {
  // Precompile initial sample data based on target schema
  const initialItems: LabelItem[] = SAMPLE_NAMES.map((name, idx) => ({
    id: `sample-${idx}`,
    name: name,
    subtitle: idx % 3 === 0 ? "Advisory Lead" : idx % 2 === 0 ? "Design Partner" : "Strategy Group",
    extraCode: `VIP-${String(100 + idx).padStart(3, "0")}`,
  }));

  // State management
  const [items, setItems] = useState<LabelItem[]>(initialItems);
  const [style, setStyle] = useState<LabelStyle>(DEFAULT_STYLE);
  const [grid, setGrid] = useState<GridConfig>(DEFAULT_GRID);
  
  // Background images
  const [bgImagePattern, setBgImagePattern] = useState<string | null>(null);
  const [bgSheetBackdrop, setBgSheetBackdrop] = useState<string | null>(null);
  const [sheetOverlayMode, setSheetOverlayMode] = useState<boolean>(false);

  // Callback to handle quick inline text edits in the preview grid (and individual custom logo updates)
  const handleUpdateName = (
    id: string, 
    newName: string, 
    newSubtitle?: string, 
    newExtra?: string,
    newLogoType?: "star" | "diamond" | "crown" | "circle" | "heart" | "shield" | "flame" | "image" | "none",
    newLogoUrl?: string,
    newLogoScale?: number,
    newLogoPosition?: "left" | "right" | "both",
    newNameStyleVariety?: "standard" | "stylish" | "neon-glow" | "gold-foil" | "vintage-shadow" | "modern-outline" | "underlined"
  ) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { 
              ...item, 
              name: newName, 
              subtitle: newSubtitle, 
              extraCode: newExtra,
              customLogoType: newLogoType,
              customLogoUrl: newLogoUrl,
              customLogoScale: newLogoScale,
              customLogoPosition: newLogoPosition,
              customNameStyleVariety: newNameStyleVariety
            }
          : item
      )
    );
  };

  // Callback to replace listing wholesale (e.g., spreadsheet upload or paste)
  const handleNamesLoaded = (newItems: LabelItem[]) => {
    setItems(newItems);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans select-none antialiased">
      
      {/* 1. Header Navigation Bar (Human Descriptive & Styled) */}
      <header className="bg-zinc-900 text-white shrink-0 border-b border-zinc-800 py-4 px-6 no-print flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 flex-nowrap">
          <div className="p-0.5 bg-zinc-800 rounded-lg shrink-0 overflow-hidden border border-zinc-700/50 flex items-center justify-center">
            <img 
              src="/src/assets/images/isi_markhor_logo_1780354652694.png" 
              alt="NameGen ISI Markhor Logo" 
              className="w-9 h-9 object-cover rounded-md"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight">
                NameGen Project <span className="text-teal-400 font-normal">By AleeXstudio</span>
              </h1>
              <span className="text-[10px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded-full font-semibold border border-teal-500/20 uppercase tracking-widest">v1.2</span>
            </div>
            <p className="text-[11px] text-zinc-400">Compile names from spreadsheets directly onto grid sticker cards</p>
          </div>
        </div>

        {/* Owner & Engine Information */}
        <div className="flex items-center gap-4">
          <a
            href="/NameGen.apk"
            download="NameGen.apk"
            className="flex items-center gap-1.5 bg-teal-500/10 hover:bg-teal-500/25 text-teal-400 hover:text-teal-300 text-xs font-semibold px-3 py-2 rounded-lg border border-teal-500/20 shadow-sm transition-all duration-200 active:scale-95 animate-pulse"
            title="Download NameGen Companion App APK with one-click"
          >
            <Smartphone size={13} className="text-teal-400" />
            <span>Download APK</span>
          </a>
          <div className="hidden sm:flex flex-col items-end text-xs font-sans">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold font-mono">Owner</span>
            <span className="font-semibold text-zinc-200">Waleed Khan Afridi</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 text-xs font-mono bg-zinc-850 px-3 py-1.5 rounded-lg border border-zinc-800 shadow-inner">
            <Sparkles size={13} className="text-yellow-400 animate-pulse" />
            <span>Layout Engine: Active</span>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden no-print">
        
        {/* Left Side: Parameters, file loaders, adjustments drawer */}
        <section 
          className="w-full lg:w-[410px] border-r border-zinc-200 overflow-y-auto p-5 space-y-5 lg:h-[calc(100vh-68px)]"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.92)), url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "local"
          }}
        >
          
          {/* A. Group header */}
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Data & Format Inputs
            </span>
          </div>

          {/* B. Excel / Spreadsheet drag box */}
          <ExcelLoader 
            onNamesLoaded={handleNamesLoaded} 
            currentItems={items} 
          />

          {/* Personalized custom name logo mapping */}
          <LogoNameMapper 
            items={items}
            setItems={setItems}
          />

          {/* C. Layout and Font customizers */}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-200">
            <Sliders size={16} className="text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Styling & Alignment
            </span>
          </div>

          <LabelCustomizer
            style={style}
            setStyle={setStyle}
            grid={grid}
            setGrid={setGrid}
            bgImagePattern={bgImagePattern}
            setBgImagePattern={setBgImagePattern}
            bgSheetBackdrop={bgSheetBackdrop}
            setBgSheetBackdrop={setBgSheetBackdrop}
            sheetOverlayMode={sheetOverlayMode}
            setSheetOverlayMode={setSheetOverlayMode}
          />

          <ApkDownloadSection />
        </section>

        {/* Right Side: High fidelity canvas preview page workspace */}
        <section className="flex-1 bg-zinc-100 overflow-y-auto p-5 md:p-6 lg:h-[calc(100vh-68px)]">
          <LabelPreview
            items={items}
            style={style}
            grid={grid}
            bgImagePattern={bgImagePattern}
            bgSheetBackdrop={bgSheetBackdrop}
            sheetOverlayMode={sheetOverlayMode}
            onUpdateName={handleUpdateName}
          />
        </section>

      </main>

      {/* 3. SECRET PRINT AREA WRAPPER */}
      <div className="hidden print:block">
        <LabelPreview
          items={items}
          style={style}
          grid={grid}
          bgImagePattern={bgImagePattern}
          bgSheetBackdrop={bgSheetBackdrop}
          sheetOverlayMode={sheetOverlayMode}
          onUpdateName={handleUpdateName}
        />
      </div>

    </div>
  );
}
