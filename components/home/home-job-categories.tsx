"use client"

import { useRef } from "react"
import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Code2,
  DollarSign,
  Headphones,
  PenLine,
  Search,
  TrendingUp,
  Users,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  { icon: Users, name: "Human Resource", count: "1,245 Jobs Available" },
  { icon: PenLine, name: "Content Writer", count: "986 Jobs Available" },
  { icon: TrendingUp, name: "Marketing & Sale", count: "2,143 Jobs Available" },
  { icon: DollarSign, name: "Finance", count: "1,567 Jobs Available" },
  { icon: BarChart2, name: "Management", count: "891 Jobs Available" },
  { icon: Search, name: "Market Research", count: "432 Jobs Available" },
  { icon: Headphones, name: "Customer Help", count: "789 Jobs Available" },
  { icon: Code2, name: "Software", count: "3,201 Jobs Available" },
]

/** Horizontally scrollable job categories with prev/next arrows */
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
            {categories.map(({ icon: Icon, name, count }) => (
              <Card
                key={name}
                className="min-w-[160px] cursor-pointer border-border transition-colors hover:border-primary hover:text-primary"
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-3 rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
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
