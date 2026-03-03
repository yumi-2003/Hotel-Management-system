import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchMyReservations, cancelReservation } from '../store/slices/reservationSlice';
import { createBooking, fetchMyBookings } from '../store/slices/bookingSlice';
import { fetchNotifications } from '../store/slices/notificationSlice';
import { format, isSameDay } from 'date-fns';
import type { Reservation, Booking } from '../types';
import PaymentSection from '../components/booking/PaymentSection';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Calendar, Home } from 'lucide-react';

const MyReservations = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { reservations, loading: resLoading, pagination: resPagination } = useAppSelector((state) => state.reservations);
  const { bookings, loading: bookingLoading, pagination: bookingPagination } = useAppSelector((state) => state.bookings);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [resPage, setResPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [selectedResForPayment, setSelectedResForPayment] = useState<Reservation | null>(null);

  useEffect(() => {
    dispatch(fetchMyReservations({ page: resPage, limit: 5 }));
  }, [dispatch, resPage]);

  useEffect(() => {
    dispatch(fetchMyBookings({ page: bookingPage, limit: 5 }));
  }, [dispatch, bookingPage]);

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
      dispatch(fetchMyReservations({ page: resPage, limit: 5 }));
      dispatch(fetchMyBookings({ page: bookingPage, limit: 5 }));
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

  const handleCancelReservation = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-xs font-bold text-foreground">Cancel this reservation?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await dispatch(cancelReservation(id)).unwrap();
                toast.success('Reservation cancelled successfully');
              } catch (err: any) {
                toast.error(err || 'Failed to cancel reservation');
              }
            }}
            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition shadow-lg shadow-red-500/20"
          >
            Confirm Cancel
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-muted text-muted-foreground px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'bottom-center' });
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">My Stays & Bookings</h1>
          <p className="text-sm text-muted-foreground font-medium">Manage your active stays and future reservations</p>
        </div>
        <div className="bg-spa-teal/5 border border-spa-teal/10 px-4 py-2 rounded-xl">
          <p className="text-[10px] font-bold text-spa-teal uppercase tracking-widest mb-0.5">Signed in as</p>
          <p className="font-bold text-foreground text-sm">{user?.fullName || user?.name}</p>
        </div>
      </div>
      
      {/* Checkout Alert Banner */}
      {checkoutToday && (
        <div className="mb-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg border border-orange-400/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle size={80} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-white/30">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-black mb-0.5">Check-out Reminder</h2>
              <p className="text-white/90 text-sm font-medium">Your stay for Room {typeof checkoutToday.bookedRooms?.[0]?.roomId === 'object' ? checkoutToday.bookedRooms[0].roomId.roomNumber : 'N/A'} ends today.</p>
            </div>
            <button 
              onClick={() => toast.success('Guest assistance notified.')}
              className="bg-white text-orange-600 hover:bg-orange-50 font-black px-6 py-3 rounded-xl transition text-sm shadow-md whitespace-nowrap"
            >
              Need Help?
            </button>
          </div>
        </div>
      )}

      {/* Main Content Flow */}
      <div className="flex flex-col gap-12">
        {/* Bookings Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-spa-teal/10 text-spa-teal rounded-xl flex items-center justify-center">
              <Home size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Booking History</h2>
            </div>
          </div>

          <div className="space-y-4">
            {bookingLoading && bookings.length === 0 ? (
              <div className="py-12 text-center bg-card border border-border rounded-3xl shadow-sm">
                <div className="animate-spin w-8 h-8 border-4 border-spa-teal border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">Syncing...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-3xl p-8 text-center">
                <p className="text-muted-foreground font-bold">No booking history yet</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookings.map(booking => (
                    <BookingCard key={booking._id} booking={booking} status={booking.status === 'checked_in' ? 'active' : 'past'} />
                  ))}
                </div>

                {/* Bookings Pagination */}
                {bookingPagination && bookingPagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6 p-3 bg-card border border-border rounded-xl shadow-sm">
                    <button
                      disabled={!bookingPagination.hasPrev}
                      onClick={() => {
                        setBookingPage(prev => prev - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg bg-background border border-border disabled:opacity-30 text-foreground hover:border-spa-teal hover:text-spa-teal transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                    >
                      Prev
                    </button>
                    <span className="font-black text-spa-teal text-sm">
                      {bookingPagination.currentPage} <span className="text-muted-foreground/30 font-medium">/</span> {bookingPagination.totalPages}
                    </span>
                    <button
                      disabled={!bookingPagination.hasNext}
                      onClick={() => {
                        setBookingPage(prev => prev + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg bg-background border border-border disabled:opacity-30 text-foreground hover:border-spa-teal hover:text-spa-teal transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Reservations Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-spa-mint/20 text-spa-teal rounded-lg flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <h2 className="text-lg font-black text-foreground tracking-tight">Reservations</h2>
          </div>
          
          <div className="space-y-4">
            {resLoading && reservations.length === 0 ? (
              <div className="py-8 text-center bg-card border border-border rounded-2xl">
                <div className="animate-spin w-6 h-6 border-2 border-spa-teal border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-bold">Checking...</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-6 text-center">
                <p className="text-xs text-muted-foreground font-bold mb-3">No upcoming stays</p>
                <button 
                  onClick={() => navigate('/')} 
                  className="bg-spa-teal text-white font-black px-4 py-2 rounded-lg hover:bg-spa-teal-dark transition text-[10px] uppercase tracking-widest"
                >
                  Book New
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reservations.map((reservation) => (
                    <div key={reservation._id} className="bg-card border border-border shadow-sm rounded-xl overflow-hidden hover:shadow-md hover:border-spa-teal/30 transition-all group">
                       <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex flex-col gap-1">
                                <span className={`self-start px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                  reservation.status.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  reservation.status.toLowerCase() === 'confirmed_unpaid' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  reservation.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {reservation.status.replace('_', ' ')}
                                </span>
                                <h3 className="text-base font-black text-foreground truncate max-w-[200px] tracking-tight">
                                  {typeof reservation.roomType === 'object' ? reservation.roomType.typeName : 'Luxury Suite'}
                                </h3>
                             </div>
                             <div className="flex gap-1.5 items-center">
                               {reservation.status.toLowerCase() === 'pending' && (
                                 <button
                                    onClick={() => setSelectedResForPayment(reservation)}
                                    className="bg-spa-teal text-white font-black py-2 px-4 rounded-lg text-xs hover:bg-spa-teal-dark transition shadow-lg shadow-spa-teal/10 uppercase tracking-widest"
                                 >
                                   Pay
                                 </button>
                               )}
                               {reservation.status.toLowerCase() === 'pending' && (
                                 <button
                                    onClick={() => handleCancelReservation(reservation._id)}
                                    className="bg-red-50 text-red-600 border border-red-100 font-black py-2 px-4 rounded-lg text-xs hover:bg-red-100 transition uppercase tracking-widest"
                                 >
                                   Cancel
                                 </button>
                               )}
                             </div>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-border/50">
                             <div className="flex gap-4">
                                <div>
                                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">In</p>
                                   <p className="text-xs font-bold text-foreground">{format(new Date(reservation.checkInDate), 'MMM dd')}</p>
                                </div>
                                <div className="border-l border-border pl-4">
                                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Out</p>
                                   <p className="text-xs font-bold text-foreground">{format(new Date(reservation.checkOutDate), 'MMM dd')}</p>
                                </div>
                             </div>
                             <p className="text-xl font-black text-spa-teal tracking-tighter">${reservation.totalAmount}</p>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Reservations Pagination */}
                {resPagination && resPagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6 p-3 bg-card border border-border rounded-xl shadow-sm">
                    <button
                      disabled={!resPagination.hasPrev}
                      onClick={() => {
                        setResPage(prev => prev - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg bg-background border border-border disabled:opacity-30 text-foreground hover:border-spa-teal hover:text-spa-teal transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                    >
                      Prev
                    </button>
                    <span className="font-black text-spa-teal text-sm">
                      {resPagination.currentPage} <span className="text-muted-foreground/30 font-medium">/</span> {resPagination.totalPages}
                    </span>
                    <button
                      disabled={!resPagination.hasNext}
                      onClick={() => {
                        setResPage(prev => prev + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg bg-background border border-border disabled:opacity-30 text-foreground hover:border-spa-teal hover:text-spa-teal transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const BookingCard = ({ booking, status }: { booking: Booking, status: 'active' | 'past' }) => {
  const roomNumber = typeof booking.bookedRooms?.[0]?.roomId === 'object' ? booking.bookedRooms[0].roomId.roomNumber : 'N/A';
  
  return (
    <div className={`bg-card border ${status === 'active' ? 'border-spa-teal/30 shadow-md ring-1 ring-spa-teal/5' : 'border-border'} rounded-xl overflow-hidden`}>
      <div className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
               <span className={`self-start px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                 status === 'active' ? 'bg-spa-teal text-white shadow-sm' : 'bg-muted text-muted-foreground'
               }`}>
                 {status === 'active' ? 'Active' : 'Past'}
               </span>
               <h3 className="text-base font-black text-foreground tracking-tight">Luxury Suite</h3>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">#{booking.bookingCode}</span>
          </div>
          
          <div className="flex items-center gap-3 py-2 border-y border-border/50 text-xs">
            <div className="flex-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Room</p>
              <p className="font-bold text-foreground">{roomNumber}</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">In</p>
              <p className="font-bold text-foreground">{format(new Date(booking.checkInDate), 'MMM dd')}</p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Out</p>
              <p className="font-bold text-foreground">{format(new Date(booking.checkOutDate), 'MMM dd')}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-muted-foreground group">
              <Home size={12} className="group-hover:text-spa-teal transition-colors" />
              <span className="text-[10px] font-medium tracking-tight">Main Building</span>
            </div>
            <p className="font-black text-spa-teal text-xl tracking-tighter">${booking.totalPrice}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReservations;
