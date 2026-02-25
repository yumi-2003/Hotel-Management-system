import { useEffect, useState } from "react";
import { useAppSelector } from "../hooks/redux";
import { getDashboardStats } from "../services/api";
import StatsCard from "../components/dashboard/StatsCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import RoomStatusChart from "../components/dashboard/RoomStatusChart";
import {
  DollarSign,
  Calendar,
  Home,
  Users,
  Settings,
  Key,
  ClipboardList,
  UserPlus,
  Loader2,
  Waves,
  FileText,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { downloadRevenueExcel, downloadRevenuePDF } from "../services/reportService";
import { updateBookingStatus } from "../services/bookingService";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      setExporting(format);
      const currentYear = new Date().getFullYear();
      if (format === 'excel') {
        await downloadRevenueExcel(currentYear);
      } else {
        await downloadRevenuePDF(currentYear);
      }
      toast.success(`${format.toUpperCase()} Report downloaded successfully`);
    } catch (err) {
      console.error(`Export ${format} failed`, err);
      toast.error(`Failed to export ${format}`);
    } finally {
      setExporting(null);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await getDashboardStats();
      console.log("Dashboard stats:", stats);
      console.log("Weekly revenue data:", stats?.charts?.weeklyRevenue);
      setData(stats);
    } catch (err: any) {
      console.error("Failed to fetch manager dashboard stats", err);
      setError(err?.response?.data?.message || "Failed to load dashboard data");
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
      toast.success(`Booking status updated to ${newStatus.replace("_", " ")}`);
      await fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
      console.error("Failed to update booking status", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center h-[60vh] space-y-4">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p>{error}</p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-spa-teal text-white rounded-lg hover:bg-spa-teal/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  const todaysArrivals = data?.operational?.todaysArrivals || [];
  const todaysDepartures = data?.operational?.todaysDepartures || [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Manager Dashboard
          </h1>
          <p className="text-muted-foreground">
            Operational overview for {user?.fullName || "Manager"}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-spa-mint/10 text-spa-teal px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider hidden sm:block">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          
          <button
            onClick={() => handleExport('excel')}
            disabled={!!exporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all font-bold text-sm disabled:opacity-50"
          >
            {exporting === 'excel' ? <Download className="h-4 w-4 animate-bounce" /> : <FileSpreadsheet className="h-4 w-4" />}
            <span>{exporting === 'excel' ? 'Exporting...' : 'Excel'}</span>
          </button>
          
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all font-bold text-sm disabled:opacity-50"
          >
            {exporting === 'pdf' ? <Download className="h-4 w-4 animate-bounce" /> : <FileText className="h-4 w-4" />}
            <span>{exporting === 'pdf' ? 'Exporting...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Daily Revenue"
          value={`$${((data?.kpi?.totalRevenue || 0) / 30).toFixed(0)}`}
          icon={<DollarSign className="text-spa-teal" />}
          description="Estimated based on monthly"
        />
        <StatsCard
          title="Occupancy"
          value={`${data?.kpi?.occupancyRate?.toFixed(1) || 0}%`}
          icon={<Home className="text-spa-teal" />}
          description={`${data?.kpi?.occupiedRooms || 0} / ${data?.kpi?.totalRooms || 0} rooms`}
        />
        <StatsCard
          title="Bookings"
          value={data?.kpi?.totalBookings || 0}
          icon={<Calendar className="text-spa-teal" />}
          description="Total active reservations"
        />
        <StatsCard
          title="Arrivals/Departures"
          value={`${data?.kpi?.checkInsToday || 0} / ${data?.kpi?.checkOutsToday || 0}`}
          icon={<Users className="text-spa-teal" />}
          description="Check-ins / Check-outs today"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Performance */}
        <div className="lg:col-span-2">
          <RevenueChart data={data?.charts?.weeklyRevenue || []} />
        </div>

        {/* Room Status */}
        <div>
          <RoomStatusChart data={data?.charts?.roomStatusDistribution || []} />
        </div>
      </div>

      {/* Arrivals/Departures Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Today's Arrivals
          </h2>
          <div className="space-y-4">
            {todaysArrivals.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No arrivals expected today.
              </div>
            ) : (
              todaysArrivals.map((booking: any) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30"
                >
                  <div>
                    <div className="font-bold text-foreground">
                      {booking.guestId?.fullName || "Guest"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Room:{" "}
                      {booking.bookedRooms
                        ?.map((r: any) => r.roomId?.roomNumber)
                        .join(", ") || "No room assigned"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === "confirmed" ||
                    booking.status === "confirmed_unpaid" ? (
                      <Button
                        size="sm"
                        disabled={processingId === booking._id}
                        onClick={() =>
                          handleStatusUpdate(booking._id, "checked_in")
                        }
                        className="bg-spa-teal hover:bg-spa-teal/90 text-white text-[10px] font-bold h-8 px-3"
                      >
                        {processingId === booking._id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "Check In"
                        )}
                      </Button>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-spa-teal bg-spa-teal/10 px-2 py-1 rounded">
                        {booking.status.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Today's Departures
          </h2>
          <div className="space-y-4">
            {todaysDepartures.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No departures today.
              </div>
            ) : (
              todaysDepartures.map((booking: any) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30"
                >
                  <div>
                    <div className="font-bold text-foreground">
                      {booking.guestId?.fullName || "Guest"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Room:{" "}
                      {booking.bookedRooms
                        ?.map((r: any) => r.roomId?.roomNumber)
                        .join(", ") || "Room unknown"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === "checked_in" && (
                      <Button
                        size="sm"
                        disabled={processingId === booking._id}
                        onClick={() =>
                          handleStatusUpdate(booking._id, "checked_out")
                        }
                        className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold h-8 px-3"
                      >
                        {processingId === booking._id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "Check Out"
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/staff/bookings`)}
                      className="text-[10px] h-8 px-3"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Management Quick Links */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Settings size={22} className="text-spa-teal" /> Management Core
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/rooms"
            className="group p-6 rounded-2xl border border-border hover:border-spa-teal hover:bg-spa-teal/[0.02] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-spa-teal/10 flex items-center justify-center text-spa-teal mb-4 group-hover:scale-110 transition-transform">
              <Key size={24} />
            </div>
            <h3 className="font-bold text-foreground">Room Management</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure room types & pricing
            </p>
          </Link>

          <Link
            to="/admin/amenities"
            className="group p-6 rounded-2xl border border-border hover:border-spa-teal hover:bg-spa-teal/[0.02] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
              <ClipboardList size={24} />
            </div>
            <h3 className="font-bold text-foreground">Amenities</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Manage global hotel features
            </p>
          </Link>

          <Link
            to="/staff/reservations"
            className="group p-6 rounded-2xl border border-border hover:border-spa-teal hover:bg-spa-teal/[0.02] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <h3 className="font-bold text-foreground">Reservations</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Review guest bookings
            </p>
          </Link>

          <Link
            to="/staff/bookings"
            className="group p-6 rounded-2xl border border-border hover:border-spa-teal hover:bg-spa-teal/[0.02] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform">
              <ClipboardList size={24} />
            </div>
            <h3 className="font-bold text-foreground">Guest Stays</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Manage check-ins & check-outs
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="group p-6 rounded-2xl border border-border hover:border-spa-teal hover:bg-spa-teal/[0.02] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-spa-teal mb-4 group-hover:scale-110 transition-transform">
              <UserPlus size={24} />
            </div>
            <h3 className="font-bold text-foreground">Staff Management</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Create & manage staff accounts
            </p>
          </Link>

          <Link
            to="/staff/pool"
            className="group p-6 rounded-2xl border border-border hover:border-spa-teal hover:bg-spa-teal/[0.02] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
              <Waves size={24} />
            </div>
            <h3 className="font-bold text-foreground">Pool & Spa</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Manage facility status & capacity
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
