import { useState, useEffect } from 'react';
import { getAllReservations, updateReservationStatus } from '../../services/reservationService';
import type { Reservation } from '../../types';
import { 
  ClipboardList, Clock, 
  Search, User, Home, Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await getAllReservations({ status: statusFilter });
      setReservations(data);
    } catch (error) {
      console.error('Failed to fetch reservations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateReservationStatus(id, newStatus);
      setReservations(reservations.map(r => r._id === id ? { ...r, status: newStatus as any } : r));
    } catch (error) {
      console.error('Failed to update reservation status', error);
    }
  };

  const filtered = reservations.filter(r => {
    const user = typeof r.user === 'object' ? r.user : null;
    const roomType = typeof r.roomType === 'object' ? r.roomType : null;
    const userName = user?.fullName || user?.name || '';
    const typeName = roomType?.typeName || '';
    
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           r._id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      case 'EXPIRED': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ClipboardList className="text-spa-teal" /> Reservation Management
          </h1>
          <p className="text-muted-foreground mt-1">Review pending and confirmed guest reservations</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Search by guest name or room type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border focus:border-spa-teal outline-none"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border bg-background outline-none focus:border-spa-teal"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Room Type</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4">
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <div className="h-10 flex-1 bg-slate-100 animate-pulse rounded-lg" />
                          <div className="h-10 flex-1 bg-slate-100 animate-pulse rounded-lg" />
                          <div className="h-10 flex-1 bg-slate-100 animate-pulse rounded-lg" />
                          <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-lg" />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No reservations found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-spa-teal/10 flex items-center justify-center text-spa-teal font-bold">
                          <User size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">
                            {typeof r.user === 'object' ? r.user.fullName : 'Guest'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.guests} Guests
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Home size={14} className="text-spa-teal" />
                        <span className="font-medium text-foreground">
                          {typeof r.roomType === 'object' ? r.roomType.typeName : 'Room Type'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Calendar size={12} className="text-muted-foreground" /> 
                          {r.checkInDate ? new Date(r.checkInDate).toLocaleDateString() : 'N/A'} - {r.checkOutDate ? new Date(r.checkOutDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                          <Clock size={10} /> Created {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.status === 'PENDING' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleStatusUpdate(r._id, 'CONFIRMED')}
                              className="text-xs font-bold text-green-600 border-green-200 hover:bg-green-50"
                            >
                              Confirm
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleStatusUpdate(r._id, 'CANCELLED')}
                              className="text-xs font-bold text-red-500 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReservationManagement;
