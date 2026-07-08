"use client";

import { useEffect, useState } from "react";
import TopCategories from "@/components/jobs/top-categories";
import { jobService } from "@/lib/job/job-service";
import { JobCategoryStats } from "@/types/job";

export function HomeTopCategories() {
  const [categories, setCategories] = useState<JobCategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await jobService.getTopCategories(8);
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching top categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <TopCategories categories={categories} />;
}