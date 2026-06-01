import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Clipboard, Check, Trash2, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { LabelItem } from "../types";

interface ExcelLoaderProps {
  onNamesLoaded: (items: LabelItem[]) => void;
  currentItems: LabelItem[];
}

export default function ExcelLoader({ onNamesLoaded, currentItems }: ExcelLoaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "plain">("upload");
  const [dragActive, setDragActive] = useState(false);
  const [parsedRawData, setParsedRawData] = useState<any[][] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState({
    nameCol: -1,
    subtitleCol: -1,
    extraCol: -1,
  });
  
  const [pasteText, setPasteText] = useState("");
  const [newName, setNewName] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newExtra, setNewExtra] = useState("");
  
  const [fileName, setFileName] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    
    // Check extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    
    if (extension === "csv" || extension === "xlsx" || extension === "xls") {
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Parse with raw coordinates to find headers
          const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
          
          if (rawRows.length === 0) {
            alert("This spreadsheet appears to be empty.");
            return;
          }

          // Generate headers or simple labels
          const firstRow = rawRows[0] || [];
          const generatedHeaders = firstRow.map((cellValue, idx) => 
            cellValue ? String(cellValue).trim() : `Column ${idx + 1}`
          );

          setHeaders(generatedHeaders);
          setParsedRawData(rawRows);
          setIsSuccess(true);
          
          // Auto-guess columns
          let nameIdx = 0;
          let subtitleIdx = -1;
          let extraIdx = -1;

          generatedHeaders.forEach((h, idx) => {
            const hLower = h.toLowerCase();
            if (hLower.includes("name") || hLower.includes("full") || hLower.includes("member") || hLower.includes("guest")) {
              nameIdx = idx;
            } else if (hLower.includes("title") || hLower.includes("role") || hLower.includes("dept") || hLower.includes("designation")) {
              subtitleIdx = idx;
            } else if (hLower.includes("id") || hLower.includes("code") || hLower.includes("serial") || hLower.includes("ticket")) {
              extraIdx = idx;
            }
          });

          setMapping({
            nameCol: nameIdx,
            subtitleCol: subtitleIdx,
            extraCol: extraIdx,
          });

          applyColumnMapping(rawRows, nameIdx, subtitleIdx, extraIdx);

        } catch (error) {
          console.error("Error reading file:", error);
          alert("Could not parse this spreadsheet file. Please check its layout.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a valid .xlsx, .xls, or .csv file.");
    }
  };

  const applyColumnMapping = (rows: any[][], nameIdx: number, subIdx: number, extraIdx: number) => {
    if (!rows || rows.length === 0) return;
    
    // Assume first row is header if we successfully extracted more rows
    const dataRows = rows.slice(1);
    
    const parsedItems: LabelItem[] = dataRows
      .filter(row => row && row[nameIdx] !== undefined && String(row[nameIdx]).trim() !== "")
      .map((row, idx) => ({
        id: `row-${idx}-${Date.now()}`,
        name: String(row[nameIdx]).trim(),
        subtitle: subIdx !== -1 && row[subIdx] !== undefined ? String(row[subIdx]).trim() : "",
        extraCode: extraIdx !== -1 && row[extraIdx] !== undefined ? String(row[extraIdx]).trim() : "",
      }));

    onNamesLoaded(parsedItems);
  };

  const handleUpdateMapping = (field: "nameCol" | "subtitleCol" | "extraCol", value: number) => {
    const updated = { ...mapping, [field]: value };
    setMapping(updated);
    if (parsedRawData) {
      applyColumnMapping(parsedRawData, updated.nameCol, updated.subtitleCol, updated.extraCol);
    }
  };

  const parseClipboardText = () => {
    if (!pasteText.trim()) return;
    
    const lines = pasteText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    const parsedItems: LabelItem[] = lines.map((line, idx) => {
      // Check if we can split by tab/comma to get subtitles
      const parts = line.split(/[\t,]/);
      return {
        id: `paste-${idx}-${Date.now()}`,
        name: parts[0]?.trim() || "",
        subtitle: parts[1]?.trim() || "",
        extraCode: parts[2]?.trim() || "",
      };
    });

    onNamesLoaded(parsedItems);
    setPasteText("");
    alert(`Successfully loaded ${parsedItems.length} names from paste board!`);
  };

  const handleAddSingleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: LabelItem = {
      id: `manual-${Date.now()}`,
      name: newName.trim(),
      subtitle: newSubtitle.trim() || undefined,
      extraCode: newExtra.trim() || undefined,
    };

    onNamesLoaded([...currentItems, newItem]);
    setNewName("");
    setNewSubtitle("");
    setNewExtra("");
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all names?")) {
      onNamesLoaded([]);
      setParsedRawData(null);
      setHeaders([]);
      setFileName("");
      setIsSuccess(false);
    }
  };

  const removeSingleItem = (id: string) => {
    onNamesLoaded(currentItems.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden" id="excel-loader-widget">
      {/* Tabs */}
      <div className="flex border-b border-zinc-100 bg-zinc-50">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === "upload"
              ? "border-zinc-900 text-zinc-900 bg-white"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
          type="button"
          id="tab-excel-upload"
        >
          <FileSpreadsheet size={16} />
          <span>Load Spreadsheet</span>
        </button>
        <button
          onClick={() => setActiveTab("plain")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === "plain"
              ? "border-zinc-900 text-zinc-900 bg-white"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
          type="button"
          id="tab-paste-board"
        >
          <Clipboard size={16} />
          <span>Paste / Manual Input</span>
        </button>
      </div>

      <div className="p-5">
        {activeTab === "upload" && (
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors relative ${
                dragActive
                  ? "border-zinc-900 bg-zinc-50"
                  : isSuccess
                  ? "border-emerald-500 bg-emerald-50/10"
                  : "border-zinc-200 hover:border-zinc-300 bg-white"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              id="file-drop-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center gap-2">
                {isSuccess ? (
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                    <Check size={24} />
                  </div>
                ) : (
                  <div className="p-3 bg-zinc-100 text-zinc-500 rounded-full">
                    <Upload size={24} />
                  </div>
                )}
                
                {isSuccess ? (
                  <div>
                    <p className="font-semibold text-zinc-800 text-sm">Successfully Loaded!</p>
                    <p className="text-zinc-500 text-xs mt-0.5 max-w-xs mx-auto truncate" title={fileName}>
                      {fileName}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-zinc-800 text-sm">Drag excel sheet here, or browse files</p>
                    <p className="text-zinc-400 text-xs mt-1">Supports Excel (.xlsx, .xls) and CSV files</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column Mapping Selector (visible if we have parsed headers) */}
            {parsedRawData && headers.length > 0 && (
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  <RefreshCw size={12} className="text-zinc-500 animate-spin-slow" />
                  <span>Map Spreadsheet Columns</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Name Column selector */}
                  <div>
                    <label className="block text-xs text-zinc-500 font-medium mb-1">Sticker Name</label>
                    <select
                      value={mapping.nameCol}
                      onChange={(e) => handleUpdateMapping("nameCol", parseInt(e.target.value))}
                      className="w-full text-xs bg-white border border-zinc-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    >
                      {headers.map((h, idx) => (
                        <option key={idx} value={idx}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subtitle / Role Column selector */}
                  <div>
                    <label className="block text-xs text-zinc-500 font-medium mb-1">Subtitle / Line 2</label>
                    <select
                      value={mapping.subtitleCol}
                      onChange={(e) => handleUpdateMapping("subtitleCol", parseInt(e.target.value))}
                      className="w-full text-xs bg-white border border-zinc-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    >
                      <option value={-1}>-- Ignore column --</option>
                      {headers.map((h, idx) => (
                        <option key={idx} value={idx}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ID / Code column selector */}
                  <div>
                    <label className="block text-xs text-zinc-500 font-medium mb-1">Code / Footer ID</label>
                    <select
                      value={mapping.extraCol}
                      onChange={(e) => handleUpdateMapping("extraCol", parseInt(e.target.value))}
                      className="w-full text-xs bg-white border border-zinc-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    >
                      <option value={-1}>-- Ignore column --</option>
                      {headers.map((h, idx) => (
                        <option key={idx} value={idx}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <p className="text-[10px] text-zinc-400">
                  Tip: Change column mapping above to instantly refresh the label cards below.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "plain" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Paste names (One name per line)
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="John Doe&#10;Alice Smith, Developer&#10;Bob Rogers, Designer, VIP-001"
                rows={4}
                className="w-full text-xs border border-zinc-200 rounded-lg p-3 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-900"
                id="raw-names-paste-box"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Formats: List names directly, or separate details using commas (Name, Subtitle, Code).
              </p>
            </div>
            
            <button
              onClick={parseClipboardText}
              disabled={!pasteText.trim()}
              className="w-full bg-zinc-900 hover:bg-zinc-850 text-white font-medium text-xs py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              id="btn-process-pasted-names"
            >
              Parse and Compile Names
            </button>
          </div>
        )}

        {/* Manual Addition Form & Current Count */}
        <div className="mt-5 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-700 tracking-wide uppercase">
              Current List ({currentItems.length} Names Loaded)
            </span>
            {currentItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-red-500 hover:text-red-600 text-xs font-medium flex items-center gap-1"
                type="button"
                id="btn-clear-all-labels"
              >
                <Trash2 size={13} />
                <span>Reset List</span>
              </button>
            )}
          </div>

          {/* Mini Scrollable List showing current elements */}
          {currentItems.length > 0 ? (
            <div className="max-h-40 overflow-y-auto border border-zinc-100 rounded-lg divide-y divide-zinc-50 mb-4 bg-zinc-50/50">
              {currentItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 hover:bg-zinc-50 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-zinc-400 font-mono w-4 text-right">{index + 1}.</span>
                    <div>
                      <p className="font-medium text-zinc-800 truncate">{item.name}</p>
                      {(item.subtitle || item.extraCode) && (
                        <p className="text-[10px] text-zinc-400 truncate">
                          {item.subtitle} {item.extraCode && `· [${item.extraCode}]`}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSingleItem(item.id)}
                    className="text-zinc-400 hover:text-red-500 p-1"
                    title="Remove from sheet"
                    type="button"
                    id={`remove-item-${index}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-zinc-400 bg-zinc-50/30 border border-dashed border-zinc-100 rounded-lg flex flex-col items-center justify-center gap-1.5">
              <AlertCircle size={16} />
              <p className="text-xs">No active names. Add or upload list above to test.</p>
            </div>
          )}

          {/* Quick single add */}
          <form onSubmit={handleAddSingleItem} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Add name manually..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-xs border border-zinc-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              required
            />
            <input
              type="text"
              placeholder="Subtitle (eg. Director)"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              className="text-xs border border-zinc-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ID Code"
                value={newExtra}
                onChange={(e) => setNewExtra(e.target.value)}
                className="text-xs border border-zinc-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 flex-1 min-w-0"
              />
              <button
                type="submit"
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded p-1.5 transition-colors aspect-square flex items-center justify-center shrink-0"
                id="btn-add-individual-name"
              >
                <Plus size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
