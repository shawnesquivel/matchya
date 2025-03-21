export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto animate-pulse">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Image skeleton */}
          <div className="w-full md:w-1/3">
            <div className="aspect-square bg-gray-200 rounded-lg" />
          </div>

          {/* Basic Info skeleton */}
          <div className="w-full md:w-2/3">
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-6 bg-gray-200 rounded-full w-20"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Areas of Focus skeleton */}
        <section className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded-full w-24"></div>
            ))}
          </div>
        </section>

        {/* Education & Experience skeleton */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {[1, 2].map((section) => (
            <section key={section}>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Practice Details skeleton */}
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2].map((section) => (
            <section key={section}>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
