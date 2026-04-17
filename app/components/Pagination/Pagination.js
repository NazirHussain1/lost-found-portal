'use client';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Pagination({ pagination, onPageChange, loading = false }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const {
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPrevPage,
  } = pagination;

  const handlePrevious = () => {
    if (hasPrevPage && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at the beginning
      if (currentPage <= 3) {
        end = 4;
      }

      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <>
      <style jsx>{`
        .pagination-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin: 40px 0;
          padding: 20px;
        }

        .pagination-info {
          font-size: 14px;
          color: #718096;
          font-weight: 500;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pagination-button {
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e2e8f0;
          background: white;
          color: #4a5568;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
          padding: 0 12px;
        }

        .pagination-button:hover:not(:disabled):not(.active) {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .pagination-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #f7fafc;
        }

        .pagination-button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .pagination-button.nav-button {
          padding: 0 16px;
          gap: 8px;
        }

        .pagination-ellipsis {
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a0aec0;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .pagination-controls {
            gap: 5px;
          }

          .pagination-button {
            min-width: 36px;
            height: 36px;
            font-size: 13px;
          }

          .pagination-button.nav-button {
            padding: 0 12px;
          }
        }
      `}</style>

      <div className="pagination-container">
        <div className="pagination-info">
          Showing page {currentPage} of {totalPages} ({totalItems} total items)
        </div>

        <div className="pagination-controls">
          {/* Previous Button */}
          <button
            className="pagination-button nav-button"
            onClick={handlePrevious}
            disabled={!hasPrevPage || loading}
            aria-label="Previous page"
          >
            <FaChevronLeft size={12} />
            <span>Previous</span>
          </button>

          {/* Page Numbers */}
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </div>
              );
            }

            return (
              <button
                key={page}
                className={`pagination-button ${page === currentPage ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
                disabled={loading}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            className="pagination-button nav-button"
            onClick={handleNext}
            disabled={!hasNextPage || loading}
            aria-label="Next page"
          >
            <span>Next</span>
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>
    </>
  );
}
