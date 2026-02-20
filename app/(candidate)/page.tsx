import { HomeHeroSection } from "@/components/home/home-hero-section"
import { HomeJobCategories } from "@/components/home/home-job-categories"
import { HomeHiringBanner } from "@/components/home/home-hiring-banner"
import { HomeJobsOfDay } from "@/components/home/home-jobs-of-day"
import { HomeFindRightJob } from "@/components/home/home-find-right-job"
import { HomeTopRecruiters } from "@/components/home/home-top-recruiters"
import { HomeJobsByLocation } from "@/components/home/home-jobs-by-location"
import { HomeCtaBanner } from "@/components/home/home-cta-banner"

export default function HomePage() {
  return (
    <>
      <HomeHeroSection />
      <HomeJobCategories />
      <HomeHiringBanner />
      <HomeJobsOfDay />
      <HomeFindRightJob />
      <HomeTopRecruiters />
      <HomeJobsByLocation />
      <HomeCtaBanner />
    </>
  )
}
