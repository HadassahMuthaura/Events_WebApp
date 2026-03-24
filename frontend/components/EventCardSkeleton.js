export default function EventCardSkeleton() {
  return (
    <div className="card w-full overflow-hidden animate-pulse" aria-hidden="true">
      <div className="relative h-44 sm:h-48 bg-gray-200">
        <div className="absolute top-3 right-3 h-7 w-20 rounded-full bg-gray-300" />
      </div>

      <div className="p-4 sm:p-5">
        <div className="h-6 bg-gray-200 rounded-md mb-3 w-11/12" />
        <div className="h-4 bg-gray-200 rounded-md mb-2 w-full" />
        <div className="h-4 bg-gray-200 rounded-md mb-5 w-8/12" />

        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded mr-2 flex-shrink-0" />
            <div className="h-4 bg-gray-200 rounded-md w-7/12" />
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded mr-2 flex-shrink-0" />
            <div className="h-4 bg-gray-200 rounded-md w-6/12" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 bg-gray-200 rounded-md w-4/12" />
            <div className="h-4 bg-gray-200 rounded-md w-5/12" />
          </div>
        </div>
      </div>
    </div>
  )
}
