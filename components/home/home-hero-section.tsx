"use client"

import Image from "next/image"
import Link from "next/link"
import { HomeHeroSearch } from "@/components/home/home-hero-search"

const popularSearches = ["Designer", "Developer", "Manager", "Marketing", "Finance"]

const BASE = "/imgs/page/homepage1"

/** Hero section — two-column layout with text+search left, real photo collage right */
export function HomeHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-white py-16 md:py-10">
      {/* Decorative background SVG */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end opacity-30">
        <Image
          src={`${BASE}/bg-banner.svg`}
          alt=""
          width={700}
          height={600}
          className="object-contain"
          priority
        />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: text + search + social proof */}
          <div>
            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
              The <span className="text-primary">Easiest Way</span> to{" "}
              Get Your New Job
            </h1>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Each month, more than 3 million job seekers turn to website in their search for
              work, making over 140,000 applications every single day
            </p>
            <div className="mt-8">
              <HomeHeroSearch />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Popular Searches:</span>
              {popularSearches.map((term, i, arr) => (
                <span key={term}>
                  <Link
                    href={`/jobs?q=${term}`}
                    className="text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                  >
                    {term}
                  </Link>
                  {i < arr.length - 1 && (
                    <span className="text-muted-foreground">,</span>
                  )}
                </span>
              ))}
            </div>

            {/* Social proof avatar stack */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[`${BASE}/user1.png`, `${BASE}/user2.png`, `${BASE}/user3.png`].map((src, i) => (
                  <div
                    key={i}
                    className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white shadow"
                  >
                    <Image src={src} alt={`User ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">3M+</span> job seekers trust us
              </p>
            </div>
          </div>

          {/* Right: real photo collage */}
          <div className="relative hidden h-[480px] lg:block">
            {/* Main banner image */}
            <div className="absolute left-3 top-15 h-[200px] w-[55%] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src={`${BASE}/banner1.png`}
                alt="Professionals working together"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Secondary image bottom-right */}
            <div className="absolute bottom-15 right-0 h-[200px] w-[55%] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src={`${BASE}/banner2.png`}
                alt="Team celebrating success"
                fill
                className="object-cover"
              />
            </div>

            {/* Floating top badge */}
            <div className="absolute -right-2 top-4 z-10">
              <Image
                src={`${BASE}/icon-top-banner.png`}
                alt=""
                width={48}
                height={48}
                className="drop-shadow-lg"
              />
            </div>

            {/* Floating bottom badge */}
            <div className="absolute bottom-4 left-2 z-10">
              <Image
                src={`${BASE}/icon-bottom-banner.png`}
                alt=""
                width={48}
                height={48}
                className="drop-shadow-lg"
              />
            </div>

            {/* Decorative dots */}
            <div className="absolute bottom-16 left-40 h-3 w-3 rounded-full bg-primary/40" />
            <div className="absolute right-44 top-32 h-2 w-2 rounded-full bg-primary/30" />
            <div className="absolute left-48 top-8 h-2 w-2 rounded-full bg-primary/20" />
          </div>
        </div>
      </div>
    </section>
  )
}
