'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-6 w-12 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-11 bg-gray-200 rounded-lg" />
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <div className="w-11 h-11 bg-gray-200 rounded-lg" />
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="w-11 h-11 bg-gray-200 rounded-lg" />
      </div>
      {/* テーブルヘッダー */}
      <div className="grid grid-cols-4 gap-2 p-2 border-b">
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
      {/* テーブルボディ */}
      <div className="p-2 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            <div className="h-11 bg-gray-100 rounded" />
            <div className="h-11 bg-gray-200 rounded" />
            <div className="h-11 bg-gray-200 rounded" />
            <div className="h-11 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </td>
      <td className="px-4 py-3">
        <div className="h-6 w-12 bg-gray-200 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <div className="h-8 w-16 bg-gray-200 rounded" />
      </td>
    </tr>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-5">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
      {/* メインコンテンツ */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
