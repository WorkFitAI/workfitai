"use client";

import { JobCategoryStats } from "@/types/job";
import { ArrowRight, BriefcaseBusiness, Flame } from "lucide-react";
import Link from "next/link";

interface Props {
  categories: JobCategoryStats[];
}

export default function TopCategories({ categories }: Props) {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm dark:bg-background">
        <div className="flex flex-col gap-4 border-b px-8 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary items-center gap-1">
              <Flame color="#ffbd30" fill="red"/> Trending
            </span>

            <h2 className="text-3xl font-bold tracking-tight">
              Explore jobs by category
            </h2>

            <p className="mt-2 text-muted-foreground">
              Discover the most active hiring categories and find your next
              opportunity.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition hover:bg-primary hover:text-primary-foreground"
          >
            Explore all jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 p-8">
          {categories.map((category) => (
            <Link
              key={category.jobCategoryId}
              href={`/jobs?categoryName=${encodeURIComponent(category.name)}`}
              className="group flex items-center gap-4 rounded-2xl border bg-muted/20 px-5 py-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:bg-primary/5 hover:shadow-lg"
            >
              <div className="rounded-xl bg-primary/10 p-3 transition group-hover:bg-primary group-hover:text-primary-foreground">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold transition group-hover:text-primary">
                  {category.name}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {category.totalJobs}
                  </span>{" "}
                  open positions
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}