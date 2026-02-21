import { useNavigate } from 'react-router-dom';
import { Wifi, Tv, Coffee, Wind, Monitor, Users, Bath } from 'lucide-react';
import type { RoomType } from '../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface RoomListCardProps {
  room: RoomType;
}

const RoomListCard = ({ room }: RoomListCardProps) => {
  const navigate = useNavigate();

  // Helper to get icon for amenity
  const getAmenityIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('wifi')) return <Wifi size={14} />;
    if (lowerName.includes('tv')) return <Tv size={14} />;
    if (lowerName.includes('coffee') || lowerName.includes('breakfast')) return <Coffee size={14} />;
    if (lowerName.includes('ac') || lowerName.includes('air')) return <Wind size={14} />;
    if (lowerName.includes('desk') || lowerName.includes('work')) return <Monitor size={14} />;
    if (lowerName.includes('bath') || lowerName.includes('jacuzzi')) return <Bath size={14} />;
    return <Users size={14} />;
  };

  return (
    <div className="flex flex-col md:flex-row bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Image Section */}
      <div className="w-full md:w-1/3 min-h-[200px] relative overflow-hidden">
        <img
          src={room.images[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80'}
          alt={room.typeName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {room.isFeatured && (
          <Badge className="absolute top-3 left-3 bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-sm">
            Featured
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">{room.typeName}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-1">{room.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="text-xs uppercase tracking-wider border-primary/20 text-primary">
                {room.typeName.split(' ').pop()}
              </Badge>
              {room.availability && (
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    room.availability.available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {room.availability.available > 0 ? 'Available' : 'Booked'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {room.availability.available} rooms left
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="my-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={16} className="text-primary" />
              <span>Max: {room.maxAdults} adults, {room.maxChildren} children</span>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 5).map((amenity, index) => {
                // Handle both populated (object) and unpopulated (string ID) amenities
                const amenityName = typeof amenity === 'string' ? 'Amenity' : amenity.name;
                return (
                  <span
                    key={typeof amenity === 'string' ? `${amenity}-${index}` : amenity._id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/50 text-xs font-medium text-secondary-foreground border border-border/50"
                  >
                    {getAmenityIcon(amenityName)}
                    {amenityName}
                  </span>
                );
              })}
              {room.amenities.length > 5 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary/50 text-xs text-muted-foreground">
                  +{room.amenities.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-border">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">${room.basePrice}</span>
            <span className="text-xs text-muted-foreground">per night</span>
          </div>
          <Button 
            onClick={() => navigate(`/rooms/${room._id}`)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-sm"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomListCard;
