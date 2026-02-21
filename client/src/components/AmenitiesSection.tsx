import { useState, useEffect } from "react";
import * as roomService from "../services/roomService";
import { 
  Loader2, Wifi, Tv, Coffee, Wind, Monitor, Bath, Shield, 
  MapPin, Check, Waves, Car, Utensils, Dumbbell, 
  Snowflake, Cigarette, CigaretteOff 
} from "lucide-react";

// Mapping of strings/slugs to Lucide icons
const iconMap: Record<string, any> = {
  'wifi': Wifi,
  'tv': Tv,
  'coffee': Coffee,
  'tea': Coffee,
  'ac': Wind,
  'air': Wind,
  'conditioning': Wind,
  'work desk': Monitor,
  'desk': Monitor,
  'bathroom': Bath,
  'jacuzzi': Bath,
  'security': Shield,
  'parking': MapPin,
  'car': Car,
  'spa': Bath,
  'pool': Waves,
  'swimming': Waves,
  'gym': Dumbbell,
  'fitness': Dumbbell,
  'breakfast': Utensils,
  'food': Utensils,
  'fridge': Snowflake,
  'smoking': Cigarette,
  'non-smoking': CigaretteOff,
};

const getIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  for (const key in iconMap) {
    if (lowerName.includes(key)) return iconMap[key];
  }
  return Check;
};

export default function AmenitiesSection() {
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const data = await roomService.getAllAmenities();
        setAmenities(data.filter(a => a.isActive).slice(0, 6)); // Show top 6
      } catch (error) {
        console.error("Failed to fetch amenities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-spa-teal" />
      </div>
    );
  }

  return (
    <section className="bg-[#f7fbf9] py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F2F2F]">
          Premium Amenities
        </h2>

        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#0F2F2F]/70 max-w-2xl mx-auto">
          Every room includes world-class amenities designed for your comfort
          and convenience
        </p>

        <div className="mt-10 sm:mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 sm:gap-10">
          {amenities.map((item) => {
            const Icon = getIcon(item.name);

            return (
              <div
                key={item._id}
                className="flex flex-col items-center gap-3 sm:gap-4"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#dff4ee] flex items-center justify-center">
                  <Icon size={26} className="text-[#0F2F2F]" />
                </div>

                <p className="text-xs sm:text-sm font-semibold text-[#0F2F2F] text-center leading-snug">
                  {item.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
