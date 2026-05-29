import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { AlertCircle } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = "No records found in database.",
  onRowClick = null,
  stickyHeader = true
}) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-150 shadow-xs bg-white">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden">
          <table className="w-full text-left text-xs text-gray-700">
            {/* Header */}
            <thead className={`bg-[#F4FCFF] border-b border-gray-200 select-none ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.header || idx}
                    className={`h-11 px-4 text-left align-middle font-bold text-[#4A4D4E] whitespace-nowrap tracking-wide ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={`skel-${rIdx}`} className="animate-pulse h-16 bg-white">
                    {columns.map((col, cIdx) => (
                      <td key={`skel-${rIdx}-${cIdx}`} className="px-4 py-3 align-middle">
                        <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center align-middle">
                    <div className="flex flex-col items-center justify-center space-y-2.5 text-gray-400">
                      <AlertCircle className="w-8 h-8 text-slate-350" />
                      <span className="font-bold text-slate-500">{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                // Rendered Rows
                data.map((row, rIdx) => (
                  <tr
                    key={row.id || row.sku || row.code || rIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`h-14 transition-colors hover:bg-gray-50/70 ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {columns.map((col, cIdx) => {
                      const value = row[col.accessor];
                      return (
                        <td key={`cell-${rIdx}-${cIdx}`} className={`px-4 py-3 align-middle font-medium ${col.cellClassName || ''}`}>
                          {col.render ? col.render(row, value) : value}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
