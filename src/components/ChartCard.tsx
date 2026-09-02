import React, { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  BarChart2,
  TrendingUp,
  PieChart,
  Grid3X3,
  Activity,
  Layers,
  Settings,
  Grid
} from 'lucide-react';
import { ChartConfig, ColumnMeta } from '../types';
import { COLOR_PALETTES } from '../data/presets';
import { aggregateData, sortAndLimitData } from '../utils/dataProcessor';

import { BarChartWidget } from './charts/BarChartWidget';
import { LineChartWidget } from './charts/LineChartWidget';
import { PieDonutWidget } from './charts/PieDonutWidget';
import { ScatterBubbleWidget } from './charts/ScatterBubbleWidget';
import { RadarWidget } from './charts/RadarWidget';
import { HeatmapMatrixWidget } from './charts/HeatmapMatrixWidget';
import { HistogramWidget } from './charts/HistogramWidget';
import { FunnelWidget } from './charts/FunnelWidget';
import { TreemapWidget } from './charts/TreemapWidget';

interface Props {
  config: ChartConfig;
  data: Record<string, any>[];
  columns: ColumnMeta[];
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onEditConfig?: () => void;
  onChangeChartType?: (type: ChartConfig['type']) => void;
}

export const ChartCard: React.FC<Props> = ({
  config,
  data,
  columns,
  isFullscreen = false,
  onToggleFullscreen,
  onDelete,
  onDuplicate,
  onEditConfig,
  onChangeChartType
}) => {
  const palette = COLOR_PALETTES.find((p) => p.id === config.colorPalette) || COLOR_PALETTES[0];

  // Process data according to config (unless specialized component like heatmap/histogram handles internally)
  const processedData = React.useMemo(() => {
    if (config.type === 'heatmap' || config.type === 'histogram' || config.type === 'scatter') {
      return data;
    }

    const aggregated = aggregateData(
      data,
      config.xAxisKey,
      config.yAxisKeys,
      config.aggregation,
      config.colorKey
    );

    return sortAndLimitData(
      aggregated,
      config.sortBy || 'value_desc',
      config.yAxisKeys[0],
      config.xAxisKey,
      config.topN
    );
  }, [data, config]);

  const renderWidget = () => {
    if (data.length === 0) {
      return (
        <div className="w-full h-full min-h-[220px] flex items-center justify-center text-slate-400 text-xs italic">
          No records match the active filter criteria.
        </div>
      );
    }

    switch (config.type) {
      case 'bar':
      case 'horizontal_bar':
      case 'stacked_bar':
        return (
          <BarChartWidget
            config={config}
            data={processedData}
            columns={columns}
            colors={palette.colors}
          />
        );

      case 'line':
      case 'area':
      case 'stacked_area':
        return (
          <LineChartWidget
            config={config}
            data={processedData}
            columns={columns}
            colors={palette.colors}
          />
        );

      case 'pie':
      case 'donut':
        return (
          <PieDonutWidget
            config={config}
            data={processedData}
            columns={columns}
            colors={palette.colors}
          />
        );

      case 'scatter':
        return (
          <ScatterBubbleWidget
            config={config}
            data={data}
            columns={columns}
            colors={palette.colors}
          />
        );

      case 'radar':
        return (
          <RadarWidget
            config={config}
            data={processedData}
            columns={columns}
            colors={palette.colors}
          />
        );

      case 'heatmap':
        return (
          <HeatmapMatrixWidget
            config={config}
            data={data}
            columns={columns}
            colors={palette.colors}
          />
        );

      case 'histogram':
        return (
          <HistogramWidget
            config={config}
            data={data}
            columns={columns}
            colors={palette.colors}
          />
        );

      case 'funnel':
        return (
          <FunnelWidget
            config={config}
            data={processedData}
            columns={columns}
            colors={palette.colors}
          />
        );

      case 'treemap':
        return (
          <TreemapWidget
            config={config}
            data={processedData}
            columns={columns}
            colors={palette.colors}
          />
        );

      default:
        return (
          <BarChartWidget
            config={config}
            data={processedData}
            columns={columns}
            colors={palette.colors}
          />
        );
    }
  };

  return (
    <div
      id={`chart-card-${config.id}`}
      className={`bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col transition-all overflow-hidden ${
        isFullscreen ? 'h-full' : 'min-h-[360px]'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/90 flex items-center justify-between gap-2 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-100 text-xs truncate" title={config.title}>
              {config.title}
            </h3>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-semibold border border-slate-800 shrink-0">
              {config.type.replace('_', ' ')}
            </span>
          </div>
          {config.description && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5" title={config.description}>
              {config.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Chart-Type Switcher Pills */}
          {onChangeChartType && !isFullscreen && (
            <div className="hidden sm:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 mr-1">
              <button
                onClick={() => onChangeChartType('bar')}
                title="Bar Chart"
                className={`p-1 rounded text-xs ${
                  config.type === 'bar' ? 'bg-slate-800 text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <BarChart2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => onChangeChartType('line')}
                title="Line Chart"
                className={`p-1 rounded text-xs ${
                  config.type === 'line' ? 'bg-slate-800 text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onChangeChartType('donut')}
                title="Donut Chart"
                className={`p-1 rounded text-xs ${
                  config.type === 'donut' ? 'bg-slate-800 text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <PieChart className="w-3 h-3" />
              </button>
              <button
                onClick={() => onChangeChartType('area')}
                title="Area Chart"
                className={`p-1 rounded text-xs ${
                  config.type === 'area' ? 'bg-slate-800 text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Activity className="w-3 h-3" />
              </button>
            </div>
          )}

          {onEditConfig && (
            <button
              onClick={onEditConfig}
              title="Customize Chart Metrics & Display"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={onDuplicate}
              title="Duplicate Widget"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              title="Remove Widget"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Widget Canvas Area */}
      <div className="p-3 flex-1 flex flex-col justify-center min-h-[260px] bg-slate-900/60">
        {renderWidget()}
      </div>
    </div>
  );
};
