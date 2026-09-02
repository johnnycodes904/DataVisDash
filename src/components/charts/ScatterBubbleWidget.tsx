import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ChartConfig, ColumnMeta } from '../../types';
import { formatValue } from '../../utils/dataProcessor';

interface Props {
  config: ChartConfig;
  data: Record<string, any>[];
  columns: ColumnMeta[];
  colors: string[];
}

export const ScatterBubbleWidget: React.FC<Props> = ({ config, data, columns, colors }) => {
  const xCol = columns.find((c) => c.key === config.xAxisKey);
  const yCol = columns.find((c) => c.key === config.yAxisKeys[0]);
  const sizeCol = config.sizeKey ? columns.find((c) => c.key === config.sizeKey) : undefined;
  const colorCol = config.colorKey ? columns.find((c) => c.key === config.colorKey) : undefined;

  const categories: string[] = colorCol
    ? Array.from(new Set(data.map((r) => String(r[colorCol.key] ?? 'General'))))
    : ['General'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const row = payload[0].payload;
      return (
        <div
          className="text-slate-100 p-3 rounded-lg shadow-2xl border border-slate-700 text-xs z-50 min-w-[170px]"
          style={{ backgroundColor: '#0f172a', opacity: 1 }}
        >
          {colorCol && (
            <p className="font-semibold text-slate-200 mb-1.5 pb-1 border-b border-slate-750">
              {row[colorCol.key]}
            </p>
          )}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">{xCol?.name || config.xAxisKey}:</span>
              <span className="font-mono font-medium text-slate-100">
                {formatValue(row[config.xAxisKey], xCol?.unit)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">{yCol?.name || config.yAxisKeys[0]}:</span>
              <span className="font-mono font-medium text-slate-100">
                {formatValue(row[config.yAxisKeys[0]], yCol?.unit)}
              </span>
            </div>
            {sizeCol && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">{sizeCol.name}:</span>
                <span className="font-mono font-medium text-amber-300">
                  {formatValue(row[sizeCol.key], sizeCol.unit)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" />}
          <XAxis
            type="number"
            dataKey={config.xAxisKey}
            name={xCol?.name || config.xAxisKey}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v) => formatValue(v, xCol?.unit)}
            stroke="#475569"
          />
          <YAxis
            type="number"
            dataKey={config.yAxisKeys[0]}
            name={yCol?.name || config.yAxisKeys[0]}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v) => formatValue(v, yCol?.unit)}
            stroke="#475569"
            width={55}
          />
          {sizeCol && (
            <ZAxis
              type="number"
              dataKey={sizeCol.key}
              range={[40, 320]}
              name={sizeCol.name}
            />
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          {config.showLegend && colorCol && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingTop: 2, color: '#cbd5e1' }}
            />
          )}

          {categories.map((cat, idx) => {
            const catData = colorCol
              ? data.filter((r) => String(r[colorCol.key] ?? 'General') === cat)
              : data;
            const color = colors[idx % colors.length];

            return (
              <Scatter
                key={cat}
                name={cat}
                data={catData}
                fill={color}
                fillOpacity={0.8}
                stroke={color}
                strokeWidth={1}
              />
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
