'use client';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  className = ""
}: PaginationProps) {
  // Calculate total pages
  const totalPages = Math.max(currentPage, Math.ceil(totalCount / pageSize));

  // Calculate if there are more pages
  const hasMorePages = currentPage * pageSize < totalCount;

  // Simplified pagination for when we don't have exact page count
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // If we're in the first few pages, show pages 1 through maxVisiblePages
    if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
      for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (totalPages > maxVisiblePages) {
        pages.push('...');
        // Only add last page if we're certain it exists
        if (totalPages > currentPage + 2) {
          pages.push(totalPages);
        }
      }
    }
    // If we're near the end (if we know it)
    else if (totalPages - currentPage < Math.floor(maxVisiblePages / 2)) {
      // Add first page and ellipsis
      pages.push(1);
      pages.push('...');

      // Show last few pages
      for (let i = Math.max(1, totalPages - maxVisiblePages + 2); i <= totalPages; i++) {
        pages.push(i);
      }
    }
    // If we're in the middle
    else {
      // Add first page and ellipsis
      pages.push(1);
      pages.push('...');

      // Show current page and one on each side
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      // Add ellipsis and last page if needed
      if (currentPage + 1 < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Pagination handlers
  const goToFirstPage = () => onPageChange(1);
  const goToPrevPage = () => onPageChange(Math.max(currentPage - 1, 1));
  const goToNextPage = () => onPageChange(Math.min(currentPage + 1, totalPages));
  const goToLastPage = () => onPageChange(totalPages);
  const goToPage = (page: number) => onPageChange(page);

  return (
    <div className={`mt-8 border-t border-gray-100 pt-6 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
        </div>

        <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            onClick={goToFirstPage}
            disabled={currentPage === 1}
            className={`inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">First</span>
          </button>

          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Previous</span>
          </button>

          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex items-center px-4 py-2 text-sm text-gray-700 ring-1 ring-inset ring-gray-300"
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => typeof page === 'number' && goToPage(page)}
                className={`inline-flex items-center px-4 py-2 text-sm ${
                  currentPage === page
                    ? 'bg-blue-500 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                {page}
              </button>
            )
          ))}

          <button
            onClick={goToNextPage}
            disabled={!hasMorePages && currentPage >= totalPages}
            className={`inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!hasMorePages && currentPage >= totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Next</span>
          </button>

          {/* Only show Last Page button if we have a good idea of the total pages */}
          {totalPages > 2 && (
            <button
              onClick={goToLastPage}
              disabled={!hasMorePages && currentPage >= totalPages}
              className={`inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${!hasMorePages && currentPage >= totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <ChevronsRight className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Last</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
