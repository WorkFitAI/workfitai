"use client"

import Link from "next/link"
import { HomeHeroSearch } from "@/components/home/home-hero-search"

const popularSearches = ["Designer", "Developer", "Manager", "Marketing", "Finance"]

/** Hero section — two-column layout with text+search left, photo collage right */
export function HomeHeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50/80 via-white to-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: text + search + popular searches */}
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
          </div>

          {/* Right: photo collage (colored placeholders) */}
          <div className="relative hidden h-[420px] lg:block">
            <div className="absolute left-0 top-4 h-52 w-44 overflow-hidden rounded-2xl bg-blue-100 shadow-lg">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-blue-200">
                <span className="text-4xl">💼</span>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-44 w-40 overflow-hidden rounded-2xl bg-indigo-100 shadow-lg">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-200 to-primary/20">
                <span className="text-4xl">🏢</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-8 h-52 w-44 overflow-hidden rounded-2xl bg-blue-50 shadow-lg">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-primary/10">
                <span className="text-4xl">🤝</span>
              </div>
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
