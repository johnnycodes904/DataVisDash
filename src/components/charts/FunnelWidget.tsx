import React from 'react';
import { ChartConfig, ColumnMeta } from '../../types';
import { formatValue } from '../../utils/dataProcessor';

interface Props {
  config: ChartConfig;
  data: Record<string, any>[];
  columns: ColumnMeta[];
  colors: string[];
}

export const FunnelWidget: React.FC<Props> = ({ config, data, columns, colors }) => {
  const labelKey = config.xAxisKey;
  const valKey = config.yAxisKeys[0] || 'value';
  const valCol = columns.find((c) => c.key === valKey);

  const sortedData = [...data].sort((a, b) => (Number(b[valKey]) || 0) - (Number(a[valKey]) || 0));
  const maxVal = sortedData.length > 0 ? Number(sortedData[0][valKey]) || 1 : 1;

  return (
    <div className="w-full h-full min-h-[260px] flex flex-col justify-center px-4 py-2 space-y-2.5 overflow-y-auto">
      {sortedData.map((item, idx) => {
        const val = Number(item[valKey]) || 0;
        const widthPct = Math.max(18, Math.round((val / maxVal) * 100));
        const prevVal = idx > 0 ? Number(sortedData[idx - 1][valKey]) || val : val;
        const stepConversion = prevVal > 0 ? ((val / prevVal) * 100).toFixed(1) : '100';
        const color = colors[idx % colors.length];

        return (
          <div key={`funnel-${idx}`} className="w-full">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                {idx + 1}. {item[labelKey]}
              </span>
              <div className="flex items-center gap-3">
                {idx > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                    &darr; {stepConversion}%
                  </span>
                )}
                <span className="font-mono font-bold text-slate-100">
                  {formatValue(val, valCol?.unit)}
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-800/80 rounded-lg h-7 overflow-hidden relative flex items-center shadow-inner border border-slate-700/50">
              <div
                className="h-full rounded-lg transition-all duration-500 flex items-center justify-end px-3 text-white font-medium text-xs shadow-sm"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: color
                }}
              >
                <span className="font-mono text-[11px] drop-shadow-sm font-semibold">
                  {Math.round((val / maxVal) * 100)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
