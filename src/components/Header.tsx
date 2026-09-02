import React from 'react';
import {
  BarChart3,
  Sliders,
  Table as TableIcon,
  Sparkles,
  Upload,
  Plus,
  ChevronDown,
  Database,
  Grid2X2
} from 'lucide-react';
import { Dataset, ViewMode } from '../types';

interface Props {
  currentDataset: Dataset;
  allDatasets: Dataset[];
  onSelectDataset: (datasetId: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenImporter: () => void;
  onAddNewChart?: () => void;
}

export const Header: React.FC<Props> = ({
  currentDataset,
  allDatasets,
  onSelectDataset,
  viewMode,
  onChangeViewMode,
  onOpenImporter,
  onAddNewChart
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Dataset Selector */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-400/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-slate-100 leading-tight">Data Visualizer</h1>
                <p className="text-[11px] text-slate-400 font-medium">Interactive Analytics Suite</p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden md:block" />

            {/* Dataset Switcher Dropdown */}
            <div className="relative group min-w-0 max-w-[260px] sm:max-w-xs">
              <select
                id="dataset-selector-dropdown"
                value={currentDataset.id}
                onChange={(e) => onSelectDataset(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-200 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 truncate cursor-pointer transition-all"
              >
                {allDatasets.map((ds) => (
                  <option key={ds.id} value={ds.id} className="bg-slate-900 text-slate-200">
                    {ds.name} ({ds.data.length} rows)
                  </option>
                ))}
              </select>
              <Database className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Center / Navigation Tabs */}
          <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-0.5">
            <button
              id="tab-dashboard"
              onClick={() => onChangeViewMode('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-slate-850 bg-slate-800 text-blue-400 shadow-xs ring-1 ring-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              id="tab-studio"
              onClick={() => onChangeViewMode('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'studio'
                  ? 'bg-slate-800 text-blue-400 shadow-xs ring-1 ring-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Studio Builder</span>
            </button>

            <button
              id="tab-table"
              onClick={() => onChangeViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-blue-400 shadow-xs ring-1 ring-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Data Table</span>
            </button>

            <button
              id="tab-insights"
              onClick={() => onChangeViewMode('insights')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'insights'
                  ? 'bg-slate-800 text-blue-400 shadow-xs ring-1 ring-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {viewMode === 'dashboard' && onAddNewChart && (
              <button
                id="btn-add-chart-header"
                onClick={onAddNewChart}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Visual
              </button>
            )}

            <button
              id="btn-import-data-header"
              onClick={onOpenImporter}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors ring-1 ring-blue-400/30"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Provide Data</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs font-medium">
          <button
            onClick={() => onChangeViewMode('dashboard')}
            className={`flex items-center gap-1 px-2 py-1 rounded ${viewMode === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => onChangeViewMode('studio')}
            className={`flex items-center gap-1 px-2 py-1 rounded ${viewMode === 'studio' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Studio
          </button>
          <button
            onClick={() => onChangeViewMode('table')}
            className={`flex items-center gap-1 px-2 py-1 rounded ${viewMode === 'table' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Table
          </button>
          <button
            onClick={() => onChangeViewMode('insights')}
            className={`flex items-center gap-1 px-2 py-1 rounded ${viewMode === 'insights' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Insights
          </button>
        </div>
      </div>
    </header>
  );
};
