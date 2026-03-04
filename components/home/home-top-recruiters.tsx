import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const recruiters = [
  { name: "LinkedIn", rating: 4.5, location: "Germany, UK", jobs: 23, color: "bg-blue-600" },
  { name: "Adobe", rating: 4.2, location: "France, UK", jobs: 13, color: "bg-red-500" },
  { name: "Bing", rating: 4.0, location: "USA, Canada", jobs: 9, color: "bg-teal-500" },
  { name: "Dailymotion", rating: 3.9, location: "France", jobs: 7, color: "bg-orange-500" },
  { name: "Netflix", rating: 4.7, location: "USA", jobs: 31, color: "bg-red-600" },
  { name: "Spotify", rating: 4.4, location: "Sweden, UK", jobs: 18, color: "bg-green-500" },
  { name: "Nintendo", rating: 4.3, location: "Japan, USA", jobs: 11, color: "bg-red-400" },
  { name: "Periscope", rating: 4.1, location: "USA", jobs: 6, color: "bg-purple-500" },
  { name: "NewSun", rating: 3.8, location: "Vietnam", jobs: 14, color: "bg-yellow-500" },
  { name: "PowerHome", rating: 4.0, location: "UK", jobs: 8, color: "bg-indigo-500" },
]

/** Top Recruiters grid */
export function HomeTopRecruiters() {
  return (
    <section className="bg-gray-50/50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Top Recruiters</h2>
          <p className="mt-2 text-muted-foreground">
            Discover your next career move, freelance gig, or internship
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {recruiters.map((r) => (
            <div
              key={r.name}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-4 text-center transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white",
                  r.color
                )}
              >
                {r.name[0]}
              </div>
              <p className="text-sm font-semibold text-foreground">{r.name}</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">{r.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">{r.location}</p>
              <p className="text-xs text-primary">{r.jobs} Opening Jobs</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
