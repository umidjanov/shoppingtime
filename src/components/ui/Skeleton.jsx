import React from 'react';

// ─── Base Skeleton Block ──────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`shimmer rounded-sm ${className}`}
      aria-hidden="true"
    />
  );
}

// ─── Product Card Skeleton ────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="card animate-fade-in" aria-busy="true" aria-label="Loading product">
      {/* Image */}
      <Skeleton className="w-full aspect-[3/4]" />
      {/* Content */}
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-1.5 pt-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-5 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Product Grid Skeleton ────────────────────────────────────────────────────
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Product Detail Skeleton ──────────────────────────────────────────────────
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
      {/* Image gallery */}
      <div className="space-y-3">
        <Skeleton className="w-full aspect-square" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
      {/* Details */}
      <div className="space-y-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-28" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-3 w-20 mt-4" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-16" />)}
        </div>
        <Skeleton className="h-3 w-16 mt-2" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-12" />)}
        </div>
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    </div>
  );
}

// ─── Table Row Skeleton ───────────────────────────────────────────────────────
export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr className="border-b border-stone-100">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className={`h-4 ${i === 0 ? 'w-10 h-10 rounded-sm' : i === 1 ? 'w-36' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </>
  );
}
