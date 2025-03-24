export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-beige sm:py-14 py-12 relative"></div>
      <div className="bg-white pt-8 sm:px-3 sm:pt-4 px-3">
        <div className="grid grid-cols-6 sm:gap-8 gap-3 container mx-auto">
          <div className="relative md:col-span-1 sm:col-span-2 col-span-6">
            <div className="relative w-[40vw] md:w-full md:left-0 md:translate-x-0">
              <div className="absolute max-w-[100px] sm:max-w-[120px] md:max-w-[160px] w-full md:bottom-0 bottom-0 border border-grey-extraDark aspect-square rounded-full overflow-hidden md:translate-y-[60%] translate-y-[30%] bg-gray-200 animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:col-span-3 col-span-6 mt-8 sm:mt-4 md:mt-0">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="md:col-span-2 col-span-6 flex gap-2 mb-6 sm:mb-0 md:justify-end justify-start flex-col">
            <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="bg-white sm:px-8 px-3">
        <div className="container mx-auto gap-8 grid md:grid-cols-3 sm:grid-cols-1 md:py-14 sm:py-8">
          <div className="md:col-span-2 sm:col-span-2 gap-10">
            <div className="flex flex-col gap-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="md:col-span-1 sm:col-span-2 space-y-8">
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
