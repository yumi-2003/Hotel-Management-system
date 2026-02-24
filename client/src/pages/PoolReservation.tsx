import { useState, useEffect } from 'react';
import { 
  Waves, Clock, Users, Calendar, 
  CheckCircle2, AlertCircle, Loader2, ArrowRight,
  ShieldCheck, Info
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { getPoolStatus, getPoolSlots, reservePoolSlot } from '../services/poolService';
import type { Pool, PoolSlot } from '../types';
import { Button } from '../components/ui/button';
import { toast } from 'react-hot-toast';

const PoolReservation = () => {
  const [pool, setPool] = useState<Pool | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<PoolSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [poolData, slotsData] = await Promise.all([
        getPoolStatus(),
        getPoolSlots(format(selectedDate, 'yyyy-MM-dd'))
      ]);
      setPool(poolData);
      setSlots(slotsData);
    } catch (error) {
      console.error('Failed to fetch pool data', error);
      toast.error('Failed to load pool information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleBooking = async (slotId: string) => {
    try {
      setBookingSlotId(slotId);
      await reservePoolSlot({ slotId });
      toast.success('Reservation successful!');
      fetchData(); // Refresh slots
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to book slot';
      toast.error(message);
    } finally {
      setBookingSlotId(null);
    }
  };

  if (loading && !pool) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-spa-teal h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 bg-background text-foreground min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-spa-teal/10 text-spa-teal rounded-full text-xs font-black uppercase tracking-widest">
            <Waves size={14} /> Infinity Pool & Spa
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Reserve Your Dip</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
            Escape the ordinary. Secure your exclusive time slot at our world-class infinity pool.
          </p>
        </div>

        {/* Pool Status Banner */}
        {pool && (
          <div className={`p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 border ${
            pool.status === 'open' 
              ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10' 
              : 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10'
          }`}>
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
                pool.status === 'open' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {pool.status === 'open' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
              </div>
              <div className="text-left">
                <h2 className="text-xl font-black capitalize">Pool is currently {pool.status}</h2>
                <p className="text-sm font-bold text-muted-foreground">
                  Temp: {pool.temperature}°C • Capacity: {pool.currentOccupancy}/{pool.maxCapacity} Guests
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 py-4 px-8 bg-background/50 backdrop-blur-sm rounded-3xl border border-border/50">
              <div className="text-center">
                <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Opens</span>
                <span className="text-lg font-black">{pool.openingTime}</span>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="text-center">
                <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Closes</span>
                <span className="text-lg font-black">{pool.closingTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* Slot Selection */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <Calendar className="text-spa-teal" /> Select Date
              </h3>
              <div className="flex gap-3">
                {[0, 1, 2, 3, 4].map((offset) => {
                  const date = addDays(new Date(), offset);
                  const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  return (
                    <button
                      key={offset}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all ${
                        isSelected 
                          ? 'bg-spa-teal text-white shadow-lg shadow-spa-teal/20 -translate-y-1' 
                          : 'bg-card border border-border text-muted-foreground hover:border-spa-teal/30'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        {format(date, 'EEE')}
                      </span>
                      <span className="text-xl font-black">{format(date, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-center gap-3 max-w-sm">
              <Info className="text-blue-500 shrink-0" size={20} />
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 leading-relaxed">
                Reservations are for 1-hour slots. Please arrive 10 minutes prior to your scheduled time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-card animate-pulse rounded-[2rem] border border-border" />
              ))
            ) : slots.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-4">
                <ShieldCheck size={64} className="mx-auto text-muted-foreground/20" />
                <p className="text-muted-foreground font-black text-xl uppercase tracking-widest">No slots available for this date</p>
              </div>
            ) : (
              slots.map((slot) => {
                const isFull = slot.currentReserved >= slot.maxPeople;
                const remaining = slot.maxPeople - slot.currentReserved;
                return (
                  <div 
                    key={slot._id} 
                    className={`group bg-card border rounded-[2rem] p-8 transition-all hover:shadow-xl ${
                      isFull ? 'opacity-60 grayscale' : 'hover:border-spa-teal/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-spa-teal/10 text-spa-teal rounded-2xl group-hover:scale-110 transition-transform">
                          <Clock size={20} />
                        </div>
                        <div>
                          <span className="block text-xl font-black text-foreground leading-tight">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Hourly Session
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-muted-foreground" />
                          <span className="text-sm font-bold">Capacity</span>
                        </div>
                        <span className={`text-sm font-black ${remaining < 5 ? 'text-rose-500' : 'text-spa-teal'}`}>
                          {isFull ? 'Sold Out' : `${remaining} spots left`}
                        </span>
                      </div>

                      <Button
                        onClick={() => handleBooking(slot._id)}
                        disabled={isFull || bookingSlotId === slot._id}
                        className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all ${
                          isFull 
                            ? 'bg-muted text-muted-foreground' 
                            : 'bg-spa-teal hover:bg-spa-teal-dark text-white shadow-lg shadow-spa-teal/10 hover:shadow-spa-teal/30 active:scale-95'
                        }`}
                      >
                        {bookingSlotId === slot._id ? (
                          <Loader2 className="animate-spin" />
                        ) : isFull ? (
                          'At Capacity'
                        ) : (
                          <span className="flex items-center gap-2 justify-center">
                            Book Slot <ArrowRight size={18} />
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolReservation;
