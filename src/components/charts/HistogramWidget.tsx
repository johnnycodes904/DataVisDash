import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { ChartConfig, ColumnMeta } from '../../types';
import { generateHistogramBuckets, formatValue } from '../../utils/dataProcessor';

interface Props {
  config: ChartConfig;
  data: Record<string, any>[];
  columns: ColumnMeta[];
  colors: string[];
}

export const HistogramWidget: React.FC<Props> = ({ config, data, columns, colors }) => {
  const targetColKey = config.yAxisKeys[0] || config.xAxisKey;
  const col = columns.find((c) => c.key === targetColKey);

  const buckets = useMemo(() => {
    return generateHistogramBuckets(data, targetColKey, 8);
  }, [data, targetColKey]);

  const totalCount = buckets.reduce((sum, b) => sum + b.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0';
      return (
        <div
          className="text-slate-100 p-3 rounded-lg shadow-2xl border border-slate-700 text-xs z-50 min-w-[160px]"
          style={{ backgroundColor: '#0f172a', opacity: 1 }}
        >
          <p className="font-semibold text-slate-200 mb-1 border-b border-slate-800 pb-1">
            Range: {item.binLabel} {col?.unit || ''}
          </p>
          <div className="flex items-center justify-between gap-4 mt-1">
            <span className="text-slate-400">Frequency:</span>
            <span className="font-mono font-medium text-slate-100">{item.count} items</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-0.5">
            <span className="text-slate-400">Proportion:</span>
            <span className="font-mono text-emerald-400 font-medium">{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" />}
          <XAxis
            dataKey="binLabel"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            stroke="#475569"
            angle={-20}
            textAnchor="end"
            height={40}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            stroke="#475569"
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            name="Frequency Count"
            fill={colors[0] || '#3b82f6'}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
