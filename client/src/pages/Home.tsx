import AmenitiesSection from "@/components/AmenitiesSection";
import BookingBar from "@/components/BookingBar";
import HeroSection from "@/components/HeroSection";
import FeaturedRooms from "@/components/FeaturedRooms";
import Testimonials from "@/components/Testimonials";

function Home() {
  return (
    <section>
      <HeroSection />
      <BookingBar />
      <FeaturedRooms />
      <Testimonials />
      <AmenitiesSection />
    </section>
  );
}

export default Home;
