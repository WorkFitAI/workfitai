import { Button } from "@/components/ui/button"

/** Two-column section: visual placeholder left + copy + CTAs right */
export function HomeFindRightJob() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
        {/* Left: stats/chart visual */}
        <div className="relative rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Opportunities
          </p>
          {/* Wave chart placeholder */}
          <div className="my-4 flex h-24 items-end justify-around rounded-lg bg-primary/5 px-4">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="w-6 rounded-t-sm bg-primary/60"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Millions of jobs matched to the right talent every day
          </p>
          {/* Team photo placeholder */}
          <div className="mt-4 flex h-32 w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-primary/10 text-5xl">
            👥
          </div>
        </div>

        {/* Right: copy + CTAs */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Millions Of Jobs.
          </p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            Find The One That&apos;s Right For You
          </h2>
          <p className="mt-4 text-muted-foreground">
            Search all the open positions on the web. Get your own personalized salary estimate.
            Read reviews on over 600,000 companies worldwide. The right job is out there.
          </p>
          <div className="mt-8 flex gap-3">
            <Button className="bg-primary text-white hover:bg-primary/90">Search Jobs</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
