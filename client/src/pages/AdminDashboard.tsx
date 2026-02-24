import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import StatsCard from '../components/dashboard/StatsCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import RoomStatusChart from '../components/dashboard/RoomStatusChart';
import RoomTypeChart from '../components/dashboard/RoomTypeChart';
import MonthlyRevenueChart from '../components/dashboard/MonthlyRevenueChart';
import PaymentTable from '../components/dashboard/PaymentTable';
import { DollarSign, Calendar, Users, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardData {
  kpi: {
    totalRevenue: number;
    totalBookings: number;
    checkInsToday: number;
    checkOutsToday: number;
    occupancyRate: number;
    totalRooms: number;
    occupiedRooms: number;
  };
  operational: {
    recentPayments: any[];
    todaysArrivals: any[];
    todaysDepartures: any[];
    roomsNeedingCleaning: any[];
  };
  charts: {
    weeklyRevenue: { _id: string; revenue: number }[];
    roomStatusDistribution: { _id: string; count: number }[];
    roomTypePerformance: { _id: string; revenue: number; bookings: number }[];
    monthlyRevenue: { _id: string; revenue: number }[];
  };
}

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getDashboardStats();
        setData(stats);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-spa-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Financial overview and operational health</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={`$${(data?.kpi.totalRevenue || 0).toLocaleString()}`} 
          icon={<DollarSign className="h-4 w-4 text-spa-teal" />}
          description="Verified earnings"
        />
        <StatsCard 
          title="Occupancy" 
          value={`${data?.kpi.occupancyRate.toFixed(1)}%`} 
          icon={<Home className="h-4 w-4 text-orange-400" />}
          description={`${data?.kpi.occupiedRooms} / ${data?.kpi.totalRooms} rooms`}
        />
        <StatsCard 
          title="Reservations" 
          value={data?.kpi.totalBookings || 0} 
          icon={<Calendar className="h-4 w-4 text-blue-400" />}
          description="Total bookings made"
        />
        <StatsCard 
          title="Stay Activity" 
          value={`${data?.kpi.checkInsToday} / ${data?.kpi.checkOutsToday}`} 
          icon={<Users className="h-4 w-4 text-purple-400" />}
          description="Check-ins / Check-outs today"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <PaymentTable payments={data?.operational?.recentPayments || []} />
        </div>
        <div>
          <RoomStatusChart data={data?.charts.roomStatusDistribution || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueChart data={data?.charts.weeklyRevenue || []} />
        <MonthlyRevenueChart data={data?.charts.monthlyRevenue || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <RoomTypeChart data={data?.charts.roomTypePerformance || []} />
         <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Quick Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Link to="/admin/users" className="p-4 rounded-2xl bg-muted border border-border hover:border-spa-teal transition group">
                 <h3 className="font-bold text-sm text-foreground group-hover:text-spa-teal transition-colors">Users</h3>
                 <p className="text-[10px] text-muted-foreground">Staff & Roles</p>
               </Link>
               <Link to="/admin/rooms" className="p-4 rounded-2xl bg-muted border border-border hover:border-spa-teal transition group">
                 <h3 className="font-bold text-sm text-foreground group-hover:text-spa-teal transition-colors">Rooms</h3>
                 <p className="text-[10px] text-muted-foreground">Inventory & Types</p>
               </Link>
               <Link to="/staff/bookings" className="p-4 rounded-2xl bg-muted border border-border hover:border-spa-teal transition group">
                 <h3 className="font-bold text-sm text-foreground group-hover:text-spa-teal transition-colors">Stays</h3>
                 <p className="text-[10px] text-muted-foreground">Arrivals & Departures</p>
               </Link>
               <Link to="/staff/housekeeping" className="p-4 rounded-2xl bg-muted border border-border hover:border-spa-teal transition group">
                 <h3 className="font-bold text-sm text-foreground group-hover:text-spa-teal transition-colors">Cleaning</h3>
                 <p className="text-[10px] text-muted-foreground">Daily Logs</p>
               </Link>
               <Link to="/staff/pool" className="p-4 rounded-2xl bg-muted border border-border hover:border-spa-teal transition group">
                 <h3 className="font-bold text-sm text-foreground group-hover:text-spa-teal transition-colors">Pool</h3>
                 <p className="text-[10px] text-muted-foreground">Facility Status</p>
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
