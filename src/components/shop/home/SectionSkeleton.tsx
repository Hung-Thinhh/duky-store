/**
 * Loading skeleton placeholder for below-fold homepage sections.
 * Displayed while lazy-loaded sections are being fetched.
 */
export function SectionSkeleton() {
  return (
    <div
      className="w-full animate-pulse bg-gray-100 rounded-lg"
      style={{ minHeight: "400px" }}
      aria-hidden="true"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
        {/* Title placeholder */}
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
        {/* Content placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
