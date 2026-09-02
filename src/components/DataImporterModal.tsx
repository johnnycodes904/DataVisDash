import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle,
  Database,
  ArrowRight
} from 'lucide-react';
import Papa from 'papaparse';
import { Dataset, ColumnMeta } from '../types';
import { inferColumnTypes } from '../utils/dataProcessor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportDataset: (dataset: Dataset) => void;
  currentDatasetId?: string;
}

export const DataImporterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImportDataset
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'preset'>('upload');
  const [datasetName, setDatasetName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    columns: ColumnMeta[];
    data: Record<string, any>[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processRawData = (rows: Record<string, any>[], defaultTitle: string) => {
    if (!rows || rows.length === 0) {
      setErrorMessage('No valid data records could be extracted.');
      return;
    }

    // Filter out completely empty rows
    const cleanRows = rows.filter((r) =>
      Object.values(r).some((v) => v !== null && v !== undefined && String(v).trim() !== '')
    );

    if (cleanRows.length === 0) {
      setErrorMessage('Parsed data contains only empty rows.');
      return;
    }

    const columns = inferColumnTypes(cleanRows);
    setParsedPreview({
      columns,
      data: cleanRows
    });
    if (!datasetName) {
      setDatasetName(defaultTitle);
    }
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const fileName = file.name.replace(/\.[^/.]+$/, '');

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const arrayData = Array.isArray(json) ? json : json.data || json.rows || [json];
          processRawData(arrayData, fileName);
        } catch (err: any) {
          setErrorMessage(`Invalid JSON file: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      // CSV / TSV
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0 && results.data.length === 0) {
            setErrorMessage(`CSV Parsing error: ${results.errors[0].message}`);
          } else {
            processRawData(results.data as Record<string, any>[], fileName);
          }
        }
      });
    }
  };

  const handleParsePastedText = () => {
    setErrorMessage(null);
    const trimmed = pastedText.trim();
    if (!trimmed) {
      setErrorMessage('Please paste your CSV or JSON data first.');
      return;
    }

    // Try parsing as JSON first
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const json = JSON.parse(trimmed);
        const arrayData = Array.isArray(json) ? json : json.data || json.rows || [json];
        processRawData(arrayData, 'Pasted JSON Dataset');
        return;
      } catch (err) {
        // Fallback to CSV
      }
    }

    // Parse as CSV
    Papa.parse(trimmed, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setErrorMessage('Could not parse any rows from the pasted text.');
        } else {
          processRawData(results.data as Record<string, any>[], 'Pasted CSV Dataset');
        }
      }
    });
  };

  const handleFinalizeImport = () => {
    if (!parsedPreview || parsedPreview.data.length === 0) return;

    const newDataset: Dataset = {
      id: `dataset-${Date.now()}`,
      name: datasetName.trim() || 'Custom User Dataset',
      description: `Imported dataset containing ${parsedPreview.data.length} records across ${parsedPreview.columns.length} dimensions.`,
      columns: parsedPreview.columns,
      data: parsedPreview.data,
      source: 'custom',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onImportDataset(newDataset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Provide & Import Data</h3>
              <p className="text-[11px] text-slate-400">
                Supply your own tabular data (CSV, JSON) for real-time visualization.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 gap-6 text-xs">
          <button
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Upload File (CSV / JSON)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('paste');
              setErrorMessage(null);
            }}
            className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Paste Raw Text / CSV</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'upload' && !parsedPreview && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 hover:bg-slate-850/60 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 mx-auto flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Click to browse or drop your CSV / JSON file here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports comma/tab-separated CSVs or arrays of JSON objects.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {activeTab === 'paste' && !parsedPreview && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Paste raw CSV or JSON data:
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Month,Region,Sales,Profit\nJan,North,45000,12000\nFeb,South,32000,8500\n...`}
                rows={7}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                onClick={handleParsePastedText}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Parse & Inspect Data
              </button>
            </div>
          )}

          {/* Preview State */}
          {parsedPreview && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>
                    Successfully parsed <strong>{parsedPreview.data.length} rows</strong> and inferred{' '}
                    <strong>{parsedPreview.columns.length} columns</strong>.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setParsedPreview(null);
                    setPastedText('');
                  }}
                  className="text-xs font-semibold underline hover:text-emerald-200"
                >
                  Choose Different File
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dataset Name
                </label>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="e.g. Q1 Marketing Campaign Results"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium"
                />
              </div>

              {/* Column Schema preview */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Inferred Schema & Data Types
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {parsedPreview.columns.map((c) => (
                    <div
                      key={c.key}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center gap-1.5"
                    >
                      <span className="font-semibold text-slate-200">{c.name}</span>
                      <span
                        className={`text-[10px] uppercase font-mono px-1 rounded ${
                          c.type === 'number'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                            : c.type === 'date'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {c.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sample Table */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Sample Data (First 4 Rows)
                </label>
                <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-300">
                      <tr>
                        {parsedPreview.columns.map((c) => (
                          <th key={c.key} className="p-2 font-semibold">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {parsedPreview.data.slice(0, 4).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-900/60">
                          {parsedPreview.columns.map((c) => (
                            <td key={c.key} className="p-2 font-mono text-slate-300">
                              {String(row[c.key] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            disabled={!parsedPreview || parsedPreview.data.length === 0}
            onClick={handleFinalizeImport}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <span>Load Into Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
