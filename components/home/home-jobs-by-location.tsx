const locations = [
  { city: "Paris", country: "France", companies: 5, jobs: 347, gradient: "from-pink-400/80 to-rose-500/80" },
  { city: "London", country: "England", companies: 8, jobs: 5264, gradient: "from-blue-500/80 to-indigo-600/80" },
  { city: "New York", country: "USA", companies: 3, jobs: 4356, gradient: "from-orange-400/80 to-amber-500/80" },
  { city: "Amsterdam", country: "Holland", companies: 6, jobs: 892, gradient: "from-teal-400/80 to-cyan-500/80" },
  { city: "Copenhagen", country: "Denmark", companies: 4, jobs: 1240, gradient: "from-purple-500/80 to-violet-600/80" },
  { city: "Berlin", country: "Germany", companies: 7, jobs: 2180, gradient: "from-slate-500/80 to-gray-600/80" },
]

/** Jobs by location — grid of city cards with gradient overlay */
export function HomeJobsByLocation() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Jobs by Location</h2>
          <p className="mt-2 text-muted-foreground">
            Find jobs in the cities that matter most to you
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <div
              key={`${loc.city}-${loc.country}`}
              className="relative h-48 cursor-pointer overflow-hidden rounded-xl"
            >
              {/* Colored background (replaces photo) */}
              <div className={`absolute inset-0 bg-gradient-to-br ${loc.gradient}`} />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-3 left-3 text-white">
                <p className="font-semibold">
                  {loc.city}, {loc.country}
                </p>
                <p className="text-xs opacity-80">
                  {loc.companies} Companies · {loc.jobs.toLocaleString()} Jobs
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
