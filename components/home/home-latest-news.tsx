import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const BASE = "/imgs/page/homepage1"

const news = [
  {
    img: `${BASE}/img-news1.png`,
    category: "Career Tips",
    date: "March 1, 2026",
    title: "10 Resume Mistakes That Are Costing You Interviews",
    excerpt: "Avoid these common pitfalls that hiring managers see every day in applicant resumes.",
    href: "#",
  },
  {
    img: `${BASE}/img-news2.png`,
    category: "Workplace",
    date: "February 25, 2026",
    title: "How to Negotiate Your Salary With Confidence",
    excerpt: "Expert-backed strategies to get the compensation you deserve at every career stage.",
    href: "#",
  },
  {
    img: `${BASE}/img-news3.png`,
    category: "Hiring Trends",
    date: "February 18, 2026",
    title: "Remote Work in 2026: What Employers Are Looking For",
    excerpt: "The landscape of remote hiring has changed. Here's what skills top companies prioritize now.",
    href: "#",
  },
]

/** Latest News / Blog section — 3-card grid with real thumbnail photos */
export function HomeLatestNews() {
  return (
    <section className="bg-gray-50/50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Latest News</h2>
            <p className="mt-2 text-muted-foreground">
              Stay up to date with tips, trends, and career insights
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="#" className="flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* News cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((article) => (
            <Card
              key={article.title}
              className="group overflow-hidden border-border transition-all hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={article.img}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Category badge */}
                <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white shadow">
                  {article.category}
                </span>
              </div>

              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {article.date}
                </div>
                <h3 className="font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {article.excerpt}
                </p>
                <Link
                  href={article.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Read More <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
