export default function ChartSkeleton({ height = 300 }) {
  return (
    <div 
      className="w-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center"
      style={{ height: `${height}px` }}
    >
      <div className="text-gray-400 text-sm">Loading chart...</div>
    </div>
  )
}
