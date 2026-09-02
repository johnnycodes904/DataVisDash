import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { ChartConfig, ColumnMeta } from '../../types';
import { formatValue } from '../../utils/dataProcessor';

interface Props {
  config: ChartConfig;
  data: Record<string, any>[];
  columns: ColumnMeta[];
  colors: string[];
}

const CustomizedTreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name, value, colors, unit } = props;

  // Do not render the root container node (depth 0) to avoid overlay ghosting
  if (depth === 0 && root?.children && root.children.length > 0) return null;
  if (width < 32 || height < 28) return null;

  const color = colors[index % colors.length] || '#3b82f6';

  return (
    <g>
      {/* Background Cell Rectangle */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="#0f172a"
        strokeWidth={2}
        rx={6}
        ry={6}
      />

      {/* Text Container: Explicitly set stroke="none" to prevent SVG stroke inheritance */}
      {width > 50 && height > 36 && (
        <g style={{ stroke: 'none' }}>
          <text
            x={x + width / 2}
            y={y + height / 2 - 7}
            textAnchor="middle"
            fill="#ffffff"
            stroke="none"
            fontSize={12}
            fontWeight={600}
            className="select-none pointer-events-none"
            style={{
              fill: '#ffffff',
              stroke: 'none',
              textRendering: 'geometricPrecision'
            }}
          >
            {name && name.length > 15 ? `${name.substring(0, 13)}...` : name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 9}
            textAnchor="middle"
            fill="#f1f5f9"
            stroke="none"
            fontSize={11}
            fontWeight={500}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            className="select-none pointer-events-none"
            style={{
              fill: '#f1f5f9',
              stroke: 'none',
              textRendering: 'geometricPrecision'
            }}
          >
            {formatValue(value, unit)}
          </text>
        </g>
      )}
    </g>
  );
};

export const TreemapWidget: React.FC<Props> = ({ config, data, columns, colors }) => {
  const labelKey = config.xAxisKey;
  const valKey = config.yAxisKeys[0] || 'value';
  const valCol = columns.find((c) => c.key === valKey);

  const formattedData = data.map((d) => ({
    name: String(d[labelKey] || 'Unknown'),
    value: Math.max(0, Number(d[valKey]) || 0)
  }));

  const total = formattedData.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      return (
        <div
          className="text-slate-100 p-3 rounded-lg shadow-2xl border border-slate-700 text-xs z-50 min-w-[150px]"
          style={{ backgroundColor: '#0f172a', opacity: 1 }}
        >
          <p className="font-semibold text-slate-200 mb-1 border-b border-slate-800 pb-1">
            {item.name}
          </p>
          <div className="flex items-center justify-between gap-4 mt-1">
            <span className="text-slate-400">Value:</span>
            <span className="font-mono font-medium text-slate-100">
              {formatValue(item.value, valCol?.unit)}
            </span>
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
        <Treemap
          data={formattedData}
          dataKey="value"
          fill="#3b82f6"
          content={<CustomizedTreemapContent colors={colors} unit={valCol?.unit} />}
        >
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
};
