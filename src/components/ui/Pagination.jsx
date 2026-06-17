import React from 'react';
import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  pageSize = 8
}) {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipses support if pages are extensive
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1); // Always show page 1
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages); // Always show the last page
    }
    return pages;
  };

  const pagesList = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 bg-white px-4 py-3 shrink-0 text-xs select-none">
      <div className="font-semibold text-gray-500">
        Showing <span className="text-gray-900 font-bold">{startIdx}</span> to{' '}
        <span className="text-gray-900 font-bold">{endIdx}</span> of{' '}
        <span className="text-gray-900 font-bold">{totalItems}</span> entries
      </div>
      
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="gap-1 font-bold rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700 h-8 px-2"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </Button>

        {/* Page List Numbers */}
        <div className="flex items-center gap-1">
          {pagesList.map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ell-${idx}`} className="px-2 text-gray-400 font-medium">
                  ...
                </span>
              );
            }
            const isActive = currentPage === page;
            return (
              <Button
                key={`page-${page}`}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 flex items-center justify-center font-bold text-[13px] rounded-lg transition-all border outline-none ${
                  isActive
                    ? 'bg-[#0071C1] border-[#0071C1] text-white shadow-xs'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="gap-1 font-bold rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700 h-8 px-2"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}
