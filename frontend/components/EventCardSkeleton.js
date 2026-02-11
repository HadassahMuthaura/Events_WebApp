export default function EventCardSkeleton() {
  return (
    <div className="card animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-300" />
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded mb-2" />
        <div className="h-4 bg-gray-300 rounded mb-1 w-3/4" />
        <div className="h-4 bg-gray-300 rounded mb-4 w-1/2" />
        
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2" />
            <div className="h-4 bg-gray-300 rounded w-32" />
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2" />
            <div className="h-4 bg-gray-300 rounded w-24" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 rounded w-16" />
            <div className="h-4 bg-gray-300 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
