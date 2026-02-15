import Link from "next/link"
import { Button } from "@/components/ui/button"

/** CTA banner — full-width blue section prompting sign-up */
export function HomeCtaBanner() {
  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
          Ready to find your dream job?
        </h2>
        <p className="mt-3 text-primary-foreground/80">
          Join thousands of candidates already matched by WorkfitAI.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            variant="outline"
            asChild
            className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
          <Button
            asChild
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link href="/sign-up">Sign Up Free</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
