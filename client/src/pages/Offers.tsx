import { useState, useEffect } from 'react';
import { Tag, Calendar, Sparkles, Percent, Timer, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import * as roomService from '../services/roomService';
import type { RoomType } from '../types';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../components/ui/skeleton';

const Offers = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await roomService.getAllRoomTypes({ limit: 10 });
        // Only show rooms with discounts or just top rooms as "offers"
        setRooms(data.roomTypes);
      } catch (error) {
        console.error("Failed to fetch offers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const calculateDiscountedPrice = (price: number, discount: number = 0) => {
    if (discount <= 0) return price;
    return Math.round(price * (1 - discount / 100));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <section className="bg-[#0F2F2F] py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-6 w-32 mx-auto mb-6 rounded-full bg-white/10" />
            <Skeleton className="h-16 w-full max-w-2xl mx-auto mb-6 bg-white/10" />
            <Skeleton className="h-6 w-3/4 max-w-lg mx-auto bg-white/10" />
          </div>
        </section>
        <section className="py-20 px-6 max-w-7xl mx-auto w-full">
          <div className="space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row border border-border">
                <Skeleton className="lg:w-1/2 h-80 lg:h-[400px]" />
                <div className="lg:w-1/2 p-10 lg:p-16 space-y-6">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="space-y-4 py-8">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-40 rounded-2xl" />
                    <Skeleton className="h-16 w-40 rounded-2xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <section className="bg-[#0F2F2F] py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-[0.2em] mb-6">
              <Tag size={12} /> Seasonal Packages
           </div>
           <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">Exclusive Deals for Extraordinary Stays</h1>
           <p className="text-xl text-white/60 font-light max-w-2xl mx-auto">
             Discover curated offers designed to make your luxury visit even more rewarding.
           </p>
        </div>
      </section>

      {/* Offers List */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
         <div className="grid grid-cols-1 gap-12">
            {rooms.length > 0 ? (
              rooms.map((room) => {
                const discount = room.discount || 15; // Fallback for UI demo if none set
                const discountedPrice = calculateDiscountedPrice(room.basePrice, discount);
                const imageUrl = room.images && room.images.length > 0 
                  ? (room.images[0].startsWith('http') ? room.images[0] : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${room.images[0]}`)
                  : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

                return (
                  <div key={room._id} className="bg-card rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col lg:flex-row group border border-border">
                    {/* Image */}
                    <div className="lg:w-1/2 h-80 lg:h-auto relative overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt={room.typeName} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className={`absolute top-0 left-0 p-8 text-white bg-spa-teal/90 backdrop-blur-sm rounded-br-[2rem] font-bold text-xl shadow-lg`}>
                          {discount}% OFF
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <Calendar size={16} />
                          <span className="text-xs uppercase tracking-widest font-black">Limited Time Offer</span>
                        </div>
                        <h2 className="text-4xl font-bold text-foreground mb-2">{room.typeName}</h2>
                        <p className="text-spa-teal font-bold mb-8 uppercase tracking-wider text-sm">Luxury Stay & Premium Benefits</p>
                        
                        <div className="mb-10">
                          <div className="flex items-baseline gap-3 mb-2">
                             <span className="text-4xl font-black text-foreground">${discountedPrice}</span>
                             <span className="text-xl text-muted-foreground line-through decoration-red-400/50">${room.basePrice}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed text-lg">
                             {room.description.substring(0, 160)}...
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button 
                            onClick={() => navigate(`/rooms/${room._id}`)}
                            className="bg-foreground hover:bg-foreground/90 text-background px-10 py-7 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2"
                          >
                              View & Book Now <ArrowRight size={20} />
                          </Button>
                          <Button variant="ghost" className="px-10 py-7 rounded-2xl font-bold text-lg text-foreground hover:bg-muted border border-border">
                              Package Details
                          </Button>
                        </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-[3rem] border border-dashed border-border">
                 <Sparkles className="mx-auto text-slate-200 mb-4" size={48} />
                 <p className="text-muted-foreground font-bold">New seasonal offers arriving soon.</p>
              </div>
            )}
         </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 text-center">
         <div className="max-w-3xl mx-auto bg-spa-teal rounded-[3rem] p-12 lg:p-20 shadow-2xl shadow-spa-teal/20 relative overflow-hidden">
            <div className="relative z-10">
               <Timer className="text-white/40 mx-auto mb-6" size={48} />
               <h2 className="text-3xl font-bold text-white mb-4">Don't Miss Out</h2>
               <p className="text-white/80 mb-10 text-lg">Be the first to hear about new seasonal deals and flash sales at Comftay.</p>
               <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input type="email" placeholder="Email address" className="flex-1 px-6 py-4 rounded-2xl bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:ring-4 focus:ring-white/10" />
                  <Button className="bg-white text-spa-teal hover:bg-white/90 rounded-2xl font-bold px-8 h-auto py-4">Subscribe</Button>
               </div>
            </div>
            <div className="absolute top-0 right-0 p-12 opacity-10">
               <Percent size={200} className="text-white" />
            </div>
         </div>
      </section>
    </div>
  );
};

export default Offers;
