import { useState, useEffect } from "react";
import {
  getAllBookings,
  updateBookingStatus,
} from "../../services/bookingService";
import type { Booking } from "../../types";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  User,
  Key,
  Mail,
} from "lucide-react";
import { Button } from "../../components/ui/button";

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings({
        status: statusFilter || undefined,
        page: currentPage,
        limit: 10,
      });
      setBookings(data.bookings || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalBookings(data.pagination?.totalBookings || 0);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, currentPage]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const updatedBooking = await updateBookingStatus(id, newStatus);
      setBookings(bookings.map((b) => (b._id === id ? updatedBooking : b)));
    } catch (error) {
      console.error("Failed to update booking status", error);
    }
  };

  const filtered = bookings.filter((b) => {
    const user = typeof b.user === "object" ? b.user : null;
    const room = typeof b.room === "object" ? b.room : null;
    const userName = user?.fullName || user?.name || "";
    const roomNum = room?.roomNumber || "";

    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked_in":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "checked_out":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "confirmed_unpaid":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calendar className="text-spa-teal" /> Booking Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage guest stays, check-ins, and departures
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by guest name or room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background text-foreground focus:border-spa-teal outline-none transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border bg-background outline-none focus:border-spa-teal"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="confirmed_unpaid">Confirmed (Unpaid)</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Stay Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-spa-teal"
                      size={32}
                    />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b._id}
                    className="group hover:bg-muted/50 transition-all duration-300"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground group-hover:bg-spa-teal group-hover:text-white transition-all duration-300">
                          <User
                            size={20}
                            className="transition-transform group-hover:scale-110"
                          />
                        </div>
                        <div>
                          <div className="font-black text-foreground text-sm tracking-tight leading-tight mb-1">
                            {typeof b.user === "object"
                              ? b.user.fullName
                              : "Unknown Guest"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Mail size={10} className="text-spa-teal" />{" "}
                            {typeof b.user === "object" ? b.user.email : "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                          <Key size={16} className="text-orange-500 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                            Room
                          </div>
                          <div className="font-black text-foreground text-base leading-none">
                            {typeof b.room === "object"
                              ? b.room.roomNumber
                              : "Unassigned"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle2
                              size={12}
                              className="text-emerald-500"
                            />
                          </div>
                          <span className="text-xs font-black text-foreground tracking-tight">
                            {b.checkInDate
                              ? new Date(b.checkInDate).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                            <XCircle size={12} className="text-orange-500" />
                          </div>
                          <span className="text-xs font-black text-foreground tracking-tight">
                            {b.checkOutDate
                              ? new Date(b.checkOutDate).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusColor(b.status)}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            b.status === "checked_in"
                              ? "bg-green-500"
                              : b.status === "confirmed"
                                ? "bg-blue-500"
                                : "bg-slate-400"
                          }`}
                        />
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opactiy-0 group-hover:opacity-100 transition-opacity duration-300">
                        {(b.status === "confirmed" ||
                          b.status === "confirmed_unpaid") && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(b._id, "checked_in")
                            }
                            className="bg-[#0F2F2F] text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1a4a4a] transition-all shadow-lg shadow-slate-900/10"
                          >
                            Check In
                          </button>
                        )}
                        {b.status === "checked_in" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(b._id, "checked_out")
                            }
                            className="bg-orange-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/10"
                          >
                            Check Out
                          </button>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/50">
          <div className="text-sm text-muted-foreground">
            Showing {bookings.length} of {totalBookings} bookings
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
