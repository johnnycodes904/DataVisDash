import React from 'react';
import {
  BarChart2,
  TrendingUp,
  PieChart,
  Grid3X3,
  ScatterChart as ScatterIcon,
  Activity,
  Layers,
  Palette,
  Sliders,
  Filter,
  Check
} from 'lucide-react';
import { ChartConfig, ColumnMeta, ChartType, AggregationType } from '../types';
import { COLOR_PALETTES } from '../data/presets';

interface Props {
  config: ChartConfig;
  columns: ColumnMeta[];
  onChange: (newConfig: ChartConfig) => void;
}

export const ChartConfigPanel: React.FC<Props> = ({ config, columns, onChange }) => {
  const numericCols = columns.filter((c) => c.type === 'number');
  const categoricalCols = columns.filter((c) => c.type === 'string' || c.type === 'date');

  const chartTypes: { id: ChartType; label: string; icon: any }[] = [
    { id: 'bar', label: 'Bar', icon: BarChart2 },
    { id: 'horizontal_bar', label: 'Horizontal', icon: BarChart2 },
    { id: 'stacked_bar', label: 'Stacked Bar', icon: Layers },
    { id: 'line', label: 'Line Trend', icon: TrendingUp },
    { id: 'area', label: 'Area Fill', icon: Activity },
    { id: 'donut', label: 'Donut', icon: PieChart },
    { id: 'pie', label: 'Pie', icon: PieChart },
    { id: 'scatter', label: 'Scatter', icon: ScatterIcon },
    { id: 'radar', label: 'Radar Spider', icon: Activity },
    { id: 'heatmap', label: '2D Heatmap', icon: Grid3X3 },
    { id: 'histogram', label: 'Histogram', icon: BarChart2 },
    { id: 'funnel', label: 'Funnel', icon: Filter },
    { id: 'treemap', label: 'Treemap', icon: Grid3X3 }
  ];

  const aggregations: { id: AggregationType; label: string }[] = [
    { id: 'sum', label: 'Sum (Total)' },
    { id: 'avg', label: 'Average (Mean)' },
    { id: 'count', label: 'Row Count' },
    { id: 'distinct', label: 'Distinct Count' },
    { id: 'min', label: 'Minimum' },
    { id: 'max', label: 'Maximum' }
  ];

  const handleUpdate = (field: keyof ChartConfig, val: any) => {
    onChange({
      ...config,
      [field]: val
    });
  };

  const handleToggleYMetric = (colKey: string) => {
    const current = config.yAxisKeys || [];
    let updated: string[];
    if (current.includes(colKey)) {
      if (current.length === 1) return; // Keep at least one
      updated = current.filter((k) => k !== colKey);
    } else {
      updated = [...current, colKey];
    }
    handleUpdate('yAxisKeys', updated);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Chart Title */}
      <div>
        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
          Visual Title
        </label>
        <input
          id="config-chart-title-input"
          type="text"
          value={config.title}
          onChange={(e) => handleUpdate('title', e.target.value)}
          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          placeholder="Chart Title..."
        />
      </div>

      {/* 2. Visual Type Selection */}
      <div>
        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
          Visualization Format
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {chartTypes.map((t) => {
            const Icon = t.icon;
            const isSelected = config.type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleUpdate('type', t.id)}
                className={`p-2 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  isSelected
                    ? 'bg-blue-950/80 border-blue-600 text-blue-400 font-semibold ring-1 ring-blue-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate text-[11px]">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Dimension & Metric Mapping */}
      <div className="space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            X-Axis Dimension / Group By
          </label>
          <select
            id="config-xaxis-select"
            value={config.xAxisKey}
            onChange={(e) => handleUpdate('xAxisKey', e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {columns.map((c) => (
              <option key={c.key} value={c.key} className="bg-slate-900">
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Y-Axis Metrics / Values
          </label>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {numericCols.map((c) => {
              const isChecked = config.yAxisKeys.includes(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => handleToggleYMetric(c.key)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-left flex items-center justify-between text-xs transition-colors ${
                    isChecked
                      ? 'bg-blue-950/80 border-blue-700/80 text-blue-300 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {isChecked && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Aggregation Function */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Calculation / Aggregation
          </label>
          <select
            id="config-aggregation-select"
            value={config.aggregation}
            onChange={(e) => handleUpdate('aggregation', e.target.value as AggregationType)}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {aggregations.map((agg) => (
              <option key={agg.id} value={agg.id} className="bg-slate-900">
                {agg.label}
              </option>
            ))}
          </select>
        </div>

        {/* Secondary Category / Hue breakdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Secondary Category / Color Group (Optional)
          </label>
          <select
            value={config.colorKey || ''}
            onChange={(e) => handleUpdate('colorKey', e.target.value || undefined)}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="" className="bg-slate-900">None (Single series)</option>
            {categoricalCols.map((c) => (
              <option key={c.key} value={c.key} className="bg-slate-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Color Palette Selection */}
      <div>
        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
          Color Harmony
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_PALETTES.map((p) => {
            const isSelected = config.colorPalette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleUpdate('colorPalette', p.id)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-950/80 border-blue-600 ring-1 ring-blue-500/40'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  {p.colors.slice(0, 5).map((col, i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-slate-300 block truncate">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Fine Tuning: Sort, Top-N, Benchmark Target */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Sorting Order
            </label>
            <select
              value={config.sortBy || 'value_desc'}
              onChange={(e) => handleUpdate('sortBy', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none"
            >
              <option value="value_desc" className="bg-slate-900">Highest Value (Desc)</option>
              <option value="value_asc" className="bg-slate-900">Lowest Value (Asc)</option>
              <option value="label_asc" className="bg-slate-900">Label (A &rarr; Z)</option>
              <option value="none" className="bg-slate-900">Original Order</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Limit Items (Top-N)
            </label>
            <input
              type="number"
              min="2"
              max="50"
              placeholder="All items"
              value={config.topN || ''}
              onChange={(e) =>
                handleUpdate('topN', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Target Benchmark Reference Line (Optional)
          </label>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={config.targetBenchmark ?? ''}
            onChange={(e) =>
              handleUpdate(
                'targetBenchmark',
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 text-xs focus:outline-none"
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-4 pt-1">
          <label className="flex items-center gap-1.5 text-slate-300 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={config.showGrid ?? true}
              onChange={(e) => handleUpdate('showGrid', e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>Show Gridlines</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-300 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={config.showLegend ?? true}
              onChange={(e) => handleUpdate('showLegend', e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>Show Legend</span>
          </label>
        </div>
      </div>
    </div>
  );
};
