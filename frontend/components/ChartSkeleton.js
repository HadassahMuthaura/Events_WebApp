export default function ChartSkeleton({ height = 300 }) {
  return (
    <div
      className="w-full rounded-xl border border-gray-100 bg-white p-4 sm:p-6 animate-pulse"
      style={{ minHeight: `${height}px` }}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 bg-gray-200 rounded-md w-32" />
        <div className="h-9 bg-gray-200 rounded-lg w-24" />
      </div>

      <div className="h-[calc(100%-3.5rem)] min-h-[160px] rounded-lg bg-gray-50 p-3 sm:p-4 flex items-end gap-2 sm:gap-3">
        <div className="flex-1 h-[42%] rounded-md bg-gray-200" />
        <div className="flex-1 h-[58%] rounded-md bg-gray-200" />
        <div className="flex-1 h-[48%] rounded-md bg-gray-200" />
        <div className="flex-1 h-[74%] rounded-md bg-gray-200" />
        <div className="flex-1 h-[63%] rounded-md bg-gray-200" />
        <div className="flex-1 h-[82%] rounded-md bg-gray-200" />
      </div>
    </div>
  )
}
