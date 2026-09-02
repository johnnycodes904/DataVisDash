import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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

export const BarChartWidget: React.FC<Props> = ({ config, data, columns, colors }) => {
  const isHorizontal = config.type === 'horizontal_bar';
  const isStacked = config.type === 'stacked_bar';
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
        <BarChart
          data={data}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 12, right: 16, left: isHorizontal ? 32 : 4, bottom: 20 }}
        >
          {config.showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={!isHorizontal} />
          )}

          {isHorizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(val) => formatValue(val, primaryCol?.unit)}
                stroke="#475569"
              />
              <YAxis
                type="category"
                dataKey={config.xAxisKey}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                stroke="#475569"
                width={80}
              />
            </>
          ) : (
            <>
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
            </>
          )}

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
              y={!isHorizontal ? config.targetBenchmark : undefined}
              x={isHorizontal ? config.targetBenchmark : undefined}
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
              <Bar
                key={key}
                dataKey={key}
                name={col?.name || key}
                fill={color}
                stackId={isStacked ? 'stack' : undefined}
                radius={isStacked ? [0, 0, 0, 0] : isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
