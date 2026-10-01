import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  LayoutGrid,
  Columns2,
  Columns3,
  Sliders,
  RotateCcw,
  Sparkles,
  Download,
  Share2,
  FileSpreadsheet
} from 'lucide-react';
import {
  Dataset,
  ChartConfig,
  FilterRule,
  ViewMode,
  ColumnMeta
} from './types';
import { PRESET_DATASETS, COLOR_PALETTES } from './data/presets';
import { filterDataset, inferColumnTypes } from './utils/dataProcessor';

import { Header } from './components/Header';
import { KpiSummaryCards } from './components/KpiSummaryCards';
import { FilterBar } from './components/FilterBar';
import { ChartCard } from './components/ChartCard';
import { ChartConfigPanel } from './components/ChartConfigPanel';
import { DataImporterModal } from './components/DataImporterModal';
import { DataTableEditor } from './components/DataTableEditor';
import { InsightsDrawer } from './components/InsightsDrawer';

// Helper to construct sensible default charts for any dataset schema
function generateDefaultChartsForDataset(dataset: Dataset): ChartConfig[] {
  const numericCols = dataset.columns.filter((c) => c.type === 'number');
  const categoricalCols = dataset.columns.filter((c) => c.type === 'string');
  const dateCols = dataset.columns.filter((c) => c.type === 'date');

  const primaryX = (categoricalCols[0] || dataset.columns[0])?.key || 'category';
  const primaryY = numericCols[0]?.key || 'revenue';
  const secondaryY = numericCols[1]?.key || numericCols[0]?.key || 'profit';
  const timeX = (dateCols[0] || categoricalCols[0] || dataset.columns[0])?.key || primaryX;

  const configs: ChartConfig[] = [
    {
      id: `chart-${dataset.id}-1`,
      title: `${numericCols[0]?.name || 'Total'} by ${categoricalCols[0]?.name || 'Category'}`,
      type: 'bar',
      xAxisKey: primaryX,
      yAxisKeys: [primaryY],
      aggregation: 'sum',
      sortBy: 'value_desc',
      showGrid: true,
      showLegend: true,
      showValues: true,
      colorPalette: 'slate-blue',
      description: 'Categorical distribution and volume'
    },
    {
      id: `chart-${dataset.id}-2`,
      title: `Trend of ${numericCols[0]?.name || 'Primary Metric'} over ${dateCols[0]?.name || 'Timeline'}`,
      type: 'area',
      xAxisKey: timeX,
      yAxisKeys: numericCols.length > 1 ? [primaryY, secondaryY] : [primaryY],
      aggregation: 'sum',
      sortBy: 'label_asc',
      showGrid: true,
      showLegend: true,
      showValues: false,
      colorPalette: 'emerald-teal',
      description: 'Continuous progression and multi-metric trends'
    },
    {
      id: `chart-${dataset.id}-3`,
      title: `${categoricalCols[1]?.name || categoricalCols[0]?.name || 'Segment'} Proportion Breakdown`,
      type: 'donut',
      xAxisKey: (categoricalCols[1] || categoricalCols[0] || dataset.columns[0])?.key || primaryX,
      yAxisKeys: [primaryY],
      aggregation: 'sum',
      sortBy: 'value_desc',
      topN: 6,
      showGrid: false,
      showLegend: true,
      showValues: true,
      colorPalette: 'sunset-amber',
      description: 'Percentage distribution and market share'
    },
    {
      id: `chart-${dataset.id}-4`,
      title: numericCols.length > 1
        ? `${numericCols[0]?.name} vs ${numericCols[1]?.name} Correlation`
        : `Comparative ${numericCols[0]?.name}`,
      type: numericCols.length >= 2 ? 'scatter' : 'horizontal_bar',
      xAxisKey: numericCols.length >= 2 ? primaryX : primaryX,
      yAxisKeys: numericCols.length >= 2 ? [secondaryY] : [primaryY],
      colorKey: (categoricalCols[0] || categoricalCols[1])?.key,
      aggregation: 'sum',
      sortBy: 'none',
      showGrid: true,
      showLegend: true,
      showValues: false,
      colorPalette: 'violet-berry',
      description: 'Multi-dimensional relationship mapping'
    },
    {
      id: `chart-${dataset.id}-5`,
      title: `Distribution Histogram (${numericCols[0]?.name || 'Metric'})`,
      type: 'histogram',
      xAxisKey: primaryY,
      yAxisKeys: [primaryY],
      aggregation: 'sum',
      showGrid: true,
      showLegend: false,
      showValues: false,
      colorPalette: 'vibrant-spectrum',
      description: 'Frequency spread and statistical variance'
    },
    {
      id: `chart-${dataset.id}-6`,
      title: `${categoricalCols[0]?.name || 'Category'} Hierarchical Treemap`,
      type: 'treemap',
      xAxisKey: primaryX,
      yAxisKeys: [primaryY],
      aggregation: 'sum',
      showGrid: false,
      showLegend: false,
      showValues: true,
      colorPalette: 'slate-blue',
      description: 'Relative nested area visualizer'
    }
  ];

  return configs;
}

export default function App() {
  const [datasets, setDatasets] = useState<Dataset[]>(PRESET_DATASETS);
  const [currentDatasetId, setCurrentDatasetId] = useState<string>(PRESET_DATASETS[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  // Chart configs dictionary mapped by dataset ID
  const [chartConfigsMap, setChartConfigsMap] = useState<Record<string, ChartConfig[]>>(() => {
    const initialMap: Record<string, ChartConfig[]> = {};
    PRESET_DATASETS.forEach((ds) => {
      initialMap[ds.id] = generateDefaultChartsForDataset(ds);
    });
    return initialMap;
  });

  // Active filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [gridColumns, setGridColumns] = useState<2 | 3>(2);

  // Modals & Studio focus
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [fullscreenChartId, setFullscreenChartId] = useState<string | null>(null);
  const [editingChartConfig, setEditingChartConfig] = useState<ChartConfig | null>(null);

  // Active dataset object
  const currentDataset = useMemo(() => {
    return datasets.find((d) => d.id === currentDatasetId) || datasets[0];
  }, [datasets, currentDatasetId]);

  // Current dataset charts
  const activeCharts = useMemo(() => {
    return chartConfigsMap[currentDataset.id] || [];
  }, [chartConfigsMap, currentDataset.id]);

  // Studio Mode active working chart
  const [studioChart, setStudioChart] = useState<ChartConfig>(() => {
    return (
      activeCharts[0] || {
        id: 'studio-chart',
        title: 'Custom Studio Exploration',
        type: 'bar',
        xAxisKey: currentDataset.columns[0]?.key || '',
        yAxisKeys: [
          currentDataset.columns.find((c) => c.type === 'number')?.key ||
            currentDataset.columns[0]?.key ||
            ''
        ],
        aggregation: 'sum',
        showGrid: true,
        showLegend: true,
        showValues: true,
        colorPalette: 'slate-blue'
      }
    );
  });

  // Keep studio chart in sync when dataset changes
  useEffect(() => {
    if (activeCharts.length > 0) {
      setStudioChart(activeCharts[0]);
    }
  }, [currentDatasetId]);

  // Process filtered dataset
  const filteredData = useMemo(() => {
    return filterDataset(currentDataset.data, searchQuery, filterRules);
  }, [currentDataset.data, searchQuery, filterRules]);

  // Handlers for dataset operations
  const handleImportDataset = (newDataset: Dataset) => {
    setDatasets((prev) => [newDataset, ...prev]);
    setCurrentDatasetId(newDataset.id);
    const newCharts = generateDefaultChartsForDataset(newDataset);
    setChartConfigsMap((prev) => ({
      ...prev,
      [newDataset.id]: newCharts
    }));
    setStudioChart(newCharts[0]);
    setFilterRules([]);
    setSearchQuery('');
  };

  const handleUpdateDataset = (updated: Dataset) => {
    setDatasets((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  // Chart configuration updates
  const handleUpdateChart = (updatedConfig: ChartConfig) => {
    setChartConfigsMap((prev) => ({
      ...prev,
      [currentDataset.id]: prev[currentDataset.id].map((c) =>
        c.id === updatedConfig.id ? updatedConfig : c
      )
    }));
  };

  const handleAddChart = () => {
    const numericCols = currentDataset.columns.filter((c) => c.type === 'number');
    const categoricalCols = currentDataset.columns.filter((c) => c.type === 'string');

    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      title: `Custom Analysis ${activeCharts.length + 1}`,
      type: 'bar',
      xAxisKey: (categoricalCols[0] || currentDataset.columns[0])?.key || '',
      yAxisKeys: [numericCols[0]?.key || currentDataset.columns[0]?.key || ''],
      aggregation: 'sum',
      sortBy: 'value_desc',
      showGrid: true,
      showLegend: true,
      showValues: true,
      colorPalette: COLOR_PALETTES[activeCharts.length % COLOR_PALETTES.length].id
    };

    setChartConfigsMap((prev) => ({
      ...prev,
      [currentDataset.id]: [...prev[currentDataset.id], newChart]
    }));
  };

  const handleDeleteChart = (chartId: string) => {
    setChartConfigsMap((prev) => ({
      ...prev,
      [currentDataset.id]: prev[currentDataset.id].filter((c) => c.id !== chartId)
    }));
  };

  const handleDuplicateChart = (chart: ChartConfig) => {
    const copy: ChartConfig = {
      ...chart,
      id: `chart-${Date.now()}`,
      title: `${chart.title} (Copy)`
    };
    setChartConfigsMap((prev) => ({
      ...prev,
      [currentDataset.id]: [...prev[currentDataset.id], copy]
    }));
  };

  const handleChangeChartType = (chartId: string, newType: ChartConfig['type']) => {
    setChartConfigsMap((prev) => ({
      ...prev,
      [currentDataset.id]: prev[currentDataset.id].map((c) =>
        c.id === chartId ? { ...c, type: newType } : c
      )
    }));
  };

  const handleResetDashboardCharts = () => {
    const freshCharts = generateDefaultChartsForDataset(currentDataset);
    setChartConfigsMap((prev) => ({
      ...prev,
      [currentDataset.id]: freshCharts
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentDataset={currentDataset}
        allDatasets={datasets}
        onSelectDataset={(id) => {
          setCurrentDatasetId(id);
          setFilterRules([]);
          setSearchQuery('');
        }}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenImporter={() => setIsImporterOpen(true)}
        onAddNewChart={handleAddChart}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Top-line summaries across all filtered rows */}
        <KpiSummaryCards
          data={filteredData}
          totalCount={currentDataset.data.length}
          columns={currentDataset.columns}
        />

        {/* Global Filter Bar */}
        <FilterBar
          columns={currentDataset.columns}
          rawDataset={currentDataset.data}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterRules={filterRules}
          onAddFilterRule={(rule) =>
            setFilterRules((prev) => [...prev.filter((r) => r.id !== rule.id), rule])
          }
          onRemoveFilterRule={(id) =>
            setFilterRules((prev) => prev.filter((r) => r.id !== id))
          }
          onClearFilters={() => {
            setFilterRules([]);
            setSearchQuery('');
          }}
        />

        {/* 1. DASHBOARD VIEW (Multi-Widget Grid) */}
        {viewMode === 'dashboard' && (
          <div className="space-y-4">
            {/* Dashboard Sub-bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  {activeCharts.length} Visual Widgets Active
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Layout columns toggle */}
                <div className="hidden sm:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setGridColumns(2)}
                    title="2 Column Grid"
                    className={`p-1 rounded text-xs transition-colors ${
                      gridColumns === 2
                        ? 'bg-slate-800 text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setGridColumns(3)}
                    title="3 Column Grid"
                    className={`p-1 rounded text-xs transition-colors ${
                      gridColumns === 3
                        ? 'bg-slate-800 text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Columns3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleResetDashboardCharts}
                  className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                  title="Restore default charts layout"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Reset Layout</span>
                </button>

                <button
                  onClick={handleAddChart}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Widget</span>
                </button>
              </div>
            </div>

            {/* Grid of charts */}
            {activeCharts.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl border border-dashed border-slate-800 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 mx-auto flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">No Widgets in Dashboard</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Add custom visualization widgets or restore the default analytical layout.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleAddChart}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    Add Custom Widget
                  </button>
                  <button
                    onClick={handleResetDashboardCharts}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
                  >
                    Restore Defaults
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`grid gap-5 ${
                  gridColumns === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                }`}
              >
                {activeCharts.map((chart) => (
                  <ChartCard
                    key={chart.id}
                    config={chart}
                    data={filteredData}
                    columns={currentDataset.columns}
                    datasetName={currentDataset.name}
                    onToggleFullscreen={() => setFullscreenChartId(chart.id)}
                    onDelete={() => handleDeleteChart(chart.id)}
                    onDuplicate={() => handleDuplicateChart(chart)}
                    onEditConfig={() => setEditingChartConfig(chart)}
                    onChangeChartType={(newType) => handleChangeChartType(chart.id, newType)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. STUDIO BUILDER VIEW */}
        {viewMode === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls */}
            <div className="lg:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  Studio Chart Configurator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tune dimensions, aggregates, scales, and presentation.
                </p>
              </div>

              <ChartConfigPanel
                config={studioChart}
                columns={currentDataset.columns}
                onChange={setStudioChart}
              />

              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const cloned: ChartConfig = {
                      ...studioChart,
                      id: `chart-${Date.now()}`
                    };
                    setChartConfigsMap((prev) => ({
                      ...prev,
                      [currentDataset.id]: [...prev[currentDataset.id], cloned]
                    }));
                    setViewMode('dashboard');
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add to Dashboard Grid
                </button>
              </div>
            </div>

            {/* Right Live Preview Canvas */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-5 flex-1 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{studioChart.title}</h3>
                    <p className="text-xs text-slate-400">Live preview & dynamic query execution</p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 font-semibold border border-blue-800/80">
                    {studioChart.type.replace('_', ' ').toUpperCase()} &bull; {studioChart.aggregation.toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 p-2">
                  <ChartCard
                    config={studioChart}
                    data={filteredData}
                    columns={currentDataset.columns}
                    datasetName={currentDataset.name}
                    isFullscreen={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. DATA TABLE SPREADSHEET VIEW */}
        {viewMode === 'table' && (
          <DataTableEditor
            dataset={currentDataset}
            onUpdateDataset={handleUpdateDataset}
          />
        )}

        {/* 4. INSIGHTS & STATISTICAL ANALYSIS VIEW */}
        {viewMode === 'insights' && (
          <InsightsDrawer
            dataset={currentDataset}
            filteredData={filteredData}
          />
        )}
      </main>

      {/* Fullscreen Chart Modal */}
      {fullscreenChartId && (
        <div className="fixed inset-0 z-50 p-4 sm:p-8 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-5xl h-[85vh] flex flex-col p-5 overflow-hidden">
            {(() => {
              const target = activeCharts.find((c) => c.id === fullscreenChartId) || studioChart;
              return (
                <ChartCard
                  config={target}
                  data={filteredData}
                  columns={currentDataset.columns}
                  datasetName={currentDataset.name}
                  isFullscreen={true}
                  onToggleFullscreen={() => setFullscreenChartId(null)}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* Customize Widget Modal */}
      {editingChartConfig && (
        <div className="fixed inset-0 z-50 p-4 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm">Customize Widget</h3>
              <button
                onClick={() => setEditingChartConfig(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <ChartConfigPanel
                config={editingChartConfig}
                columns={currentDataset.columns}
                onChange={setEditingChartConfig}
              />
            </div>
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
              <button
                onClick={() => setEditingChartConfig(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateChart(editingChartConfig);
                  setEditingChartConfig(null);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dataset Importer Modal */}
      <DataImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportDataset={handleImportDataset}
        currentDatasetId={currentDataset.id}
      />
    </div>
  );
}
