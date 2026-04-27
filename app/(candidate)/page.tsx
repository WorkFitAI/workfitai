import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HomeJobsOfDay } from "@/components/home/home-jobs-of-day";
import { HomeFindRightJob } from "@/components/home/home-find-right-job";
import { HomeLatestNews } from "@/components/home/home-latest-news";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <HomeHeroSection />
      </Suspense>
      <HomeJobsOfDay />
      <HomeFindRightJob />
      <HomeLatestNews />
    </>
  );
}
