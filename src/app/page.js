import { ConditionBannerSection } from "../components/home/ConditionBannerSection";
import { EcoImpactSection } from "../components/home/EcoImpactSection";
import { FeaturedPhones } from "../components/home/FeaturedPhones";
import { FinalCTA } from "../components/home/FinalCTA";
import { HeroSection } from "../components/home/HeroSection";
import { PhoneCategories } from "../components/home/PhoneCategories";
import { Testimonials } from "../components/home/Testimonials";
import { TrustBenefits } from "../components/home/TrustBenefits";
import { WhyBuyRefurbished } from "../components/home/WhyBuyRefurbished";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TrustBenefits />
      <ConditionBannerSection />
      <PhoneCategories />
      <FeaturedPhones />
      <WhyBuyRefurbished />
      <EcoImpactSection />
      <Testimonials />
      <FinalCTA />
    </main>
  );
}
