import React, { useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  Link2,
  PieChart,
  BarChart2,
  CheckCircle
} from 'lucide-react';
import { Dataset } from '../types';
import { calculateCorrelations, formatValue } from '../utils/dataProcessor';

interface Props {
  dataset: Dataset;
  filteredData: Record<string, any>[];
}

export const InsightsDrawer: React.FC<Props> = ({ dataset, filteredData }) => {
  const numericCols = dataset.columns.filter((c) => c.type === 'number');
  const categoricalCols = dataset.columns.filter((c) => c.type === 'string');

  // Correlations
  const correlations = useMemo(() => {
    return calculateCorrelations(filteredData, numericCols);
  }, [filteredData, numericCols]);

  // Top segment dominance
  const categoryInsights = useMemo(() => {
    if (categoricalCols.length === 0 || numericCols.length === 0 || filteredData.length === 0)
      return [];

    const primaryCat = categoricalCols[0];
    const primaryNum = numericCols[0];

    const groupSum: Record<string, number> = {};
    let total = 0;

    filteredData.forEach((row) => {
      const cat = String(row[primaryCat.key] ?? 'Unknown');
      const val = Number(row[primaryNum.key]) || 0;
      groupSum[cat] = (groupSum[cat] || 0) + val;
      total += val;
    });

    const sorted = Object.entries(groupSum).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return [];

    const topItem = sorted[0];
    const topPct = total > 0 ? Math.round((topItem[1] / total) * 100) : 0;

    return [
      {
        categoryName: primaryCat.name,
        metricName: primaryNum.name,
        topSegment: topItem[0],
        topValue: topItem[1],
        percentage: topPct,
        unit: primaryNum.unit
      }
    ];
  }, [filteredData, categoricalCols, numericCols]);

  // Outliers & Extremes
  const extremes = useMemo(() => {
    if (numericCols.length === 0 || filteredData.length === 0) return [];
    return numericCols.slice(0, 3).map((col) => {
      const vals = filteredData.map((r) => Number(r[col.key])).filter((n) => !isNaN(n));
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length > 0 ? sum / vals.length : 0;
      return {
        colName: col.name,
        min,
        max,
        avg: Math.round(avg * 100) / 100,
        unit: col.unit
      };
    });
  }, [filteredData, numericCols]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-blue-800/40 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Automated Statistical Intelligence</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Mathematical analysis, linear correlation pairs, and distribution insights computed dynamically across active filtered records.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-xl backdrop-blur-xs text-xs font-mono text-slate-300">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{filteredData.length} records analyzed</span>
        </div>
      </div>

      {/* Grid of Statistical Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Correlation Matrix / Relationship Discovery */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-400" />
              Linear Correlations (Pearson r)
            </h4>
            <span className="text-[11px] text-slate-400">Scale: -1.0 to +1.0</span>
          </div>

          {correlations.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Need at least 2 numerical metrics to calculate bivariate correlations.
            </p>
          ) : (
            <div className="space-y-3">
              {correlations.slice(0, 5).map((corr, idx) => {
                const abs = Math.abs(corr.correlation);
                const isStrong = abs >= 0.7;
                const isModerate = abs >= 0.4 && abs < 0.7;
                const badgeColor =
                  corr.correlation > 0
                    ? isStrong
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80'
                      : 'bg-blue-950/90 text-blue-300 border-blue-700/80'
                    : 'bg-rose-950/90 text-rose-300 border-rose-700/80';

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <span className="truncate">{corr.col1}</span>
                        <span className="text-slate-500 font-normal">&harr;</span>
                        <span className="truncate">{corr.col2}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isStrong
                          ? 'Strong linear relationship'
                          : isModerate
                          ? 'Moderate association'
                          : 'Weak / independent relationship'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md border ${badgeColor}`}
                      >
                        {corr.correlation > 0 ? `+${corr.correlation}` : corr.correlation}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Dominance & Distribution Insights */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Segment Concentration & Dominance
            </h4>
          </div>

          {categoryInsights.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No categorical fields available for concentration analysis.</p>
          ) : (
            <div className="space-y-4">
              {categoryInsights.map((ins, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-amber-900/60 bg-amber-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300">
                      Top Dominant Segment
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {ins.percentage}% share
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">
                    <strong className="text-white">{ins.topSegment}</strong> accounts for{' '}
                    <strong className="text-amber-300 font-mono">
                      {formatValue(ins.topValue, ins.unit)}
                    </strong>{' '}
                    ({ins.percentage}%) of all cumulative {ins.metricName}.
                  </p>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, ins.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}

              {/* Min/Max summary tiles */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Metric Ranges & Variance
                </p>
                {extremes.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-xs"
                  >
                    <span className="font-semibold text-slate-200">{ex.colName}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-400">Min: <strong className="text-slate-200">{formatValue(ex.min, ex.unit)}</strong></span>
                      <span className="text-slate-400">Avg: <strong className="text-blue-400">{formatValue(ex.avg, ex.unit)}</strong></span>
                      <span className="text-slate-400">Max: <strong className="text-emerald-400">{formatValue(ex.max, ex.unit)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
