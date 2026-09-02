import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { ChartConfig, ColumnMeta } from '../../types';
import { formatValue } from '../../utils/dataProcessor';

interface Props {
  config: ChartConfig;
  data: Record<string, any>[];
  columns: ColumnMeta[];
  colors: string[];
}

export const LineChartWidget: React.FC<Props> = ({ config, data, columns, colors }) => {
  const isArea = config.type === 'area' || config.type === 'stacked_area';
  const isStacked = config.type === 'stacked_area';
  const primaryCol = columns.find((c) => c.key === config.yAxisKeys[0]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="text-slate-100 p-3 rounded-lg shadow-2xl border border-slate-700 text-xs z-50"
          style={{ backgroundColor: '#0f172a', opacity: 1 }}
        >
          <p className="font-semibold text-slate-200 mb-1.5 pb-1 border-b border-slate-700/80">
            {label}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const col = columns.find((c) => c.key === entry.dataKey);
              return (
                <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}:
                  </span>
                  <span className="font-mono font-medium text-slate-100">
                    {formatValue(entry.value, col?.unit)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const seriesKeys = config.colorKey && config.colorKey !== config.xAxisKey
    ? Object.keys(data[0] || {}).filter((k) => k !== config.xAxisKey)
    : config.yAxisKeys;

  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        {isArea ? (
          <AreaChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
            <defs>
              {seriesKeys.map((key, idx) => {
                const color = colors[idx % colors.length];
                return (
                  <linearGradient key={`grad-${key}`} id={`grad-${config.id}-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.55} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                );
              })}
            </defs>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" />}
            <XAxis
              dataKey={config.xAxisKey}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              stroke="#475569"
              angle={data.length > 8 ? -30 : 0}
              textAnchor={data.length > 8 ? 'end' : 'middle'}
              height={data.length > 8 ? 45 : 30}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(val) => formatValue(val, primaryCol?.unit)}
              stroke="#475569"
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            {config.showLegend && (
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 2, color: '#cbd5e1' }}
              />
            )}
            {config.targetBenchmark !== undefined && config.targetBenchmark !== null && (
              <ReferenceLine
                y={config.targetBenchmark}
                stroke="#f87171"
                strokeDasharray="4 4"
                label={{
                  value: `Target: ${formatValue(config.targetBenchmark, primaryCol?.unit)}`,
                  fill: '#f87171',
                  fontSize: 11,
                  position: 'top'
                }}
              />
            )}
            {seriesKeys.map((key, idx) => {
              const col = columns.find((c) => c.key === key);
              const color = colors[idx % colors.length];
              return (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={col?.name || key}
                  stroke={color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#grad-${config.id}-${key})`}
                  stackId={isStacked ? '1' : undefined}
                />
              );
            })}
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" />}
            <XAxis
              dataKey={config.xAxisKey}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              stroke="#475569"
              angle={data.length > 8 ? -30 : 0}
              textAnchor={data.length > 8 ? 'end' : 'middle'}
              height={data.length > 8 ? 45 : 30}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(val) => formatValue(val, primaryCol?.unit)}
              stroke="#475569"
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            {config.showLegend && (
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 2, color: '#cbd5e1' }}
              />
            )}
            {config.targetBenchmark !== undefined && config.targetBenchmark !== null && (
              <ReferenceLine
                y={config.targetBenchmark}
                stroke="#f87171"
                strokeDasharray="4 4"
                label={{
                  value: `Target: ${formatValue(config.targetBenchmark, primaryCol?.unit)}`,
                  fill: '#f87171',
                  fontSize: 11,
                  position: 'top'
                }}
              />
            )}
            {seriesKeys.map((key, idx) => {
              const col = columns.find((c) => c.key === key);
              const color = colors[idx % colors.length];
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={col?.name || key}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: color, strokeWidth: 1 }}
                  activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2 }}
                />
              );
            })}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
