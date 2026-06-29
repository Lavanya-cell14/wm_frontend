import React from 'react';

/**
 * Reusable Loading Skeleton Component
 * Displays a premium shimmering animation to represent loading state.
 */
export const LoadingSkeleton = ({ variant = 'default', rows = 3 }) => {
  if (variant === 'table') {
    return (
      <div className="w-full space-y-4 p-4 animate-pulse">
        {/* Table Header */}
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
        {/* Table Rows */}
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex space-x-4 items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-6 bg-slate-150 dark:bg-slate-850 rounded w-1/3" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
            <div className="h-6 bg-slate-150 dark:bg-slate-850 rounded w-1/12" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/8" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 animate-pulse">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-4 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-150 dark:bg-slate-850 rounded-full w-12" />
            </div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-150 dark:bg-slate-850 rounded w-full" />
              <div className="h-3 bg-slate-150 dark:bg-slate-850 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default block loading skeleton
  return (
    <div className="w-full space-y-6 p-6 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-slate-200 dark:bg-slate-800 h-12 w-12" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-3 bg-slate-150 dark:bg-slate-850 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-4 bg-slate-150 dark:bg-slate-850 rounded col-span-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded col-span-1" />
        </div>
        <div className="h-3 bg-slate-150 dark:bg-slate-850 rounded w-5/6" />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
