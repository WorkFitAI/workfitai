"use client"

import Image from "next/image"
import { useRef } from "react"
import { ChevronLeft, ChevronRight, Code2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const BASE = "/imgs/page/homepage1"

const categories = [
  { img: `${BASE}/human.svg`,      name: "Human Resource",  count: "1,245 Jobs Available" },
  { img: `${BASE}/content.svg`,    name: "Content Writer",  count: "986 Jobs Available" },
  { img: `${BASE}/marketing.svg`,  name: "Marketing & Sale",count: "2,143 Jobs Available" },
  { img: `${BASE}/finance.svg`,    name: "Finance",         count: "1,567 Jobs Available" },
  { img: `${BASE}/management.svg`, name: "Management",      count: "891 Jobs Available" },
  { img: `${BASE}/research.svg`,   name: "Market Research", count: "432 Jobs Available" },
  { img: `${BASE}/customer.svg`,   name: "Customer Help",   count: "789 Jobs Available" },
  { img: null,                      name: "Software",        count: "3,201 Jobs Available" },
]

/** Horizontally scrollable job categories with branded SVG icons */
export function HomeJobCategories() {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })
  }
  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })
  }

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Browse by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explore opportunities across the most in-demand industries
          </p>
        </div>

        <div className="relative">
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white p-2 shadow-md hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {categories.map(({ img, name, count }) => (
              <Card
                key={name}
                className="min-w-[160px] cursor-pointer border-border transition-colors hover:border-primary hover:text-primary"
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 p-2">
                    {img ? (
                      <Image src={img} alt={name} width={40} height={40} className="object-contain" />
                    ) : (
                      <Code2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <p className="font-medium text-foreground">{name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{count}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white p-2 shadow-md hover:border-primary hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
