import * as React from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Minus, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';

import RangeDatePicker from "@/components/RangeDatePicker";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchRoomTypes } from "@/store/slices/roomSlice";
import { createReservation } from "@/store/slices/reservationSlice";

interface BookingBarProps {
  initialRoomType?: string;
  initialDates?: DateRange;
}

export default function BookingBar({ initialRoomType, initialDates }: BookingBarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { roomTypes, loading: roomsLoading } = useAppSelector((state) => state.rooms);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading: reservationLoading } = useAppSelector((state) => state.reservations);

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(initialDates);
  const [selectedRoomType, setSelectedRoomType] = React.useState<string>(initialRoomType || "");
  const [adults, setAdults] = React.useState<number>(1);
  const [children, setChildren] = React.useState<number>(0);

  React.useEffect(() => {
    if (initialRoomType) {
      setSelectedRoomType(initialRoomType);
    }
  }, [initialRoomType]);

  React.useEffect(() => {
    if (initialDates) {
      setDateRange(initialDates);
    }
  }, [initialDates]);

  React.useEffect(() => {
    dispatch(fetchRoomTypes());
  }, [dispatch]);

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!dateRange?.from || !dateRange?.to || !selectedRoomType) {
      toast.error("Please select dates and room type");
      return;
    }

    const payload = {
      checkInDate: format(dateRange.from, "yyyy-MM-dd"),
      checkOutDate: format(dateRange.to, "yyyy-MM-dd"),
      roomType: selectedRoomType,
      adultsCount: adults,
      childrenCount: children,
    };

    const result = await dispatch(createReservation(payload));
    
    if (createReservation.fulfilled.match(result)) {
      toast.success("Reservation created successfully!");
      setDateRange(undefined);
      setSelectedRoomType("");
      setAdults(1);
      setChildren(0);
    } else {
      toast.error("Failed to create reservation. Please try again.");
    }
  };

  const canSubmit =
    !!dateRange?.from && !!dateRange?.to && !!selectedRoomType && (adults + children) >= 1;

  return (
    <div className="w-full max-w-6xl mx-auto -mt-16 relative z-30">
      <div className="bg-card rounded-3xl shadow-xl p-8 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          {/* Check-in */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground ml-1">Check-in</label>
            <div className="relative group">
              <RangeDatePicker
                value={dateRange}
                onChange={setDateRange}
                minDate={new Date()}
                placeholder="mm/dd/yyyy"
                className="w-full h-[52px]"
                labelMode="from"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground ml-1">Check-out</label>
            <div className="relative group">
              <RangeDatePicker
                value={dateRange}
                onChange={setDateRange}
                minDate={new Date()}
                placeholder="mm/dd/yyyy"
                className="w-full h-[52px]"
                labelMode="to"
              />
            </div>
          </div>

          {/* Adults */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground ml-1">Adults</label>
            <div className="flex items-center justify-between px-4 py-3 bg-background border border-border rounded-xl h-[52px]">
              <button 
                onClick={() => setAdults(p => Math.max(1, p - 1))}
                className="text-muted-foreground hover:text-spa-teal transition"
              >
                <Minus size={18} />
              </button>
              <span className="text-base font-bold text-foreground">{adults}</span>
              <button 
                onClick={() => setAdults(p => Math.min(10, p + 1))}
                className="text-muted-foreground hover:text-spa-teal transition"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground ml-1">Children</label>
            <div className="flex items-center justify-between px-4 py-3 bg-background border border-border rounded-xl h-[52px]">
              <button 
                onClick={() => setChildren(p => Math.max(0, p - 1))}
                className="text-muted-foreground hover:text-spa-teal transition"
              >
                <Minus size={18} />
              </button>
              <span className="text-base font-bold text-foreground">{children}</span>
              <button 
                onClick={() => setChildren(p => Math.min(10, p + 1))}
                className="text-muted-foreground hover:text-spa-teal transition"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Room Category */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground ml-1">Category</label>
            <div className="relative group">
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                disabled={roomsLoading}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 h-[52px] text-sm font-bold text-foreground outline-none appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>
                  {roomsLoading ? "Loading..." : "Select type"}
                </option>
                {roomTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.typeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
            <Button
              type="button"
              onClick={handleBookNow}
              disabled={!canSubmit || reservationLoading}
              className="bg-spa-teal hover:bg-spa-teal-dark text-white px-16 py-7 rounded-xl font-bold text-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
              {reservationLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Reserve Now
                </>
              )}
            </Button>
        </div>
      </div>
    </div>
  );
}
