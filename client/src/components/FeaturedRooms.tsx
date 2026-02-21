import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoomType } from '../types';
import * as roomService from '../services/roomService';
import { Button } from './ui/button';
import { Loader2, ArrowRight, Users, BedDouble, Maximize } from 'lucide-react';

const FeaturedRooms = () => {
  const [featuredRooms, setFeaturedRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await roomService.getAllRoomTypes();
        const rooms = response.roomTypes;
        // Filter for featured rooms, or take top 3 if none featured
        const featured = rooms.filter(r => r.isFeatured);
        setFeaturedRooms(featured.length > 0 ? featured.slice(0, 3) : rooms.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch featured rooms", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (featuredRooms.length === 0) return null;

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Featured Rooms</h2>
            <p className="text-muted-foreground">Handpicked selections for your perfect stay</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/rooms')}
            className="hidden md:flex items-center gap-2 group"
          >
            View All Rooms
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
           {/* Reusing RoomListCard but maybe we want a Grid version later. For now, list card is fine or we create a specific card */}
           {/* Actually, the user asked for "Featured Rooms" section. Typically these are grids.
               Let's reuse RoomListCard but constrain column width or make a new simple card?
               RoomListCard is horizontal. Let's make a grid of them but stack them? 
               Wait, "RoomListCard" design from user image was horizontal. 
               For Homepage, usually vertical cards are better. 
               Let's create a specific FeaturedRoomCard or just use a grid layout with a new vertical card style inline or separate.
               Let's create a simple vertical card here for Featured section as it looks better in 3-col grid.
           */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {featuredRooms.map(room => (
               <div key={room._id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col">
                 <div className="h-64 overflow-hidden relative">
                   <img 
                     src={room.images[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80'} 
                     alt={room.typeName}
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                     ${room.basePrice}/night
                   </div>
                 </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{room.typeName}</h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm mb-4">{room.description}</p>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6 mt-auto">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users size={16} className="mr-2 text-primary/70" />
                        <span>Up to {room.maxGuests} Guests</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BedDouble size={16} className="mr-2 text-primary/70" />
                        <span className="truncate">{room.bedType}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Maximize size={16} className="mr-2 text-primary/70" />
                        <span>{room.sizeSqm || 30} sqm</span>
                      </div>
                    </div>

                    <Button onClick={() => navigate(`/rooms/${room._id}`)} className="w-full">
                      View Details
                    </Button>
                  </div>
               </div>
             ))}
           </div>
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button 
            variant="outline" 
            onClick={() => navigate('/rooms')}
            className="w-full"
          >
            View All Rooms
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRooms;
