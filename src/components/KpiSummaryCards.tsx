import React from 'react';
import { Database, TrendingUp, DollarSign, Layers, Hash, Activity } from 'lucide-react';
import { ColumnMeta } from '../types';
import { formatValue } from '../utils/dataProcessor';

interface Props {
  data: Record<string, any>[];
  totalCount: number;
  columns: ColumnMeta[];
}

export const KpiSummaryCards: React.FC<Props> = ({ data, totalCount, columns }) => {
  const numericCols = columns.filter((c) => c.type === 'number');
  const categoricalCols = columns.filter((c) => c.type === 'string');

  const filteredCount = data.length;
  const filterRatio = totalCount > 0 ? Math.round((filteredCount / totalCount) * 100) : 100;

  const primaryNumeric = numericCols[0];
  const secondaryNumeric = numericCols[1];

  const computeTotal = (col?: ColumnMeta) => {
    if (!col || data.length === 0) return 0;
    return data.reduce((sum, r) => sum + (Number(r[col.key]) || 0), 0);
  };

  const computeAvg = (col?: ColumnMeta) => {
    if (!col || data.length === 0) return 0;
    const tot = computeTotal(col);
    return Math.round((tot / data.length) * 100) / 100;
  };

  const computeMax = (col?: ColumnMeta) => {
    if (!col || data.length === 0) return 0;
    const vals = data.map((r) => Number(r[col.key])).filter((n) => !isNaN(n));
    return vals.length > 0 ? Math.max(...vals) : 0;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Records Card */}
      <div id="kpi-records-card" className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Records</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <h4 className="text-xl font-bold text-slate-100 font-mono">{filteredCount.toLocaleString()}</h4>
            <span className="text-[11px] text-slate-500 font-mono">/ {totalCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-400 font-medium">
            <span>{filterRatio}% dataset active</span>
          </div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/40 flex items-center justify-center shrink-0">
          <Database className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Primary Metric Sum */}
      {primaryNumeric && (
        <div id="kpi-primary-sum-card" className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate" title={`Total ${primaryNumeric.name}`}>
              Total {primaryNumeric.name}
            </p>
            <div className="mt-1">
              <h4 className="text-xl font-bold text-slate-100 font-mono truncate">
                {formatValue(computeTotal(primaryNumeric), primaryNumeric.unit)}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Avg: <span className="font-mono font-medium text-slate-200">{formatValue(computeAvg(primaryNumeric), primaryNumeric.unit)}</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 3. Secondary Metric */}
      {secondaryNumeric && (
        <div id="kpi-secondary-sum-card" className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate" title={`Total ${secondaryNumeric.name}`}>
              Total {secondaryNumeric.name}
            </p>
            <div className="mt-1">
              <h4 className="text-xl font-bold text-slate-100 font-mono truncate">
                {formatValue(computeTotal(secondaryNumeric), secondaryNumeric.unit)}
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Avg: <span className="font-mono font-medium text-slate-200">{formatValue(computeAvg(secondaryNumeric), secondaryNumeric.unit)}</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/40 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 4. Peak / Maximum */}
      {primaryNumeric && (
        <div id="kpi-peak-card" className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate" title={`Peak ${primaryNumeric.name}`}>
              Peak {primaryNumeric.name}
            </p>
            <div className="mt-1">
              <h4 className="text-xl font-bold text-slate-100 font-mono truncate">
                {formatValue(computeMax(primaryNumeric), primaryNumeric.unit)}
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Single maximum row</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-800/40 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 5. Dimensions & Unique entities */}
      <div id="kpi-dimensions-card" className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Dimensions</p>
          <div className="mt-1">
            <h4 className="text-xl font-bold text-slate-100 font-mono">{columns.length} Fields</h4>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {numericCols.length} metrics &bull; {categoricalCols.length} categories
          </p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-800/40 flex items-center justify-center shrink-0">
          <Hash className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
