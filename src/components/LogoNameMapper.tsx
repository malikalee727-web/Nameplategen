import React, { useState, useMemo } from "react";
import { 
  Upload, Search, Check, AlertCircle, Trash2, Sliders, Sparkles, Filter
} from "lucide-react";
import { LabelItem } from "../types";

interface LogoNameMapperProps {
  items: LabelItem[];
  setItems: React.Dispatch<React.SetStateAction<LabelItem[]>>;
}

export default function LogoNameMapper({ items, setItems }: LogoNameMapperProps) {
  const [logoType, setLogoType] = useState<"image" | "star" | "diamond" | "crown" | "circle" | "heart" | "shield" | "flame">("image");
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string>("");
  const [bulkLogoScale, setBulkLogoScale] = useState<number>(1.0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState<"or-else" | "replace">("replace");

  // Handle Logo Upload
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (PNG / JPG / SVG).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedLogoUrl(event.target.result as string);
          setLogoType("image");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter items matching search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
        (item.extraCode && item.extraCode.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  // Handle checking / unchecking items
  const toggleSelectItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Select all matching filter
  const selectAllFiltered = () => {
    const next = new Set(selectedIds);
    filteredItems.forEach(item => next.add(item.id));
    setSelectedIds(next);
  };

  // Deselect all matching filter
  const deselectAllFiltered = () => {
    const next = new Set(selectedIds);
    filteredItems.forEach(item => next.delete(item.id));
    setSelectedIds(next);
  };

  // Get count of names currently having any custom logos mapped
  const mappedCount = useMemo(() => {
    return items.filter(item => item.customLogoType && item.customLogoType !== "none").length;
  }, [items]);

  // Apply logo action
  const applyLogoToSelected = () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one name from the list below.");
      return;
    }

    if (logoType === "image" && !uploadedLogoUrl) {
      alert("Please upload a logo image first or choose an iconic symbol preset below.");
      return;
    }

    setItems(prevItems => 
      prevItems.map(item => {
        if (selectedIds.has(item.id)) {
          return {
            ...item,
            customLogoType: logoType,
            customLogoUrl: logoType === "image" ? uploadedLogoUrl : undefined
          };
        }
        return item;
      })
    );

    alert(`Successfully applied logo style overrides to ${selectedIds.size} selected names! 🚀`);
    // Reset selections
    setSelectedIds(new Set());
  };

  // Reset/Clear all item overrides
  const clearAllCustomSelections = () => {
    if (window.confirm("Are you sure you want to clear specific custom logos for ALL names? This reverts them back to global configuration defaults.")) {
      setItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          customLogoType: undefined,
          customLogoUrl: undefined
        }))
      );
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden" id="logo-namemapping-widget">
      {/* Widget Header */}
      <div className="bg-zinc-50 border-b border-zinc-150 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-zinc-650" />
          <h3 className="font-semibold text-zinc-900 text-sm">Personalized Name Logos</h3>
        </div>
        {mappedCount > 0 && (
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-semibold">
            {mappedCount} custom
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Step 1: Provide/Select Logo Accent URL */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-zinc-650 uppercase tracking-wider">
            1. Select Logo or Upload File
          </label>

          <select
            value={logoType}
            onChange={(e) => setLogoType(e.target.value as any)}
            className="w-full text-xs font-medium border border-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white text-zinc-800"
          >
            <option value="image">🖼️ Upload Logo File (PNG/JPG/SVG)</option>
            <option value="star">✦ Star Accent Symbol</option>
            <option value="crown">👑 Crown Accent Symbol</option>
            <option value="shield">🛡️ Shield Security Symbol</option>
            <option value="flame">🔥 Flame Premium Symbol</option>
            <option value="heart">♥ Heart Loving Symbol</option>
            <option value="diamond">♦ Diamond VIP Symbol</option>
            <option value="circle">● Circle Dot Symbol</option>
          </select>

          {logoType === "image" && (
            <div className="space-y-2">
              {uploadedLogoUrl ? (
                <div className="flex items-center gap-3 bg-zinc-50 p-2 border border-zinc-150 rounded-lg">
                  <img 
                    src={uploadedLogoUrl} 
                    className="w-10 h-10 object-contain rounded border border-zinc-200 p-0.5 bg-white shrink-0" 
                    referrerPolicy="no-referrer"
                    alt="mapped placeholder" 
                  />
                  <div className="overflow-hidden flex-1">
                    <p className="text-[10px] text-zinc-500 font-medium truncate">Provided Image Loaded</p>
                    <button
                      onClick={() => setUploadedLogoUrl("")}
                      className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      type="button"
                    >
                      <Trash2 size={10} /> Delete and Upload New
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-zinc-250 rounded-lg p-3 text-center hover:bg-zinc-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={14} className="mx-auto text-zinc-400 mb-1" />
                  <p className="text-[11px] font-medium text-zinc-500">
                    Click to upload logo image
                  </p>
                  <p className="text-[9px] text-zinc-400">Fits inside badge header row</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Choose target names from database list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold text-zinc-650 uppercase tracking-wider">
              2. Target Specific Names
            </label>
            <span className="text-[10px] text-zinc-400 shrink-0 font-medium">
              {selectedIds.size} checked
            </span>
          </div>

          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-450" />
            <input
              type="text"
              placeholder="Search or filter names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-zinc-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
            />
          </div>

          {/* Inline list of items */}
          <div className="border border-zinc-200 rounded-lg bg-zinc-50/55 max-h-[148px] overflow-y-auto divide-y divide-zinc-150">
            {filteredItems.length === 0 ? (
              <div className="p-3 text-center text-zinc-450 text-[10px] font-medium">
                No names found matching query
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                const hasCustomLogo = item.customLogoType && item.customLogoType !== "none";
                
                return (
                  <label 
                    key={item.id} 
                    className="flex items-center justify-between p-2 hover:bg-zinc-100 transition-colors cursor-pointer select-none text-left"
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item.id)}
                        className="accent-zinc-900 cursor-pointer h-3.5 w-3.5 rounded shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-semibold text-zinc-800 truncate leading-tight">
                          {item.name}
                        </p>
                        {item.subtitle && (
                          <p className="text-[9px] text-zinc-400 truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {hasCustomLogo && (
                      <span className="shrink-0 text-[8px] bg-emerald-100 text-emerald-800 font-bold uppercase rounded px-1 tracking-wider">
                        Mapped
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {/* Select all & clear filters operations */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between pt-0.5">
              <button
                onClick={selectAllFiltered}
                className="text-[10px] text-zinc-650 hover:text-zinc-900 font-bold hover:underline cursor-pointer"
                type="button"
              >
                ✓ Select All Filtered
              </button>
              <button
                onClick={deselectAllFiltered}
                className="text-[10px] text-zinc-500 hover:text-red-650 font-bold hover:underline cursor-pointer"
                type="button"
              >
                ✗ Deselect All
              </button>
            </div>
          )}
        </div>

        {/* Applying Mapping Controls */}
        <div className="pt-2 border-t border-zinc-150 flex gap-2">
          {mappedCount > 0 && (
            <button
              onClick={clearAllCustomSelections}
              title="Reset all specific custom logos"
              className="bg-zinc-50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-zinc-600 border border-zinc-250 font-semibold p-2 rounded-lg transition-colors shrink-0 cursor-pointer flex items-center justify-center"
              type="button"
            >
              <Trash2 size={13} />
            </button>
          )}
          
          <button
            onClick={applyLogoToSelected}
            disabled={selectedIds.size === 0 || (logoType === "image" && !uploadedLogoUrl)}
            className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-white disabled:bg-zinc-100 disabled:text-zinc-400 text-xs font-semibold py-2 px-3.5 rounded-lg border border-zinc-950 disabled:border-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            type="button"
          >
            <Check size={13} />
            <span>Apply Logo to {selectedIds.size} Names</span>
          </button>
        </div>
      </div>
    </div>
  );
}
