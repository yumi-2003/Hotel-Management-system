import { useState, useEffect } from 'react';
import { 
  Wifi, Waves, Sparkles, Dumbbell, Utensils, Coffee, 
  Car, Wine, Sunset, 
  Clock, Thermometer, Users, ShieldCheck
} from 'lucide-react';
import { getPoolStatus } from '../services/poolService';
import type { Pool } from '../types';
import { Skeleton } from '../components/ui/skeleton';

const Amenities = () => {
  const [pool, setPool] = useState<Pool | null>(null);
  const [loadingPool, setLoadingPool] = useState(true);

  useEffect(() => {
    const fetchPool = async () => {
      try {
        const data = await getPoolStatus();
        setPool(data);
      } catch (error) {
        console.error('Failed to fetch pool status', error);
      } finally {
        setLoadingPool(false);
      }
    };
    fetchPool();
  }, []);

  const generalAmenities = [
    { icon: Wifi, name: 'Complimentary High-Speed WiFi', description: 'Stay connected throughout the resort with our seamless fiber-optic network.' },
    { icon: Utensils, name: 'Fine Dining & Gastronomy', description: 'Experience culinary excellence at our three signature restaurants and rooftop bar.' },
    { icon: Sparkles, name: 'Heritage Spa & Wellness', description: 'Rejuvenate your senses with traditional treatments and modern therapy.' },
    { icon: Dumbbell, name: '24/7 Fitness Center', description: 'State-of-the-art equipment and personal training sessions available upon request.' },
    { icon: Car, name: 'Valet Parking & EV Charging', description: 'Secure parking with professional valet service and universal EV stations.' },
    { icon: Coffee, name: 'Artisan Coffee House', description: 'Freshly roasted beans and house-made pastries served in a tranquil setting.' },
  ];

  const poolStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-500 bg-green-50 border-green-200';
      case 'closed': return 'text-red-500 bg-red-50 border-red-200';
      case 'cleaning': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'maintenance': return 'text-orange-500 bg-orange-50 border-orange-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544124499-58ec52cf3de3?auto=format&fit=crop&w=1920&q=80" 
            alt="Amenity Hero" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">World-Class Facilities</h1>
          <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed uppercase tracking-[0.3em]">
            Elevating your stay with unparalleled luxury and care
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        {/* Pool Access Section */}
        <div className="mb-32">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-spa-teal font-black uppercase tracking-[0.2em] mb-4 block">Real-time Information</span>
              <h2 className="text-4xl font-black text-foreground leading-tight">Infinity Pool & Sun Terrace</h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Our infinity pool offers breathtaking horizon views and climate-controlled water for year-round comfort.
              </p>
            </div>
            {loadingPool ? (
              <Skeleton className="h-12 w-48 rounded-2xl" />
            ) : pool && (
              <div className={`px-6 py-3 rounded-2xl border-2 font-black uppercase tracking-widest flex items-center gap-3 shadow-sm ${poolStatusColor(pool.status)}`}>
                <div className="w-2 h-2 rounded-full animate-pulse bg-current" />
                Pool is currently {pool.status}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-2xl shadow-spa-teal/10 relative group">
              <img 
                src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80" 
                alt="Main Pool" 
                className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex flex-wrap gap-8">
                  <div className="flex items-center gap-3">
                    <Thermometer size={24} className="text-spa-mint" />
                    <div>
                      <p className="text-xs font-black uppercase opacity-60">Temperature</p>
                      <p className="text-xl font-bold">{pool?.temperature || 28}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={24} className="text-spa-mint" />
                    <div>
                      <p className="text-xs font-black uppercase opacity-60">Current Occupancy</p>
                      <p className="text-xl font-bold">{pool?.currentOccupancy || 0}/{pool?.maxCapacity || 50}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={24} className="text-spa-mint" />
                    <div>
                      <p className="text-xs font-black uppercase opacity-60">Operating Hours</p>
                      <p className="text-xl font-bold">{pool?.openingTime || '08:00'} - {pool?.closingTime || '22:00'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-card border border-border p-8 rounded-3xl shadow-xl shadow-spa-teal/5 h-full flex flex-col justify-center">
                <h3 className="text-2xl font-black text-foreground mb-6">Pool Policies</h3>
                <ul className="space-y-6">
                  {[
                    { icon: ShieldCheck, text: 'Certified lifeguard on duty during operating hours' },
                    { icon: Waves, text: 'Complimentary fresh towels and sunbeds' },
                    { icon: Wine, text: 'Poolside bar service available from 10:00 AM' },
                    { icon: Sunset, text: 'Sunset meditation sessions every Tuesday & Thursday' }
                  ].map((p, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-spa-mint/10 flex items-center justify-center text-spa-teal flex-shrink-0">
                        <p.icon size={20} />
                      </div>
                      <p className="text-muted-foreground font-bold leading-tight pt-2">{p.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* General Amenities Grid */}
        <div>
          <h2 className="text-4xl font-black text-foreground mb-12 text-center">Guest Experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {generalAmenities.map((am, i) => (
              <div key={i} className="bg-card border border-border p-8 rounded-3xl hover:shadow-2xl hover:shadow-spa-teal/10 hover:border-spa-teal/20 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-spa-mint/10 flex items-center justify-center text-spa-teal mb-6 group-hover:scale-110 transition-transform">
                  <am.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-foreground mb-3">{am.name}</h3>
                <p className="text-muted-foreground font-bold leading-relaxed">{am.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Amenities;
