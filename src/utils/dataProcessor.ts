import { ColumnMeta, ColumnType, AggregationType, FilterRule } from '../types';

export function inferColumnTypes(data: Record<string, any>[]): ColumnMeta[] {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0] || {});
  
  return keys.map((key) => {
    let nonNullCount = 0;
    let numericCount = 0;
    let dateCount = 0;
    let booleanCount = 0;

    const sample = data.slice(0, 100);
    sample.forEach((row) => {
      const val = row[key];
      if (val !== null && val !== undefined && val !== '') {
        nonNullCount++;
        if (typeof val === 'boolean' || val === 'true' || val === 'false') {
          booleanCount++;
        } else if (!isNaN(Number(val)) && typeof val !== 'boolean') {
          numericCount++;
        } else if (typeof val === 'string' && !isNaN(Date.parse(val)) && (val.includes('-') || val.includes('/') || val.includes(':'))) {
          dateCount++;
        }
      }
    });

    let detectedType: ColumnType = 'string';
    if (nonNullCount > 0) {
      if (numericCount / nonNullCount > 0.8) detectedType = 'number';
      else if (dateCount / nonNullCount > 0.8) detectedType = 'date';
      else if (booleanCount / nonNullCount > 0.8) detectedType = 'boolean';
    }

    // Determine readable label & potential unit
    const formattedName = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();

    let unit = undefined;
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('revenue') || lowerKey.includes('cost') || lowerKey.includes('price') || lowerKey.includes('mrr') || lowerKey.includes('arr') || lowerKey.includes('spend') || lowerKey.includes('cac') || lowerKey.includes('profit')) {
      unit = '$';
    } else if (lowerKey.includes('rate') || lowerKey.includes('pct') || lowerKey.includes('discount') || lowerKey.includes('percent')) {
      unit = '%';
    } else if (lowerKey.includes('ms') || lowerKey.includes('latency')) {
      unit = 'ms';
    } else if (lowerKey.includes('kwh')) {
      unit = 'kWh';
    } else if (lowerKey.includes('temp')) {
      unit = '°C';
    }

    return {
      key,
      name: formattedName,
      type: detectedType,
      unit
    };
  });
}

export function filterDataset(
  data: Record<string, any>[],
  searchQuery: string,
  filterRules: FilterRule[]
): Record<string, any>[] {
  if (!data || data.length === 0) return [];

  let result = data;

  // Global search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '').toLowerCase().includes(q)
      )
    );
  }

  // Column filters
  if (filterRules.length > 0) {
    result = result.filter((row) => {
      return filterRules.every((rule) => {
        const val = row[rule.columnKey];
        if (rule.operator === 'equals') {
          return String(val) === String(rule.value);
        }
        if (rule.operator === 'in') {
          if (!Array.isArray(rule.value) || rule.value.length === 0) return true;
          return rule.value.includes(String(val));
        }
        if (rule.operator === 'between') {
          if (!Array.isArray(rule.value) || rule.value.length !== 2) return true;
          const [min, max] = rule.value;
          const num = Number(val);
          if (isNaN(num)) return true;
          return num >= min && num <= max;
        }
        if (rule.operator === 'greater_than') {
          return Number(val) >= Number(rule.value);
        }
        if (rule.operator === 'less_than') {
          return Number(val) <= Number(rule.value);
        }
        if (rule.operator === 'contains') {
          return String(val ?? '').toLowerCase().includes(String(rule.value).toLowerCase());
        }
        return true;
      });
    });
  }

  return result;
}

export function aggregateData(
  data: Record<string, any>[],
  xAxisKey: string,
  yAxisKeys: string[],
  aggregation: AggregationType,
  colorKey?: string
): Record<string, any>[] {
  if (!data || data.length === 0 || !xAxisKey) return [];

  // If colorKey is provided (breakdown dimension)
  if (colorKey && colorKey !== xAxisKey) {
    const grouped: Record<string, Record<string, number[]>> = {};
    const primaryY = yAxisKeys[0] || 'count';

    data.forEach((row) => {
      const xVal = String(row[xAxisKey] ?? 'Unknown');
      const seriesVal = String(row[colorKey] ?? 'Unknown');
      if (!grouped[xVal]) grouped[xVal] = {};
      if (!grouped[xVal][seriesVal]) grouped[xVal][seriesVal] = [];

      const rawNum = primaryY === 'count' ? 1 : Number(row[primaryY]);
      grouped[xVal][seriesVal].push(isNaN(rawNum) ? 0 : rawNum);
    });

    return Object.entries(grouped).map(([xVal, seriesMap]) => {
      const resultObj: Record<string, any> = { [xAxisKey]: xVal };
      Object.entries(seriesMap).forEach(([seriesKey, nums]) => {
        resultObj[seriesKey] = computeAggValue(nums, aggregation);
      });
      return resultObj;
    });
  }

  // Standard aggregation by xAxisKey
  const groups: Record<string, Record<string, number[]>> = {};

  data.forEach((row) => {
    const xVal = String(row[xAxisKey] ?? 'Unknown');
    if (!groups[xVal]) {
      groups[xVal] = {};
      yAxisKeys.forEach((k) => (groups[xVal][k] = []));
    }

    yAxisKeys.forEach((k) => {
      const num = Number(row[k]);
      groups[xVal][k].push(isNaN(num) ? 0 : num);
    });
  });

  return Object.entries(groups).map(([xVal, metrics]) => {
    const item: Record<string, any> = { [xAxisKey]: xVal };
    yAxisKeys.forEach((k) => {
      item[k] = computeAggValue(metrics[k], aggregation);
    });
    return item;
  });
}

function computeAggValue(values: number[], agg: AggregationType): number {
  if (!values || values.length === 0) return 0;
  switch (agg) {
    case 'sum':
      return Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
    case 'avg':
      return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
    case 'count':
      return values.length;
    case 'distinct':
      return new Set(values).size;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'median': {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
    }
    default:
      return Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
  }
}

export function sortAndLimitData(
  data: Record<string, any>[],
  xAxisKey: string,
  primaryYKey: string,
  sortBy: string = 'none',
  topN?: number
): Record<string, any>[] {
  let sorted = [...data];

  if (sortBy === 'value_desc') {
    sorted.sort((a, b) => (Number(b[primaryYKey]) || 0) - (Number(a[primaryYKey]) || 0));
  } else if (sortBy === 'value_asc') {
    sorted.sort((a, b) => (Number(a[primaryYKey]) || 0) - (Number(b[primaryYKey]) || 0));
  } else if (sortBy === 'label_asc') {
    sorted.sort((a, b) => String(a[xAxisKey] || '').localeCompare(String(b[xAxisKey] || '')));
  } else if (sortBy === 'label_desc') {
    sorted.sort((a, b) => String(b[xAxisKey] || '').localeCompare(String(a[xAxisKey] || '')));
  }

  if (topN && topN > 0 && sorted.length > topN) {
    sorted = sorted.slice(0, topN);
  }

  return sorted;
}

export function generateHistogramBuckets(
  data: Record<string, any>[],
  columnKey: string,
  binCount: number = 8
): { binLabel: string; count: number; min: number; max: number }[] {
  if (!data || data.length === 0 || !columnKey) return [];
  const numbers = data.map((r) => Number(r[columnKey])).filter((n) => !isNaN(n));
  if (numbers.length === 0) return [];

  const minVal = Math.min(...numbers);
  const maxVal = Math.max(...numbers);
  if (minVal === maxVal) {
    return [{ binLabel: `${minVal}`, count: numbers.length, min: minVal, max: maxVal }];
  }

  const range = maxVal - minVal;
  const binWidth = range / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => {
    const start = minVal + i * binWidth;
    const end = i === binCount - 1 ? maxVal : minVal + (i + 1) * binWidth;
    return {
      min: start,
      max: end,
      binLabel: `${Math.round(start * 10) / 10} - ${Math.round(end * 10) / 10}`,
      count: 0
    };
  });

  numbers.forEach((num) => {
    const idx = Math.min(Math.floor((num - minVal) / binWidth), binCount - 1);
    if (bins[idx]) bins[idx].count++;
  });

  return bins;
}

export function generateHeatmapMatrix(
  data: Record<string, any>[],
  rowKey: string,
  colKey: string,
  valKey: string,
  agg: AggregationType = 'sum'
): { rows: string[]; cols: string[]; matrix: { row: string; col: string; value: number }[]; maxVal: number; minVal: number } {
  if (!data || data.length === 0 || !rowKey || !colKey || !valKey) {
    return { rows: [], cols: [], matrix: [], maxVal: 0, minVal: 0 };
  }

  const rowSet = new Set<string>();
  const colSet = new Set<string>();
  const cellBuckets: Record<string, number[]> = {};

  data.forEach((r) => {
    const row = String(r[rowKey] ?? 'Unknown');
    const col = String(r[colKey] ?? 'Unknown');
    const val = Number(r[valKey]);
    rowSet.add(row);
    colSet.add(col);

    const cellKey = `${row}:::${col}`;
    if (!cellBuckets[cellKey]) cellBuckets[cellKey] = [];
    cellBuckets[cellKey].push(isNaN(val) ? 0 : val);
  });

  const rows = Array.from(rowSet).slice(0, 15);
  const cols = Array.from(colSet).slice(0, 15);

  let minVal = Infinity;
  let maxVal = -Infinity;

  const matrix: { row: string; col: string; value: number }[] = [];
  rows.forEach((r) => {
    cols.forEach((c) => {
      const key = `${r}:::${c}`;
      const numbers = cellBuckets[key] || [];
      const computed = computeAggValue(numbers, agg);
      if (computed < minVal) minVal = computed;
      if (computed > maxVal) maxVal = computed;
      matrix.push({ row: r, col: c, value: computed });
    });
  });

  if (minVal === Infinity) minVal = 0;
  if (maxVal === -Infinity) maxVal = 0;

  return { rows, cols, matrix, maxVal, minVal };
}

export function calculateCorrelations(
  data: Record<string, any>[],
  numericColumns: ColumnMeta[]
): { col1: string; col2: string; correlation: number }[] {
  if (!data || data.length < 3 || numericColumns.length < 2) return [];

  const results: { col1: string; col2: string; correlation: number }[] = [];

  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const k1 = numericColumns[i].key;
      const k2 = numericColumns[j].key;

      const pairs = data
        .map((r) => [Number(r[k1]), Number(r[k2])])
        .filter(([a, b]) => !isNaN(a) && !isNaN(b));

      if (pairs.length < 3) continue;

      const n = pairs.length;
      const sum1 = pairs.reduce((acc, [a]) => acc + a, 0);
      const sum2 = pairs.reduce((acc, [, b]) => acc + b, 0);
      const mean1 = sum1 / n;
      const mean2 = sum2 / n;

      let numerator = 0;
      let denom1 = 0;
      let denom2 = 0;

      pairs.forEach(([a, b]) => {
        const diff1 = a - mean1;
        const diff2 = b - mean2;
        numerator += diff1 * diff2;
        denom1 += diff1 * diff1;
        denom2 += diff2 * diff2;
      });

      const denominator = Math.sqrt(denom1 * denom2);
      const r = denominator === 0 ? 0 : numerator / denominator;
      results.push({
        col1: numericColumns[i].name,
        col2: numericColumns[j].name,
        correlation: Math.round(r * 100) / 100
      });
    }
  }

  return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

export function formatValue(val: any, unit?: string): string {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'number') {
    if (isNaN(val)) return '-';
    let formatted = '';
    if (Math.abs(val) >= 1_000_000) {
      formatted = (val / 1_000_000).toFixed(2) + 'M';
    } else if (Math.abs(val) >= 1_000) {
      formatted = (val / 1_000).toFixed(1) + 'k';
    } else if (Number.isInteger(val)) {
      formatted = val.toLocaleString();
    } else {
      formatted = val.toFixed(2);
    }

    if (unit === '$') return `$${formatted}`;
    if (unit === '%') return `${formatted}%`;
    if (unit) return `${formatted} ${unit}`;
    return formatted;
  }
  return String(val);
}
