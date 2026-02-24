import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { updateBookingStatus, confirmBookingPayment } from '../services/bookingService';
import { toast } from 'react-hot-toast';
import StatsCard from '../components/dashboard/StatsCard';
import RoomStatusChart from '../components/dashboard/RoomStatusChart';
import { 
  Users, CheckCircle2, 
  Key, Search, Loader2, Waves
} from 'lucide-react';
import { Link } from 'react-router-dom';


const ReceptionistDashboard = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const stats = await getDashboardStats();
      setData(stats);
    } catch (err) {
      console.error('Failed to fetch receptionist dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setProcessingId(id);
      await updateBookingStatus(id, newStatus);
      toast.success(`Booking status updated to ${newStatus.replace('_', ' ')}`);
      await fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update status');
      console.error('Failed to update booking status', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-spa-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const todaysArrivals = data?.operational?.todaysArrivals || [];
  const todaysDepartures = data?.operational?.todaysDepartures || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Receptionist Dashboard</h1>
          <p className="text-muted-foreground">Guest services and front desk operations</p>
        </div>
        <div className="bg-spa-mint/10 text-spa-teal px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider">
           ID: FRONT-DESK-01
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Daily Arrivals" 
          value={data?.kpi.checkInsToday || 0} 
          icon={<Users className="text-spa-teal" />}
          description="Guests expected today"
        />
        <StatsCard 
          title="Daily Departures" 
          value={data?.kpi.checkOutsToday || 0} 
          icon={<Key className="text-orange-400" />}
          description="Check-outs processed today"
        />
        <StatsCard 
          title="Hotel Occupancy" 
          value={`${data?.kpi.occupancyRate.toFixed(1)}%`} 
          icon={<CheckCircle2 className="text-green-500" />}
          description={`${data?.kpi.occupiedRooms} / ${data?.kpi.totalRooms} rooms`}
        />
        <Link to="/staff/pool" className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-spa-teal transition group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Waves size={24} />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Pool & Spa</h3>
              <p className="text-[10px] text-muted-foreground">Manage facility status</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
             <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Search size={20} className="text-spa-teal" /> Arrivals Today
             </h2>
             <div className="space-y-3">
                {todaysArrivals.length === 0 ? (
                   <div className="py-6 text-center text-xs text-muted-foreground">No arrivals today</div>
                ) : (
                  todaysArrivals.slice(0, 10).map((booking: any) => (
                    <div key={booking._id} className="flex flex-col gap-3 p-4 rounded-xl bg-muted border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm text-foreground">{booking.guestId?.fullName || 'Guest'}</div>
                          <div className="text-[10px] text-muted-foreground">Room: {booking.bookedRooms?.map((r: any) => r.roomId?.roomNumber).join(', ')}</div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          booking.status === 'confirmed_unpaid' 
                            ? 'bg-amber-100 text-amber-600 border-amber-200' 
                            : booking.status === 'checked_in'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-spa-teal/10 text-spa-teal border-spa-teal/20'
                        }`}>
                          {booking.status.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {booking.status === 'confirmed_unpaid' && (
                          <button 
                            disabled={processingId === booking._id}
                            onClick={async () => {
                              if (window.confirm('Confirm cash payment for this booking?')) {
                                try {
                                  setProcessingId(booking._id);
                                  await confirmBookingPayment(booking._id);
                                  toast.success('Payment confirmed!');
                                  await fetchStats();
                                } catch (err: any) { 
                                  toast.error(err?.response?.data?.message || 'Failed to confirm payment');
                                } finally { 
                                  setProcessingId(null); 
                                }
                              }
                            }}
                            className="flex-1 py-1.5 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-amber-600 transition-all disabled:opacity-50"
                          >
                            {processingId === booking._id ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Confirm Cash'}
                          </button>
                        )}
                        
                        {(booking.status === 'confirmed' || booking.status === 'confirmed_unpaid') && (
                          <button 
                            disabled={processingId === booking._id}
                            onClick={() => handleStatusUpdate(booking._id, 'checked_in')}
                            className="flex-1 py-1.5 bg-spa-teal text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-spa-teal/90 transition-all disabled:opacity-50"
                          >
                            {processingId === booking._id ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Check In'}
                          </button>
                        )}

                        {booking.status === 'checked_in' && (
                           <div className="flex-1 text-center py-1.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold border border-green-100">
                             Currently In-House
                           </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
             </div>
             <Link to="/staff/bookings" className="block text-center mt-4 text-spa-teal font-bold text-xs hover:underline">
                Manage all bookings
             </Link>
          </div>

          <div>
             <RoomStatusChart data={data?.charts.roomStatusDistribution || []} />
          </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Key size={20} className="text-orange-400" /> Departures Today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysDepartures.length === 0 ? (
               <div className="col-span-full py-6 text-center text-xs text-muted-foreground">No departures today</div>
            ) : (
              todaysDepartures.map((booking: any) => (
                <div key={booking._id} className="p-4 rounded-xl border border-border hover:border-spa-teal transition bg-card shadow-sm flex flex-col justify-between">
                   <div className="mb-4">
                      <div className="font-bold text-foreground mb-1">{booking.guestId?.fullName || 'Guest'}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-black">Room: {booking.bookedRooms?.map((r: any) => r.roomId?.roomNumber).join(', ')}</div>
                   </div>
                   <div className="flex gap-2">
                      {booking.status === 'checked_in' && (
                        <button 
                          disabled={processingId === booking._id}
                          onClick={() => handleStatusUpdate(booking._id, 'checked_out')}
                          className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-orange-600 transition-all disabled:opacity-50"
                        >
                          {processingId === booking._id ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Check Out'}
                        </button>
                      )}
                      <Link to="/staff/bookings" className="flex-1 py-2 text-center bg-muted text-muted-foreground rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-muted/80 transition-all">Details</Link>
                   </div>
                </div>
              ))
            )}
          </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
