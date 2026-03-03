import Image from "next/image"
import { Button } from "@/components/ui/button"

const BASE = "/imgs/page/homepage1"

/** "We Are Hiring" promotional banner with real decorative SVG panels */
export function HomeHiringBanner() {
  return (
    <section className="relative overflow-hidden bg-blue-50 py-12">
      {/* Left decorative panel */}
      <div className="pointer-events-none absolute left-0 top-0 hidden h-full lg:block">
        <Image
          src={`${BASE}/bg-left-hiring.svg`}
          alt=""
          width={220}
          height={200}
          className="h-full w-auto object-cover"
        />
      </div>

      {/* Right decorative panel */}
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full lg:block">
        <Image
          src={`${BASE}/bg-right-hiring.svg`}
          alt=""
          width={220}
          height={200}
          className="h-full w-auto object-cover"
        />
      </div>

      <div className="container relative mx-auto flex flex-col items-center justify-between gap-6 px-4 sm:flex-row">
        <div className="flex items-center gap-6">
          {/* Lightning icon replacing emoji */}
          <div className="hidden h-16 w-16 shrink-0 items-center justify-center lg:flex">
            <Image
              src={`${BASE}/lightning.svg`}
              alt="Hiring"
              width={56}
              height={56}
              className="object-contain"
            />
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
        <Button className="shrink-0 bg-primary text-white hover:bg-primary/90">Apply Now</Button>
      </div>
    </section>
  )
}
