"use client";

import { IconArrowRight, IconChevronLeft } from "./icons";

interface PaginationProps {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    className?: string;
}

/**
 * Compact "Prev  Page X of Y  Next" on mobile; full numbered controls from
 * the `sm` breakpoint up. Renders nothing when there's only one page.
 */
export default function Pagination({ page, pageCount, onPageChange, className = "" }: PaginationProps) {
    if (pageCount <= 1) return null;

    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
    const canPrev = page > 1;
    const canNext = page < pageCount;

    return (
        <nav
            aria-label="Pagination"
            className={`flex items-center justify-between gap-3 ${className}`}
        >
            <button
                type="button"
                onClick={() => canPrev && onPageChange(page - 1)}
                disabled={!canPrev}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground hover:border-accent/50 disabled:opacity-40 disabled:hover:text-muted disabled:hover:border-border transition-colors"
            >
                <IconChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Mobile: compact label only */}
            <span className="text-xs font-medium text-muted sm:hidden">
                Page {page} of {pageCount}
            </span>

            {/* sm+: numbered pages */}
            <div className="hidden sm:flex items-center gap-1">
                {pages.map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        aria-current={p === page ? "page" : undefined}
                        className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                            p === page
                                ? "bg-primary text-white"
                                : "text-muted hover:text-foreground hover:bg-surface"
                        }`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={() => canNext && onPageChange(page + 1)}
                disabled={!canNext}
                aria-label="Next page"
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground hover:border-accent/50 disabled:opacity-40 disabled:hover:text-muted disabled:hover:border-border transition-colors"
            >
                <span className="hidden sm:inline">Next</span>
                <IconArrowRight className="h-3.5 w-3.5" />
            </button>
        </nav>
    );
}
