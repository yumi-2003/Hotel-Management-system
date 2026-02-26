import { Link } from "react-router-dom";
import heroImg from "../assets/images/hero2.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[75vh] w-full overflow-hidden">
      {/* background image  */}
      <img
        src={heroImg}
        alt="Hotel Nauter"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Green overlay */}
      <div className="absolute inset-0 bg-[#0F2F2F]/70"></div>
      {/* Contents */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 pt-24 pb-36 text-center">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white leading-tight tracking-tight">
          Comftay
        </h1>
        <div className="flex justify-center w-full">
          <p className="mt-6 text-base sm:text-lg md:text-xl text-white/90 max-w-fit mx-auto font-medium overflow-hidden whitespace-nowrap border-r-2 border-white/50 animate-heroic-typewriter">
            Experience peaceful comfort with sustainable amenities and
            personalized service in a serene natural setting
          </p>
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            to="/rooms"
            className="bg-white hover:bg-slate-50 text-spa-teal px-10 py-4 rounded-lg font-extrabold text-xl shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            Explore Rooms
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
