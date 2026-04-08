import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    // Generar rango de páginas a mostrar
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            padding: '1rem 0'
        }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    padding: 0,
                    borderRadius: '10px',
                    background: currentPage <= 1 ? 'var(--bg-surface)' : 'var(--bg-surface-glass)',
                    border: 'var(--glass-border)',
                    color: currentPage <= 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage <= 1 ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                }}
            >
                <ChevronLeft size={18} />
            </button>

            {getPageNumbers().map((pageNum, idx) =>
                pageNum === '...' ? (
                    <span
                        key={`dots-${idx}`}
                        style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                        }}
                    >
                        ···
                    </span>
                ) : (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum as number)}
                        style={{
                            width: '40px',
                            height: '40px',
                            padding: 0,
                            borderRadius: '10px',
                            background: currentPage === pageNum
                                ? 'var(--accent-color)'
                                : 'var(--bg-surface-glass)',
                            border: currentPage === pageNum
                                ? '1px solid var(--accent-color)'
                                : 'var(--glass-border)',
                            color: currentPage === pageNum ? '#fff' : 'var(--text-primary)',
                            fontWeight: currentPage === pageNum ? 700 : 500,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: currentPage === pageNum
                                ? '0 4px 12px rgba(99, 102, 241, 0.3)'
                                : 'none',
                        }}
                    >
                        {pageNum}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    padding: 0,
                    borderRadius: '10px',
                    background: currentPage >= totalPages ? 'var(--bg-surface)' : 'var(--bg-surface-glass)',
                    border: 'var(--glass-border)',
                    color: currentPage >= totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage >= totalPages ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                }}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
