import React from 'react';

interface TableRendererProps {
  data: Record<string, unknown>[];
}

/**
 * Format a cell value for display.
 * Handles objects, arrays, booleans, nulls, and primitives.
 */
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Renders tabular MCP data as a formatted HTML table.
 * Matches the existing table styling from assistantMarkdownComponents.
 */
export const TableRenderer: React.FC<TableRendererProps> = ({ data }) => {
  if (data.length === 0) return null;

  // Get column headers from all rows, preserving insertion order from first row
  const columnSet = new Set<string>();
  for (const row of data) {
    for (const key of Object.keys(row)) {
      columnSet.add(key);
    }
  }
  const columns = Array.from(columnSet);

  // Limit displayed rows to prevent performance issues
  const maxRows = 100;
  const truncated = data.length > maxRows;
  const displayData = truncated ? data.slice(0, maxRows) : data;

  return (
    <div className="mt-1">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-copilot-border text-[10px]">
          <thead className="bg-copilot-bg">
            <tr className="border-b border-copilot-border">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-2 py-1 text-left font-semibold text-copilot-text border border-copilot-border whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-copilot-border">
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-2 py-1 text-copilot-text border border-copilot-border max-w-[200px] truncate"
                    title={formatCellValue(row[col]).slice(0, 200)}
                  >
                    {formatCellValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {truncated && (
        <div className="text-[10px] text-copilot-text-muted mt-1">
          Showing {maxRows} of {data.length} rows
        </div>
      )}
    </div>
  );
};
