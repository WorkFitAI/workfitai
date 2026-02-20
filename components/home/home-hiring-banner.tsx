import { Button } from "@/components/ui/button"

/** "We Are Hiring" promotional banner in light blue */
export function HomeHiringBanner() {
  return (
    <section className="bg-blue-50 py-12">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 sm:flex-row">
        <div className="flex items-center gap-6">
          {/* Illustration placeholder */}
          <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-4xl lg:flex">
            🚀
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              We Are Hiring
            </span>
            <h3 className="mt-1 text-2xl font-bold text-foreground">
              Let&apos;s Work Together
            </h3>
            <p className="text-sm text-muted-foreground">Explore Opportunities</p>
          </div>
        </div>
        <Button className="shrink-0 bg-primary text-white hover:bg-primary/90">Apply</Button>
      </div>
    </section>
  )
}
