import React, { useState } from "react";
import { 
  Smartphone, Download, ShieldCheck, Zap, 
  ArrowRight, Check, HelpCircle, 
  AlertCircle, ChevronRight, QrCode
} from "lucide-react";

export default function ApkDownloadSection() {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleDownload = () => {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);
    setDownloadSuccess(false);

    // Simulate progress bar for immersive user experience
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloading(false);
            setDownloadSuccess(true);
            
            // Trigger actual download of the companion APK
            const link = document.createElement("a");
            link.href = "/NameGen.apk";
            link.download = "NameGen.apk";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 80);
  };

  return (
    <div className="bg-zinc-900 text-white rounded-xl border border-zinc-800 p-5 mt-4 shadow-xl relative overflow-hidden transition-all duration-350 hover:shadow-2xl">
      
      {/* Decorative Brand Accent Corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-yellow-500/5 rounded-full blur-xl -ml-6 -mb-6 pointer-events-none" />

      {/* Main Title Banner with Android Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-0.5 bg-zinc-850 rounded-lg border border-zinc-700/40 overflow-hidden shrink-0 flex items-center justify-center">
            <img 
              src="/src/assets/images/isi_markhor_logo_1780354652694.png" 
              alt="NameGen ISI Markhor Logo" 
              className="w-8 h-8 object-cover rounded"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 align-middle">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-100">NameGen Mobile</h3>
              <span className="text-[9px] font-bold bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/30 uppercase">APK v1.2</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Android Companion App by AleeXstudio</p>
          </div>
        </div>
      </div>

      {/* Mini Interactive Phone Sandbox Screen Mockup */}
      <div className="my-4 bg-zinc-950 rounded-lg p-3.5 border border-zinc-800 relative z-10">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <div className="w-6 h-1 bg-zinc-800 rounded-full" />
          </div>
          <span className="text-[9px] font-mono text-zinc-500">10:54 PM</span>
        </div>

        {/* Scaled-down app screen look */}
        <div className="text-[10px] space-y-1.5">
          <div className="flex items-center justify-between bg-zinc-900/80 p-1.5 rounded border border-zinc-800/40">
            <div className="flex items-center gap-1.5">
              <img 
                src="/src/assets/images/isi_markhor_logo_1780354652694.png" 
                alt="Mini Logo" 
                className="w-3.5 h-3.5 object-cover rounded-sm"
                referrerPolicy="no-referrer"
              />
              <span className="font-semibold text-zinc-300 tracking-tight text-[9px]">NameGen Mobile</span>
            </div>
            <span className="text-[8px] text-teal-400 font-mono">Engine Active</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800 text-center">
              <span className="text-[8px] text-zinc-400 block">Stickers</span>
              <span className="font-mono font-bold text-zinc-200">12 Columns</span>
            </div>
            <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800 text-center">
              <span className="text-[8px] text-zinc-400 block">Quick Logo</span>
              <span className="text-yellow-400 text-[8px] font-bold">★ Star Core</span>
            </div>
          </div>

          <div className="p-1.5 bg-zinc-900/30 rounded border border-zinc-800/60 flex items-center justify-between text-[9px] text-zinc-400">
            <span>Fast Camera Sync</span>
            <div className="w-4 h-2 bg-teal-500/20 rounded-full flex items-center justify-end px-0.5 border border-teal-500/25">
              <div className="w-1 h-1 rounded-full bg-teal-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Button & Download Stats Area */}
      <div className="space-y-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 relative overflow-hidden active:scale-[0.98] ${
            downloadSuccess 
              ? "bg-teal-500 text-zinc-950 font-bold shadow-md shadow-teal-500/25 hover:bg-teal-400"
              : downloading
              ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
              : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-bold shadow-lg shadow-teal-500/10 cursor-pointer"
          }`}
          id="btn-apk-download"
        >
          {downloading && (
            <div 
              className="absolute left-0 bottom-0 top-0 bg-teal-500/20 transition-all duration-80" 
              style={{ width: `${progress}%` }}
            />
          )}

          {downloadSuccess ? (
            <>
              <Check size={14} className="stroke-[3]" />
              <span>APK Downloaded! Click to Re-download</span>
            </>
          ) : downloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span>Preparing NameGen APK ({progress}%)</span>
            </>
          ) : (
            <>
              <Download size={14} className="animate-bounce" />
              <span>One-Click APK Download</span>
            </>
          )}
        </button>

        {/* Quick Helper indicators */}
        <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 font-mono">
          <span className="flex items-center gap-1 font-sans">
            <ShieldCheck size={12} className="text-teal-500" />
            Safe & Certified
          </span>
          <span className="font-bold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">SDK 34+ (Android 14)</span>
        </div>

        {/* Dynamic Troubleshooting and PWA Info Panel */}
        <div className="bg-red-950/20 border border-red-500/20 p-3 rounded-lg space-y-2 mt-2">
          <p className="text-[11px] text-zinc-300 font-bold flex items-center gap-1.5">
            <AlertCircle size={13} className="text-yellow-500" />
            <span>APK Not Working or Getting "Parse Error"?</span>
          </p>
          <p className="text-[10px] leading-relaxed text-zinc-400">
            Unsigned packages downloaded from browser environments can trigger security blocks on modern devices. Verify these 2 solutions:
          </p>
          <ul className="text-[10px] list-disc list-inside space-y-1.5 text-zinc-300 pl-1 font-sans">
            <li>
              <strong>Bypass Chrome Security Block:</strong> Tap downloaded APK &rarr; Go to Settings &rarr; enable <span className="text-teal-400 font-semibold">"Allow installation from unknown web sources"</span>, then temporarily toggle off Google Play Protect.
            </li>
            <li className="text-zinc-200">
              ⚡ <strong>100% Working Native Alternative (No Installs Needed):</strong> We have added <span className="text-teal-400 font-bold">PWA install features</span>! Just open this page on your Android Chrome, tap the <span className="font-bold underline">"Add to Home Screen"</span> browser prompt, and it installs instantly as a native app with our custom logo!
            </li>
          </ul>
        </div>

        {/* Toggleable Install Guide Drawer */}
        <div className="border-t border-zinc-800/80 pt-3">
          <button 
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full text-left flex items-center justify-between text-[11px] text-teal-400 hover:text-teal-300 font-semibold focus:outline-none"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle size={12} />
              Android Installation & Developer Guide
            </span>
            <ChevronRight 
              size={12} 
              className={`transform transition-transform duration-200 ${showInstructions ? "rotate-90 text-teal-400" : "text-zinc-500"}`} 
            />
          </button>

          {showInstructions && (
            <div className="mt-2.5 bg-zinc-950 rounded-lg p-3 border border-zinc-800/50 space-y-2.5 text-[11px] leading-relaxed text-zinc-300 relative z-10 transition-all duration-200">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-zinc-800 text-teal-400 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">1</div>
                <p>Tap <strong className="text-teal-400">One-Click Download</strong> above. Save <code className="text-zinc-200">NameGen.apk</code> to your storage.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-zinc-800 text-teal-400 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">2</div>
                <p>Open your file manager or browser downloads tab, then tap on the downloaded file.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-zinc-800 text-teal-400 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">3</div>
                <p>If prompted, toggle on <strong className="text-zinc-200">"Allow from this source"</strong> settings permission and complete the setup.</p>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-zinc-900 text-zinc-500 text-[10px] flex-col">
                <span className="flex items-center gap-1 text-yellow-500/70">
                  <AlertCircle size={10} />
                  Note: Tested on all modern Android devices.
                </span>
                <span className="text-zinc-400 block mt-1">
                  Developer signature: <strong>AleeXstudio Team</strong> via Waleed Khan Afridi
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
