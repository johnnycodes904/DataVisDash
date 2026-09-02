export type ColumnType = 'number' | 'string' | 'date' | 'boolean';

export interface ColumnMeta {
  key: string;
  name: string;
  type: ColumnType;
  unit?: string;
  isCustom?: boolean;
}

export type AggregationType = 'sum' | 'avg' | 'count' | 'distinct' | 'min' | 'max' | 'median';

export type ChartType = 
  | 'bar' 
  | 'horizontal_bar'
  | 'stacked_bar' 
  | 'line' 
  | 'area' 
  | 'stacked_area'
  | 'pie' 
  | 'donut' 
  | 'scatter' 
  | 'radar' 
  | 'composed' 
  | 'heatmap' 
  | 'treemap'
  | 'funnel'
  | 'histogram';

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  xAxisKey: string;
  yAxisKeys: string[];
  secondaryYAxisKey?: string;
  sizeKey?: string; // for scatter/bubble
  colorKey?: string; // for grouping/breakdown
  aggregation: AggregationType;
  sortBy?: 'value_asc' | 'value_desc' | 'label_asc' | 'label_desc' | 'none';
  topN?: number; // e.g. top 10
  showGrid: boolean;
  showLegend: boolean;
  showValues: boolean;
  colorPalette: string;
  targetBenchmark?: number;
  description?: string;
}

export interface FilterRule {
  id: string;
  columnKey: string;
  operator: 'equals' | 'in' | 'not_in' | 'between' | 'greater_than' | 'less_than' | 'contains';
  value: any; // string, number, array of strings, [min, max]
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  columns: ColumnMeta[];
  data: Record<string, any>[];
  source: 'preset' | 'custom' | 'file';
  createdAt: string;
}

export type ViewMode = 'dashboard' | 'studio' | 'table' | 'insights';

export interface ColorScheme {
  id: string;
  name: string;
  colors: string[];
}
