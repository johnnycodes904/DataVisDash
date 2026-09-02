import React, { useState } from 'react';
import {
  Download,
  Plus,
  Trash2,
  Edit2,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import Papa from 'papaparse';
import { Dataset, ColumnMeta } from '../types';

interface Props {
  dataset: Dataset;
  onUpdateDataset: (updated: Dataset) => void;
}

export const DataTableEditor: React.FC<Props> = ({ dataset, onUpdateDataset }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colKey: string } | null>(null);
  const [cellValue, setCellValue] = useState<string>('');

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<'string' | 'number' | 'date'>('string');

  const totalPages = Math.ceil(dataset.data.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = dataset.data.slice(startIndex, startIndex + pageSize);

  const handleStartEdit = (rowIndex: number, colKey: string, currentVal: any) => {
    setEditingCell({ rowIndex: startIndex + rowIndex, colKey });
    setCellValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : '');
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const { rowIndex, colKey } = editingCell;
    const colMeta = dataset.columns.find((c) => c.key === colKey);

    let parsedVal: any = cellValue;
    if (colMeta?.type === 'number') {
      parsedVal = cellValue === '' ? null : Number(cellValue);
    }

    const updatedData = [...dataset.data];
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [colKey]: parsedVal
    };

    onUpdateDataset({
      ...dataset,
      data: updatedData
    });
    setEditingCell(null);
  };

  const handleAddRow = () => {
    const newRow: Record<string, any> = {};
    dataset.columns.forEach((c) => {
      newRow[c.key] = c.type === 'number' ? 0 : c.type === 'date' ? new Date().toISOString().split('T')[0] : 'New Value';
    });

    onUpdateDataset({
      ...dataset,
      data: [newRow, ...dataset.data]
    });
    setCurrentPage(1);
  };

  const handleDeleteRow = (actualIndex: number) => {
    const updatedData = dataset.data.filter((_, idx) => idx !== actualIndex);
    onUpdateDataset({
      ...dataset,
      data: updatedData
    });
  };

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    const key = newColName.trim().toLowerCase().replace(/\s+/g, '_');

    if (dataset.columns.some((c) => c.key === key)) {
      alert('A column with this key already exists.');
      return;
    }

    const newCol: ColumnMeta = {
      key,
      name: newColName.trim(),
      type: newColType
    };

    const updatedData = dataset.data.map((r) => ({
      ...r,
      [key]: newColType === 'number' ? 0 : ''
    }));

    onUpdateDataset({
      ...dataset,
      columns: [...dataset.columns, newCol],
      data: updatedData
    });

    setNewColName('');
    setIsAddingColumn(false);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(dataset.data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataset.name.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const jsonStr = JSON.stringify(dataset.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataset.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col space-y-0 text-slate-100">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap bg-slate-950">
        <div>
          <h3 className="font-bold text-sm text-slate-100">{dataset.name}</h3>
          <p className="text-xs text-slate-400">
            {dataset.data.length} records &bull; {dataset.columns.length} columns &bull; Click any cell to edit
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>

          <button
            onClick={() => setIsAddingColumn(!isAddingColumn)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Field</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          <button
            onClick={exportCSV}
            title="Download CSV"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportJSON}
            title="Download JSON"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Add Column Popup Form */}
      {isAddingColumn && (
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-300">New Column:</span>
          <input
            type="text"
            placeholder="Field Name (e.g. Discount Rate)"
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={newColType}
            onChange={(e) => setNewColType(e.target.value as any)}
            className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
          >
            <option value="string">Text (String)</option>
            <option value="number">Numeric (Number)</option>
            <option value="date">Date</option>
          </select>
          <button
            onClick={handleAddColumn}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
          >
            Confirm
          </button>
          <button
            onClick={() => setIsAddingColumn(false)}
            className="px-3 py-1 text-slate-400 hover:text-slate-200 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Spreadsheet Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-300">
            <tr>
              <th className="p-3 w-12 text-slate-500 font-mono text-center">#</th>
              {dataset.columns.map((c) => (
                <th key={c.key} className="p-3 font-semibold whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span>{c.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                      {c.type}
                    </span>
                  </div>
                </th>
              ))}
              <th className="p-3 w-16 text-center text-slate-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900">
            {paginatedData.map((row, rIdx) => {
              const actualRowIndex = startIndex + rIdx;
              return (
                <tr key={actualRowIndex} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-2.5 text-center font-mono text-[11px] text-slate-500">
                    {actualRowIndex + 1}
                  </td>
                  {dataset.columns.map((c) => {
                    const isEditing =
                      editingCell?.rowIndex === actualRowIndex && editingCell?.colKey === c.key;
                    const val = row[c.key];

                    return (
                      <td
                        key={c.key}
                        onClick={() => !isEditing && handleStartEdit(rIdx, c.key, val)}
                        className={`p-2.5 cursor-pointer font-mono text-xs transition-colors ${
                          isEditing
                            ? 'bg-blue-950/80 ring-2 ring-blue-500/80'
                            : 'hover:bg-slate-800/80 text-slate-200'
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type={c.type === 'number' ? 'number' : 'text'}
                              autoFocus
                              value={cellValue}
                              onChange={(e) => setCellValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveCell();
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="w-full px-2 py-1 bg-slate-950 border border-blue-500 text-white rounded text-xs focus:outline-none"
                            />
                            <button
                              onClick={handleSaveCell}
                              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-500"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="truncate block max-w-[200px]" title={String(val ?? '')}>
                            {val !== undefined && val !== null ? String(val) : <em className="text-slate-600">null</em>}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-2.5 text-center">
                    <button
                      onClick={() => handleDeleteRow(actualRowIndex)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                      title="Delete row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <strong>{startIndex + 1}</strong> to{' '}
          <strong>{Math.min(dataset.data.length, startIndex + pageSize)}</strong> of{' '}
          <strong>{dataset.data.length}</strong> records
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-800 text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-800 text-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
