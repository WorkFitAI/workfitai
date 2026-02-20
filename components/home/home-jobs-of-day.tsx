"use client"

import { useState } from "react"
import { Bookmark, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const tabs = [
  "Browse & Promote",
  "Content Writer",
  "Monitoring & Sale",
  "Customer Help",
  "Finance",
  "Human Resources",
]

const jobs = [
  { id: 1, company: "Onda", title: "DevOps Account Executive", tags: ["Full-time", "Remote"], salaryMin: 5700, salaryMax: 12500, category: "browse & promote" },
  { id: 2, company: "Square", title: "Support Engineer Enterprise", tags: ["Full-time", "On-site"], salaryMin: 3300, salaryMax: 7600, category: "browse & promote" },
  { id: 3, company: "Stripe", title: "Frontend Software Engineer", tags: ["Contract", "Remote"], salaryMin: 7000, salaryMax: 15000, category: "browse & promote" },
  { id: 4, company: "Notion", title: "Product Designer", tags: ["Full-time", "Hybrid"], salaryMin: 4500, salaryMax: 9000, category: "browse & promote" },
  { id: 5, company: "Medium", title: "Content Strategist", tags: ["Part-time", "Remote"], salaryMin: 2500, salaryMax: 5000, category: "content writer" },
  { id: 6, company: "Mailchimp", title: "Email Marketing Writer", tags: ["Full-time", "On-site"], salaryMin: 3000, salaryMax: 6500, category: "content writer" },
  { id: 7, company: "Salesforce", title: "Sales Operations Manager", tags: ["Full-time", "On-site"], salaryMin: 6000, salaryMax: 13000, category: "monitoring & sale" },
  { id: 8, company: "Zendesk", title: "Customer Success Manager", tags: ["Full-time", "Remote"], salaryMin: 4000, salaryMax: 8500, category: "customer help" },
]

/** Jobs of the Day — tabbed grid of job cards */
export function HomeJobsOfDay() {
  const [activeTab, setActiveTab] = useState(tabs[0])

  const filtered =
    activeTab === tabs[0]
      ? jobs
      : jobs.filter((j) => j.category === activeTab.toLowerCase())

  const displayed = filtered.slice(0, 4)

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Jobs of the Day</h2>
          <p className="mt-2 text-muted-foreground">
            Find your perfect match from today&apos;s top listings
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-primary text-white"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Job cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayed.map((job) => (
            <Card
              key={job.id}
              className="cursor-pointer border-border transition-all hover:border-primary/40 hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                      <p className="text-sm font-semibold text-foreground">{job.title}</p>
                    </div>
                  </div>
                  <Bookmark className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-3 text-sm font-semibold text-foreground">
                  ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}
                  <span className="font-normal text-muted-foreground"> /monthly</span>
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
