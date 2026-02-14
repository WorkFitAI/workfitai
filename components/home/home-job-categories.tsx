import { Monitor, Heart, TrendingUp, Megaphone, BookOpen, Wrench } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Job category data with Lucide icons
const categories = [
  { icon: Monitor, name: "Technology", count: "2,400+ jobs" },
  { icon: Heart, name: "Healthcare", count: "1,800+ jobs" },
  { icon: TrendingUp, name: "Finance", count: "1,200+ jobs" },
  { icon: Megaphone, name: "Marketing", count: "950+ jobs" },
  { icon: BookOpen, name: "Education", count: "700+ jobs" },
  { icon: Wrench, name: "Engineering", count: "1,500+ jobs" },
]

/** Featured job categories grid */
export function HomeJobCategories() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Browse by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explore opportunities across the most in-demand industries
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ icon: Icon, name, count }) => (
            <Card
              key={name}
              className="cursor-pointer border-border transition-colors hover:bg-accent hover:border-primary/30"
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
      </div>
    </section>
  )
}
