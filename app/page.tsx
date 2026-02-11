import AccessoriesAndUpgrades from "@/components/Home/AccessoriesAndUpgrades";
import BestLaptopDeals from "@/components/Home/BestLaptopDeals";
import BuildForSpeed from "@/components/Home/BuildForSpeed";
import ContactUs from "@/components/Home/ContactUs";
import HeroSlider from "@/components/Home/Hero";
import HotDealsoftheWeek from "@/components/Home/HotDealsoftheWeek";
import Laptops from "@/components/Home/Laptops";
import OurCategories from "@/components/Home/OurCategories";
import TestimonialsSection from "@/components/Home/TestimonialsSection";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <BestLaptopDeals />
      <OurCategories />
      <HotDealsoftheWeek />
      <Laptops />
      <AccessoriesAndUpgrades />
      <BuildForSpeed />
      <TestimonialsSection />
      <ContactUs />
    </>
  );
}
