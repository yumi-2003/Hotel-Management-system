import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchMyReservations } from '../store/slices/reservationSlice';
import { createBooking, fetchMyBookings } from '../store/slices/bookingSlice';
import { fetchNotifications } from '../store/slices/notificationSlice';
import { format, isSameDay } from 'date-fns';
import type { Reservation, Booking } from '../types';
import PaymentSection from '../components/booking/PaymentSection';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Calendar, Home, Waves } from 'lucide-react';

const MyReservations = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { reservations, loading: resLoading } = useAppSelector((state) => state.reservations);
  const { bookings, loading: bookingLoading } = useAppSelector((state) => state.bookings);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [selectedResForPayment, setSelectedResForPayment] = useState<Reservation | null>(null);

  useEffect(() => {
    dispatch(fetchMyReservations());
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleConfirmBooking = async (method: 'Card' | 'Cash') => {
    if (!selectedResForPayment) return;

    const reservation = selectedResForPayment;
    
    const payload = {
      reservationId: reservation._id,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      adultsCount: reservation.adultsCount,
      childrenCount: reservation.childrenCount,
      bookedRooms: reservation.reservedRooms.map(room => ({
        roomId: typeof room.roomId === 'object' ? room.roomId._id : room.roomId,
        pricePerNight: room.pricePerNight,
        nights: room.nights,
        subtotal: room.subtotal
      })),
      subtotalAmount: reservation.subtotalAmount,
      taxAmount: reservation.taxAmount,
      totalPrice: reservation.totalAmount, // Use the totalAmount which already includes 15% tax
      paymentMethod: method,
      status: method === 'Card' ? 'confirmed' : 'confirmed_unpaid'
    };

    const result = await dispatch(createBooking(payload));
    if (createBooking.fulfilled.match(result)) {
      toast.success('Payment processed successfully!');
      setSelectedResForPayment(null);
      dispatch(fetchMyReservations());
      dispatch(fetchMyBookings());
      dispatch(fetchNotifications());
      // Navigate to confirmation page
      navigate('/booking/confirmation', { 
        state: { 
          status: 'success', 
          booking: result.payload 
        } 
      });
    } else {
      const errorMsg = result.payload as string || 'Unknown error';
      toast.error('Payment failed: ' + errorMsg);
      // Navigate to confirmation page with failure state
      navigate('/booking/confirmation', { 
        state: { 
          status: 'failure', 
          error: errorMsg,
          booking: payload 
        } 
      });
    }
  };

  const activeStays = bookings.filter(b => b.status === 'checked_in');
  const checkoutToday = activeStays.find(b => isSameDay(new Date(b.checkOutDate), new Date()));

  if (selectedResForPayment) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <PaymentSection 
            reservation={selectedResForPayment}
            onPaymentComplete={handleConfirmBooking}
            onCancel={() => setSelectedResForPayment(null)}
            loading={bookingLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">My Stays & Bookings</h1>
          <p className="text-muted-foreground font-medium">Manage your active stays and future reservations</p>
        </div>
        <div className="bg-spa-teal/5 border border-spa-teal/10 px-6 py-3 rounded-2xl">
          <p className="text-xs font-bold text-spa-teal uppercase tracking-widest mb-1">Signed in as</p>
          <p className="font-bold text-foreground">{user?.fullName || user?.name}</p>
        </div>
      </div>
      
      {/* Checkout Alert Banner */}
      {checkoutToday && (
        <div className="mb-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-200 border border-orange-400/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30">
              <AlertTriangle size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black mb-1">Check-out Reminder</h2>
              <p className="text-white/90 font-medium">Your stay for Room {typeof checkoutToday.bookedRooms?.[0]?.roomId === 'object' ? checkoutToday.bookedRooms[0].roomId.roomNumber : 'N/A'} ends today. Please remember to check out by 11:00 AM.</p>
            </div>
            <button 
              onClick={() => toast.success('Guest assistance notified. We will help you with your luggage shortly.')}
              className="bg-white text-orange-600 hover:bg-orange-50 font-black px-8 py-4 rounded-2xl transition shadow-lg whitespace-nowrap"
            >
              Need Help?
            </button>
          </div>
        </div>
      )}

      {/* Active Stays Section */}
      {activeStays.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-spa-teal text-white rounded-xl flex items-center justify-center shadow-lg shadow-spa-teal/20">
              <Home size={20} />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Active Stays</h2>
          </div>

          <div className="mb-8 bg-[#0F2F2F] rounded-[2rem] p-8 text-white relative overflow-hidden group border border-white/5">
            <div className="absolute -bottom-10 -right-10 p-4 opacity-10 group-hover:scale-110 transition-transform rotate-12">
              <Waves size={200} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-spa-teal text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-spa-teal/20">
                <Waves size={32} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-black mb-2 tracking-tight">Infinity Pool Experience</h2>
                <p className="text-slate-300 font-medium leading-relaxed">Relax and rejuvenate in our temperature-controlled infinity pool. Book your 60-minute private slot to ensure a serene experience.</p>
              </div>
              <button 
                onClick={() => navigate('/pool/reserve')}
                className="bg-spa-teal hover:bg-spa-teal-dark text-white font-black px-10 py-5 rounded-3xl transition-all shadow-xl shadow-spa-teal/20 hover:-translate-y-1 active:translate-y-0 whitespace-nowrap"
              >
                Reserve Slot
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeStays.map(booking => (
              <BookingCard key={booking._id} booking={booking} status="active" />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-12 max-w-2xl">
        {/* Future Reservations */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-spa-mint dark:bg-spa-teal/20 text-spa-teal rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Reservations</h2>
          </div>
          
          {(resLoading || bookingLoading) && reservations.length === 0 ? (
            <div className="py-12 text-center bg-card border border-border rounded-3xl">
              <div className="animate-spin w-8 h-8 border-4 border-spa-teal border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground font-bold">Syncing your records...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
              <p className="text-muted-foreground font-bold mb-4">No future reservations found</p>
              <button onClick={() => navigate('/')} className="text-spa-teal font-black border-b-2 border-spa-teal hover:text-spa-teal-dark transition">Book your next stay</button>
            </div>
          ) : (
            <div className="space-y-6">
              {reservations.map((reservation) => (
                <div key={reservation._id} className="bg-card border border-border shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all group">
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              reservation.status.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              reservation.status.toLowerCase() === 'confirmed_unpaid' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              reservation.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {reservation.status.replace('_', ' ')}
                            </span>
                            <h3 className="text-xl font-black text-foreground mt-2">
                              {typeof reservation.roomType === 'object' ? reservation.roomType.typeName : 'Luxury Suite'}
                            </h3>
                         </div>
                         {reservation.status.toLowerCase() === 'pending' && (
                           <button
                              onClick={() => setSelectedResForPayment(reservation)}
                              className="bg-spa-teal text-white font-black py-2 px-6 rounded-xl text-xs hover:bg-spa-teal-dark transition shadow-lg shadow-spa-teal/10"
                           >
                             Pay Now
                           </button>
                         )}
                      </div>
                      <div className="flex justify-between items-center pt-6 border-t border-border">
                         <div className="flex gap-6">
                            <div>
                               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Check-in</p>
                               <p className="text-sm font-bold text-foreground">{format(new Date(reservation.checkInDate), 'MMM dd')}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Check-out</p>
                               <p className="text-sm font-bold text-foreground">{format(new Date(reservation.checkOutDate), 'MMM dd')}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                            <p className="text-lg font-black text-spa-teal">${reservation.totalAmount}</p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </section>


      </div>
    </div>
  );
};

const BookingCard = ({ booking, status }: { booking: Booking, status: 'active' | 'past' }) => {
  const roomNumber = typeof booking.bookedRooms?.[0]?.roomId === 'object' ? booking.bookedRooms[0].roomId.roomNumber : 'N/A';
  
  return (
    <div className={`bg-card border ${status === 'active' ? 'border-spa-teal/30 shadow-xl shadow-spa-teal/5' : 'border-border'} rounded-3xl overflow-hidden`}>
      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                 status === 'active' ? 'bg-spa-teal text-white shadow-lg shadow-spa-teal/20' : 'bg-muted text-muted-foreground'
               }`}>
                 {status === 'active' ? 'Currently Stay' : 'Completed'}
               </span>
               <span className="text-xs font-mono text-muted-foreground">#{booking.bookingCode}</span>
            </div>
            <h3 className="text-3xl font-black text-foreground mb-2">Luxury Oceanfront Suite</h3>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Home size={16} className="text-spa-teal" />
              Room assigned: <span className="text-foreground font-bold">{roomNumber}</span>
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:border-l md:pl-8 border-border">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Check-in</p>
              <p className="font-bold text-foreground">{format(new Date(booking.checkInDate), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Check-out</p>
              <p className="font-bold text-foreground">{format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Amount</p>
              <p className="font-bold text-spa-teal text-lg">${booking.totalPrice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReservations;
