import React, { useMemo } from 'react';
import { ChartConfig, ColumnMeta } from '../../types';
import { generateHeatmapMatrix, formatValue } from '../../utils/dataProcessor';

interface Props {
  config: ChartConfig;
  data: Record<string, any>[];
  columns: ColumnMeta[];
  colors: string[];
}

export const HeatmapMatrixWidget: React.FC<Props> = ({ config, data, columns, colors }) => {
  const rowKey = config.xAxisKey;
  const colKey = config.colorKey || (columns.find((c) => c.type === 'string' && c.key !== rowKey)?.key || rowKey);
  const valKey = config.yAxisKeys[0] || (columns.find((c) => c.type === 'number')?.key || '');
  const valCol = columns.find((c) => c.key === valKey);

  const { rows, cols, matrix, maxVal, minVal } = useMemo(() => {
    return generateHeatmapMatrix(data, rowKey, colKey, valKey, config.aggregation);
  }, [data, rowKey, colKey, valKey, config.aggregation]);

  const getColorIntensity = (val: number) => {
    if (maxVal === minVal || maxVal === 0) return 'rgba(59, 130, 246, 0.2)';
    const ratio = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
    const opacity = 0.12 + ratio * 0.85;
    return `rgba(59, 130, 246, ${opacity.toFixed(2)})`;
  };

  const getTextColor = (val: number) => {
    if (maxVal === minVal || maxVal === 0) return '#cbd5e1';
    const ratio = (val - minVal) / (maxVal - minVal);
    return ratio > 0.4 ? '#ffffff' : '#94a3b8';
  };

  if (!rows.length || !cols.length) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center text-slate-400 text-xs">
        Select a valid categorical breakdown dimension to render the matrix heatmap.
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-1 flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-400 font-medium border-b border-slate-700 bg-slate-950/60">
                {columns.find((c) => c.key === rowKey)?.name || rowKey} \ {columns.find((c) => c.key === colKey)?.name || colKey}
              </th>
              {cols.map((col) => (
                <th
                  key={col}
                  className="p-2 text-center text-slate-200 font-semibold border-b border-slate-700 bg-slate-950/60 truncate max-w-[100px]"
                  title={col}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                <td className="p-2 font-medium text-slate-300 whitespace-nowrap max-w-[120px] truncate" title={row}>
                  {row}
                </td>
                {cols.map((col) => {
                  const cell = matrix.find((m) => m.row === row && m.col === col);
                  const val = cell ? cell.value : 0;
                  return (
                    <td
                      key={`${row}-${col}`}
                      className="p-2 text-center transition-all cursor-default relative group"
                      style={{ backgroundColor: getColorIntensity(val) }}
                    >
                      <span
                        className="font-mono text-[11px] font-semibold block"
                        style={{ color: getTextColor(val) }}
                      >
                        {formatValue(val, valCol?.unit)}
                      </span>
                      {/* Tooltip on hover */}
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 bg-slate-900 border border-slate-700 text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap pointer-events-none">
                        <div className="font-semibold">{row} &times; {col}</div>
                        <div>{valCol?.name || valKey}: {formatValue(val, valCol?.unit)}</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Color Scale Legend */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <span>Min ({formatValue(minVal, valCol?.unit)})</span>
        <div
          className="w-24 h-2.5 rounded-full"
          style={{
            background: `linear-gradient(to right, rgba(59,130,246,0.15), rgba(59,130,246,0.95))`
          }}
        />
        <span>Max ({formatValue(maxVal, valCol?.unit)})</span>
      </div>
    </div>
  );
};
