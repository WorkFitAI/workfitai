import Image from "next/image"

const BASE = "/imgs/page/homepage1"

const locations = [
  { city: "Paris",      country: "France",  companies: 5, jobs: 347,  img: `${BASE}/location1.png` },
  { city: "London",     country: "England", companies: 8, jobs: 5264, img: `${BASE}/location2.png` },
  { city: "New York",   country: "USA",     companies: 3, jobs: 4356, img: `${BASE}/location3.png` },
  { city: "Amsterdam",  country: "Holland", companies: 6, jobs: 892,  img: `${BASE}/location4.png` },
  { city: "Copenhagen", country: "Denmark", companies: 4, jobs: 1240, img: `${BASE}/location5.png` },
  { city: "Berlin",     country: "Germany", companies: 7, jobs: 2180, img: `${BASE}/location6.png` },
]

/** Jobs by location — grid of city cards with real photography + gradient text overlay */
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
              className="group relative h-52 cursor-pointer overflow-hidden rounded-xl"
            >
              {/* Real city photo */}
              <Image
                src={loc.img}
                alt={`${loc.city}, ${loc.country}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Dark gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* City info */}
              <div className="absolute bottom-3 left-4 text-white">
                <p className="font-semibold drop-shadow">
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
