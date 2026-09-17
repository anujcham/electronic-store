import { ConditionBannerSection } from "../components/home/ConditionBannerSection";
import { EcoImpactSection } from "../components/home/EcoImpactSection";
import { FeaturedPhones } from "../components/home/FeaturedPhones";
import { FinalCTA } from "../components/home/FinalCTA";
import { HeroSection } from "../components/home/HeroSection";
import { HotDealsSection } from "../components/home/HotDealsSection";
import { PhoneCategories } from "../components/home/PhoneCategories";
import { PromoBannerOne } from "../components/home/PromoBannerOne";
import { PromoBannerTwo } from "../components/home/PromoBannerTwo";
import { Testimonials } from "../components/home/Testimonials";
import { TrustBenefits } from "../components/home/TrustBenefits";
import { WhyBuyRefurbished } from "../components/home/WhyBuyRefurbished";

export default function Home() {
  return (
    <main>
      {/* 1st Section: Hero Banner */}
      <HeroSection />

      {/* 2nd Section: Trust & UK Benefits */}
      <TrustBenefits />

      {/* 3rd Section: Shop By Brand */}
      <PhoneCategories />

      {/* 4th Section: Refurbished Tech Quality Banner with custom generated visual */}
      <PromoBannerOne />

      {/* 5th Section: Featured Phones */}
      <FeaturedPhones />

      {/* 6th Section: Clearance & Hot Deals Flash Banner with custom generated visual */}
      <PromoBannerTwo />

      {/* 7th Section: Dynamic Hot Deals Showcase (managed live from Admin / Staff Portal) */}
      <HotDealsSection />

      {/* Remaining Home Page Sections */}
      <ConditionBannerSection />
      <WhyBuyRefurbished />
      <EcoImpactSection />
      <Testimonials />
      <FinalCTA />
    </main>
  );
}
