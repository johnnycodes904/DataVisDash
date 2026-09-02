import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  Plus,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ChevronDown
} from 'lucide-react';
import { ColumnMeta, FilterRule } from '../types';

interface Props {
  columns: ColumnMeta[];
  rawDataset: Record<string, any>[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterRules: FilterRule[];
  onAddFilterRule: (rule: FilterRule) => void;
  onRemoveFilterRule: (ruleId: string) => void;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<Props> = ({
  columns,
  rawDataset,
  searchQuery,
  onSearchChange,
  filterRules,
  onAddFilterRule,
  onRemoveFilterRule,
  onClearFilters
}) => {
  const [activeDropdownCol, setActiveDropdownCol] = useState<string | null>(null);
  const categoricalCols = columns.filter((c) => c.type === 'string');

  const getDistinctValues = (colKey: string): string[] => {
    const vals = new Set<string>();
    rawDataset.forEach((r) => {
      if (r[colKey] !== undefined && r[colKey] !== null) {
        vals.add(String(r[colKey]));
      }
    });
    return Array.from(vals).slice(0, 30);
  };

  const isValueSelected = (colKey: string, val: string) => {
    const rule = filterRules.find((r) => r.columnKey === colKey);
    return rule && Array.isArray(rule.value) && rule.value.includes(val);
  };

  const toggleCategoryValue = (colKey: string, val: string) => {
    const existingRule = filterRules.find((r) => r.columnKey === colKey);
    if (!existingRule) {
      onAddFilterRule({
        id: `filter-${colKey}-${Date.now()}`,
        columnKey: colKey,
        operator: 'in',
        value: [val]
      });
    } else {
      const currentValues: string[] = Array.isArray(existingRule.value) ? existingRule.value : [];
      let updatedValues: string[];
      if (currentValues.includes(val)) {
        updatedValues = currentValues.filter((v) => v !== val);
      } else {
        updatedValues = [...currentValues, val];
      }

      if (updatedValues.length === 0) {
        onRemoveFilterRule(existingRule.id);
      } else {
        onAddFilterRule({
          ...existingRule,
          value: updatedValues
        });
      }
    }
  };

  return (
    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm mb-6 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Global Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search all records, dimensions, and metrics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs font-medium text-slate-100 bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Categorical Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {categoricalCols.slice(0, 4).map((col) => {
            const distinct = getDistinctValues(col.key);
            const activeRule = filterRules.find((r) => r.columnKey === col.key);
            const activeCount = Array.isArray(activeRule?.value) ? activeRule.value.length : 0;
            const isOpen = activeDropdownCol === col.key;

            return (
              <div key={col.key} className="relative">
                <button
                  onClick={() => setActiveDropdownCol(isOpen ? null : col.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeCount > 0
                      ? 'bg-blue-950/80 border-blue-700/80 text-blue-300 shadow-2xs'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Filter className="w-3 h-3 text-slate-400" />
                  <span>{col.name}</span>
                  {activeCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white font-mono text-[10px] flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setActiveDropdownCol(null)}
                    />
                    <div className="absolute left-0 mt-1.5 w-56 bg-slate-900 rounded-xl shadow-xl border border-slate-800 py-2 z-50 max-h-60 overflow-y-auto">
                      <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex justify-between items-center">
                        <span>Filter {col.name}</span>
                        {activeCount > 0 && (
                          <button
                            onClick={() => activeRule && onRemoveFilterRule(activeRule.id)}
                            className="text-rose-400 hover:text-rose-300 text-[10px]"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="py-1">
                        {distinct.map((val) => {
                          const selected = isValueSelected(col.key, val);
                          return (
                            <button
                              key={val}
                              onClick={() => toggleCategoryValue(col.key, val)}
                              className="w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-slate-800 text-slate-200 transition-colors"
                            >
                              <span className="truncate">{val}</span>
                              {selected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {(filterRules.length > 0 || searchQuery) && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {filterRules.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Active filters:</span>
          {filterRules.map((rule) => {
            const col = columns.find((c) => c.key === rule.columnKey);
            const valLabel = Array.isArray(rule.value) ? rule.value.join(', ') : String(rule.value);
            return (
              <span
                key={rule.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-950/80 text-blue-300 text-xs border border-blue-800/60 font-medium"
              >
                <span>
                  <strong>{col?.name || rule.columnKey}:</strong> {valLabel}
                </span>
                <button
                  onClick={() => onRemoveFilterRule(rule.id)}
                  className="text-blue-400 hover:text-blue-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
