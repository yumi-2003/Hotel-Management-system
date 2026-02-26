import { useState, useEffect } from "react";
import {
  getAllHousekeepingLogs,
  updateHousekeepingStatus,
  createHousekeepingLog,
  assignHousekeepingTask,
} from "../../services/housekeepingService";
import { getAllRooms } from "../../services/individualRoomService";
import { getAllUsers } from "../../services/api";
import type { HousekeepingLog, Room, User } from "../../types";
import {
  ClipboardList,
  AlertCircle,
  Search,
  Key,
  Plus,
  Filter,
  MoreHorizontal,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { TableSkeleton } from "../../components/dashboard/DashboardSkeleton";
import { format } from "date-fns";

const HousekeepingManagement = () => {
  const [logs, setLogs] = useState<HousekeepingLog[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [newLog, setNewLog] = useState({
    roomId: "",
    staffId: "",
    status: "dirty",
    task: "Routine Cleaning",
    note: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsData, roomsData, staffData] = await Promise.all([
        getAllHousekeepingLogs({ status: statusFilter }),
        getAllRooms(),
        getAllUsers({ role: "housekeeping" }),
      ]);
      setLogs(logsData);
      setRooms(roomsData.rooms || []);
      setStaff(staffData.users || []);

      if (roomsData.rooms && roomsData.rooms.length > 0 && !newLog.roomId) {
        setNewLog((prev) => ({ ...prev, roomId: roomsData.rooms[0]._id }));
      }
      if (staffData.users && staffData.users.length > 0 && !newLog.staffId) {
        setNewLog((prev) => ({ ...prev, staffId: staffData.users[0]._id }));
      }
    } catch (error) {
      console.error("Failed to fetch housekeeping data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const updated = await updateHousekeepingStatus(id, newStatus);
      setLogs(logs.map((l) => (l._id === id ? updated : l)));
    } catch (error) {
      console.error("Failed to update log status", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignStaff = async (logId: string, staffId: string) => {
    try {
      setUpdatingId(logId);
      const updated = await assignHousekeepingTask(logId, staffId);
      setLogs(logs.map((l) => (l._id === logId ? updated : l)));
    } catch (error) {
      console.error("Failed to assign staff", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await createHousekeepingLog(newLog);
      setLogs([added, ...logs]);
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add log", error);
    }
  };

  const filtered = logs.filter((l) => {
    const room = typeof l.room === "object" ? l.room : null;
    const staffMember = typeof l.assignedTo === "object" ? l.assignedTo : null;
    const roomNum = room?.roomNumber || "";
    const staffName = staffMember?.fullName || "";

    return (
      roomNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.task.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "clean":
        return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20";
      case "cleaning":
        return "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-100 dark:border-sky-500/20";
      case "dirty":
        return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-500/20";
      case "out_of_service":
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      default:
        return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-4">
              <div className="w-12 h-12 bg-spa-teal rounded-2xl flex items-center justify-center shadow-lg shadow-spa-teal/20">
                <ClipboardList className="text-white" size={28} />
              </div>
              Housekeeping Hub
            </h1>
            <p className="text-muted-foreground font-medium ml-16">
              Monitor and manage real-time cleaning operations
            </p>
          </div>
          <div className="flex items-center gap-3 ml-16 md:ml-0">
            <Button
              onClick={fetchData}
              variant="outline"
              className="rounded-xl border-border hover:bg-muted"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-spa-teal hover:bg-spa-teal-dark text-white rounded-2xl px-6 py-6 shadow-xl shadow-spa-teal/20 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 font-bold text-lg"
            >
              <Plus size={24} /> Create Task
            </Button>
          </div>
        </div>

        {/* Stats Summary (Optional/Future) */}

        {/* Filters & Search */}
        <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden mb-8">
          <div className="p-8 flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by room, staff member, or task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-muted/30 border border-border focus:border-spa-teal focus:ring-4 focus:ring-spa-teal/5 outline-none transition-all text-foreground font-medium placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full lg:w-48">
                <Filter
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                  size={16}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl bg-muted/30 border border-border outline-none focus:border-spa-teal appearance-none font-bold text-foreground cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="dirty">Dirty</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="clean">Clean</option>
                  <option value="out_of_service">Out of Service</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 border-y border-border">
                  <th className="pl-8 pr-4 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                    Room
                  </th>
                  <th className="px-4 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                    Assigned Staff
                  </th>
                  <th className="px-4 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                    Task Details
                  </th>
                  <th className="px-4 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                    Status
                  </th>
                  <th className="pl-4 pr-8 py-5 text-[11px] font-black text-muted-foreground uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-6">
                      <TableSkeleton rows={5} cols={5} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <AlertCircle size={48} className="opacity-20" />
                        <p className="font-bold">
                          No housekeeping records found matching your criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr
                      key={l._id}
                      className="group hover:bg-spa-mint/5 transition-all"
                    >
                      <td className="pl-8 pr-4 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-spa-teal/10 rounded-xl flex items-center justify-center text-spa-teal">
                            <Key size={20} />
                          </div>
                          <div>
                            <span className="text-lg font-black text-foreground block leading-none">
                              {typeof l.room === "object"
                                ? l.room.roomNumber
                                : "-"}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                              {typeof l.room === "object"
                                ? `Floor ${l.room.floor}`
                                : "Unknown Room"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="relative group/select">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-hover/select:text-spa-teal transition-colors">
                            <UserPlus size={14} />
                          </div>
                          <select
                            value={
                              typeof l.assignedTo === "object"
                                ? l.assignedTo._id
                                : ""
                            }
                            onChange={(e) =>
                              handleAssignStaff(l._id, e.target.value)
                            }
                            disabled={updatingId === l._id}
                            className={`pl-9 pr-8 py-2.5 rounded-xl border border-transparent bg-transparent hover:bg-muted hover:border-border outline-none transition-all font-bold text-sm text-foreground appearance-none cursor-pointer focus:border-spa-teal focus:bg-card ${updatingId === l._id ? "opacity-50" : ""}`}
                          >
                            <option value="">Unassigned</option>
                            {staff.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.fullName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="max-w-xs">
                          <div className="font-black text-foreground text-sm mb-1">
                            {l.task}
                          </div>
                          {l.note ? (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                              "{l.note}"
                            </p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground/40 font-bold uppercase">
                              No specific notes
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusStyles(l.status)}`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              l.status === "clean"
                                ? "bg-emerald-500"
                                : l.status === "cleaning"
                                  ? "bg-sky-500 animate-pulse"
                                  : "bg-rose-500"
                            }`}
                          />
                          {l.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="pl-4 pr-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select
                            value={l.status}
                            onChange={(e) =>
                              handleStatusUpdate(l._id, e.target.value)
                            }
                            disabled={updatingId === l._id}
                            className="text-[10px] font-black uppercase tracking-widest text-spa-teal bg-card border border-spa-teal/20 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-spa-teal hover:text-white transition-all outline-none"
                          >
                            <option value="dirty">Set Dirty</option>
                            <option value="cleaning">Set Cleaning</option>
                            <option value="clean">Set Clean</option>
                            <option value="out_of_service">
                              Out of Service
                            </option>
                          </select>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-600"
                          >
                            <MoreHorizontal size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-muted/30 border-t border-border flex justify-between items-center text-muted-foreground">
            <p className="text-xs font-bold uppercase tracking-widest">
              Showing {filtered.length} task{filtered.length !== 1 ? "s" : ""}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
              Last updated: {format(new Date(), "HH:mm:ss")}
            </p>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                New Housekeeping Task
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Location
                </label>
                <select
                  required
                  value={newLog.roomId}
                  onChange={(e) =>
                    setNewLog({ ...newLog, roomId: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-spa-teal outline-none font-bold text-foreground transition-all appearance-none cursor-pointer"
                >
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id} className="bg-card">
                      Room {r.roomNumber} (
                      {r.roomType && typeof r.roomType === "object"
                        ? r.roomType.typeName
                        : "Standard"}
                      )
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Staff Member
                </label>
                <select
                  required
                  value={newLog.staffId}
                  onChange={(e) =>
                    setNewLog({ ...newLog, staffId: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-spa-teal outline-none font-bold text-foreground transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-card">Select Staff Member</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id} className="bg-card">
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Priority & Task
                </label>
                <select
                  value={newLog.task}
                  onChange={(e) =>
                    setNewLog({ ...newLog, task: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-spa-teal outline-none font-bold text-foreground transition-all appearance-none cursor-pointer"
                >
                  <option value="Routine Cleaning" className="bg-card">Routine Cleaning</option>
                  <option value="Deep Cleaning" className="bg-card">Deep Cleaning</option>
                  <option value="Maintenance Check" className="bg-card">Maintenance Check</option>
                  <option value="Turn down Service" className="bg-card">Turn down Service</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Additional Instructions
                </label>
                <textarea
                  value={newLog.note}
                  onChange={(e) =>
                    setNewLog({ ...newLog, note: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-spa-teal outline-none min-h-[120px] font-medium text-foreground transition-all resize-none placeholder:text-muted-foreground/30"
                  placeholder="Enter any special requests or notes here..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl py-6 font-bold text-muted-foreground h-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-spa-teal hover:bg-spa-teal-dark text-white rounded-2xl py-6 font-black uppercase tracking-widest shadow-lg shadow-spa-teal/20 h-auto transition-all hover:-translate-y-1"
                >
                  Assign Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingManagement;
