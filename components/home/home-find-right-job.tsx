import Image from "next/image"
import { Button } from "@/components/ui/button"

const BASE = "/imgs/page/homepage1"

/** Two-column section: visual left with real chart + team photo, copy + CTAs right */
export function HomeFindRightJob() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
        {/* Left: real chart + team photo + floating card */}
        <div className="relative">
          {/* Outer white card */}
          <div className="relative rounded-2xl bg-white p-6 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Opportunities
            </p>

            {/* Real chart image */}
            <div className="relative my-4 h-36 w-full overflow-hidden rounded-xl">
              <Image
                src={`${BASE}/img-chart.png`}
                alt="Job opportunities chart"
                fill
                className="object-cover"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Millions of jobs matched to the right talent every day
            </p>

            {/* Real team photo */}
            <div className="relative mt-4 h-44 w-full overflow-hidden rounded-xl">
              <Image
                src={`${BASE}/img1.png`}
                alt="Professional team"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Floating control card overlay */}
          <div className="absolute -bottom-4 -right-4 z-10 w-36 overflow-hidden rounded-xl shadow-xl">
            <Image
              src={`${BASE}/controlcard.png`}
              alt="Control dashboard"
              width={144}
              height={144}
              className="w-full object-contain"
            />
          </div>

          {/* Key numbers badge */}
          <div className="absolute -left-4 top-6 z-10 w-20">
            <Image
              src={`${BASE}/key-numbers.svg`}
              alt="Key stats"
              width={80}
              height={80}
              className="object-contain drop-shadow-md"
            />
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
