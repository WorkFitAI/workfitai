import { HomeHeroSearch } from "@/components/home/home-hero-search"

// Stats row data
const stats = [
  { value: "10,000+", label: "Jobs" },
  { value: "5,000+", label: "Companies" },
  { value: "AI-Powered", label: "Matching" },
]

/** Hero section — main above-the-fold landing section */
export function HomeHeroSection() {
  return (
    <section className="bg-gradient-to-b from-primary/10 via-background to-background py-20 md:py-32">
      <div className="container mx-auto flex flex-col items-center px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Find Your Perfect Job{" "}
          <span className="text-primary">Match with AI</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          WorkfitAI matches your skills and experience to the best opportunities — faster and smarter.
        </p>

        <div className="mt-8 w-full max-w-xl px-4">
          <HomeHeroSearch />
        </div>

        {/* Stats row */}
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
