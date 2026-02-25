import { useState, useEffect, useCallback } from 'react';
import type { RoomType, Amenity } from '../../types';
import * as roomService from '../../services/roomService';
import RoomListCard from '../../components/Rooms/RoomListCard';
import RoomFilterSidebar from '../../components/Rooms/RoomFilterSidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RoomListCardSkeleton } from '../../components/Rooms/RoomCardSkeleton';

const RoomsList = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [limit] = useState(6);

  // Filter States
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [capacity, setCapacity] = useState({ adults: 1, children: 0 });

  // Data for Filters
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  const fetchFiltersData = async () => {
    try {
      const [allRoomsData, amenitiesData] = await Promise.all([
        roomService.getAllRoomTypes({ limit: 100 }), // Get all for filter discovery
        roomService.getAllAmenities()
      ]);

      setAvailableAmenities(amenitiesData);
      const types = Array.from(new Set(allRoomsData.roomTypes.map(r => r.typeName)));
      setAvailableTypes(types);

      if (allRoomsData.roomTypes.length > 0) {
        const prices = allRoomsData.roomTypes.map(r => r.basePrice);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setMinPrice(Math.floor(min / 10) * 10);
        setMaxPrice(Math.ceil(max / 10) * 10);
        // Only set default price range if it hasn't been touched or is the default
        if (priceRange[0] === 0 && priceRange[1] === 1000) {
          setPriceRange([Math.floor(min / 10) * 10, Math.ceil(max / 10) * 10]);
        }
      }
    } catch (err) {
      console.error("Failed to load filter data", err);
    }
  };

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        adults: capacity.adults,
        children: capacity.children
      };

      if (selectedAmenities.length > 0) {
        params.amenities = selectedAmenities.join(',');
      }

      // Backend search/typeName filter could be added here if backend supported it better.
      // For now, let's keep it simple with what we implemented in the controller.

      const data = await roomService.getAllRoomTypes(params);
      
      // Since backend doesn't handle typeName filter yet, we filter client side 
      // OR we update backend to handle typeNames as well. 
      // Let's assume we want to move logic to backend eventually. 
      // For now, the backend controller handles: search, minPrice, maxPrice, adults, children, amenities.
      
      setRooms(data?.roomTypes || []);
      setTotalPages(data?.pages || 1);
      setTotalRooms(data?.total || 0);
      setError(null);
    } catch (err) {
      setError('Failed to load rooms. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, priceRange, selectedAmenities, capacity]);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleReset = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setCapacity({ adults: 1, children: 0 });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="bg-background min-h-screen pb-12">
        <div className="bg-primary/5 border-b border-border mb-8">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-foreground">Find Your Perfect Room</h1>
            <p className="text-muted-foreground mt-2">Discover comfort and luxury tailored to your needs</p>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-1/4">
              <div className="bg-card border border-border rounded-xl p-6 h-[600px] animate-pulse" />
            </aside>
            <main className="w-full lg:w-3/4">
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <RoomListCardSkeleton key={i} />
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-12">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border mb-8">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground">Find Your Perfect Room</h1>
          <p className="text-muted-foreground mt-2">Discover comfort and luxury tailored to your needs</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4">
            <RoomFilterSidebar
              priceRange={priceRange}
              setPriceRange={(val) => { setPriceRange(val); setCurrentPage(1); }}
              minPrice={minPrice}
              maxPrice={maxPrice}
              availableTypes={availableTypes}
              selectedTypes={selectedTypes}
              setSelectedTypes={(val) => { setSelectedTypes(val); setCurrentPage(1); }}
              availableAmenities={availableAmenities}
              selectedAmenities={selectedAmenities}
              setSelectedAmenities={(val) => { setSelectedAmenities(val); setCurrentPage(1); }}
              capacity={capacity}
              setCapacity={(val) => { setCapacity(val); setCurrentPage(1); }}
              onReset={handleReset}
            />
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-muted-foreground">
                Showing <span className="text-foreground font-bold">{totalRooms}</span> rooms
              </h2>
            </div>

            {error ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <p className="text-destructive mb-4">{error}</p>
                <button onClick={fetchRooms} className="text-primary underline">Retry</button>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <h3 className="text-lg font-medium text-foreground">No rooms found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters to find more options.</p>
                <button 
                  onClick={handleReset}
                  className="text-primary hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {rooms.map((room) => (
                    <RoomListCard key={room._id} room={room} />
                  ))}
                </div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border bg-card text-foreground disabled:opacity-50 hover:bg-secondary transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg border font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : 'bg-card text-foreground border-border hover:bg-secondary'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border bg-card text-foreground disabled:opacity-50 hover:bg-secondary transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RoomsList;
