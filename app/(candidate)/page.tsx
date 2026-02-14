import { HomeHeroSection } from "@/components/home/home-hero-section"
import { HomeJobCategories } from "@/components/home/home-job-categories"
import { HomeHowItWorks } from "@/components/home/home-how-it-works"
import { HomeCtaBanner } from "@/components/home/home-cta-banner"

export default function HomePage() {
  return (
    <>
      <HomeHeroSection />
      <HomeJobCategories />
      <HomeHowItWorks />
      <HomeCtaBanner />
    </>
  )
}
