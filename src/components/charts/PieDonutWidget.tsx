import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Sector
} from 'recharts';
import { ChartConfig, ColumnMeta } from '../../types';
import { formatValue } from '../../utils/dataProcessor';

interface Props {
  config: ChartConfig;
  data: Record<string, any>[];
  columns: ColumnMeta[];
  colors: string[];
}

export const PieDonutWidget: React.FC<Props> = ({ config, data, columns, colors }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isDonut = config.type === 'donut';
  const valKey = config.yAxisKeys[0] || 'value';
  const col = columns.find((c) => c.key === valKey);

  const total = data.reduce((sum, item) => sum + (Number(item[valKey]) || 0), 0);

  const renderActiveShape = (props: any) => {
    const {
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 10}
          outerRadius={outerRadius + 13}
          fill={fill}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const sliceVal = Number(item.value);
      const pct = total > 0 ? ((sliceVal / total) * 100).toFixed(1) : '0';
      return (
        <div
          className="text-slate-100 p-3 rounded-lg shadow-2xl border border-slate-700 text-xs z-50 min-w-[150px]"
          style={{ backgroundColor: '#0f172a', opacity: 1 }}
        >
          <p className="font-semibold text-slate-200 mb-1 flex items-center gap-2 pb-1 border-b border-slate-800">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{ backgroundColor: item.payload.fill || item.color }}
            />
            <span className="truncate">{item.name}</span>
          </p>
          <div className="flex items-center justify-between gap-4 mt-1.5">
            <span className="text-slate-400">Value:</span>
            <span className="font-mono font-medium text-slate-100">
              {formatValue(sliceVal, col?.unit)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-0.5">
            <span className="text-slate-400">Share:</span>
            <span className="font-mono text-emerald-400 font-medium">{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[260px] relative flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
          {config.showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingTop: 4, color: '#cbd5e1' }}
            />
          )}
          <Pie
            activeIndex={activeIndex !== null ? activeIndex : undefined}
            activeShape={renderActiveShape}
            data={data}
            nameKey={config.xAxisKey}
            dataKey={valKey}
            cx="50%"
            cy="50%"
            innerRadius={isDonut ? '54%' : 0}
            outerRadius="78%"
            paddingAngle={isDonut ? 3 : 1}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="#0f172a"
                strokeWidth={1.5}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {isDonut && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-6 z-0">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Total
          </span>
          <span className="text-base font-bold text-slate-100 font-mono">
            {formatValue(total, col?.unit)}
          </span>
        </div>
      )}
    </div>
  );
};
