import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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

export const RadarWidget: React.FC<Props> = ({ config, data, columns, colors }) => {
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
                <div key={`radar-tt-${index}`} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span
                      className="w-2 rounded-full inline-block aspect-square"
                      style={{ backgroundColor: entry.stroke }}
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

  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%" margin={{ top: 10, right: 15, bottom: 15, left: 15 }}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey={config.xAxisKey}
            tick={{ fontSize: 11, fill: '#cbd5e1' }}
          />
          <PolarRadiusAxis
            angle={30}
            stroke="#475569"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} />
          {config.showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingTop: 4, color: '#cbd5e1' }}
            />
          )}

          {config.yAxisKeys.map((key, idx) => {
            const col = columns.find((c) => c.key === key);
            const color = colors[idx % colors.length];
            return (
              <Radar
                key={key}
                name={col?.name || key}
                dataKey={key}
                stroke={color}
                fill={color}
                fillOpacity={0.4}
              />
            );
          })}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
