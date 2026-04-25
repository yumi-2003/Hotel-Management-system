import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { updateBookingStatus, confirmBookingPayment } from '../services/bookingService';
import { getAllHousekeepingLogs, updateHousekeepingStatus, createHousekeepingLog } from '../services/housekeepingService';
import { getAllRooms } from '../services/individualRoomService';
import { getAllUsers } from '../services/api';
import { toast } from 'react-hot-toast';
import StatsCard from '../components/dashboard/StatsCard';
import RoomStatusChart from '../components/dashboard/RoomStatusChart';
import type { HousekeepingLog, Room, User } from '../types';
import { 
  Users, CheckCircle2, 
  Key, Search, Loader2, Waves,
  Brush, AlertCircle, ListChecks, Clock,
  Play, Plus, RefreshCw, ExternalLink,
  UserPlus, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReceptionistDashboardSkeleton } from '../components/dashboard/DashboardSkeleton';

/* ─────────────────────────────────────────────────────────
   Housekeeping Panel (embedded inside Receptionist Dashboard)
───────────────────────────────────────────────────────── */
const HousekeepingPanel = () => {
  const [tasks, setTasks] = useState<HousekeepingLog[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [hkLoading, setHkLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [history, setHistory] = useState<HousekeepingLog[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter]  = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLog, setNewLog] = useState({ roomId: '', staffId: '', status: 'dirty', task: 'Routine Cleaning', note: '' });

  const fetchAllRoomsForTaskForm = async () => {
    const limit = 100;
    const firstPage = await getAllRooms({ page: 1, limit });
    const allRooms = [...(firstPage.rooms || [])];
    const totalRoomPages = firstPage.pagination?.totalPages || 1;

    for (let page = 2; page <= totalRoomPages; page++) {
      const pageData = await getAllRooms({ page, limit });
      allRooms.push(...(pageData.rooms || []));
    }

    return allRooms.sort((a: Room, b: Room) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.roomNumber.localeCompare(b.roomNumber, undefined, {
        numeric: true,
      });
    });
  };

  const fetchAllHousekeepingStaff = async () => {
    const limit = 100;
    const firstPage = await getAllUsers({
      role: 'housekeeping',
      status: 'active',
      page: 1,
      limit,
    });
    const allStaff = [...(firstPage.users || [])];
    const totalStaffPages = firstPage.pagination?.totalPages || 1;

    for (let page = 2; page <= totalStaffPages; page++) {
      const pageData = await getAllUsers({
        role: 'housekeeping',
        status: 'active',
        page,
        limit,
      });
      allStaff.push(...(pageData.users || []));
    }

    return allStaff.sort((a: User, b: User) =>
      a.fullName.localeCompare(b.fullName),
    );
  };

  const getRoomTypeName = (room: Room) => {
    const roomType =
      typeof room.roomType === 'object'
        ? room.roomType
        : ((room as any).roomTypeId && typeof (room as any).roomTypeId === 'object'
            ? (room as any).roomTypeId
            : null);

    return roomType?.typeName || 'Unknown Type';
  };

  const getRoomLocationLabel = (room: Room) =>
    `Room ${room.roomNumber} - Floor ${room.floor} - ${getRoomTypeName(room)}`;

  const fetchHK = async () => {
    try {
      setHkLoading(true);
      const [activeLogs, historyLogs, roomsData, staffData] = await Promise.all([
        getAllHousekeepingLogs({ status: statusFilter || ['dirty', 'cleaning'].join(',') }),
        getAllHousekeepingLogs({ status: 'clean' }),
        fetchAllRoomsForTaskForm(),
        fetchAllHousekeepingStaff(),
      ]);
      setTasks((activeLogs.logs || []).filter((l: any) => l.assignedTo));
      setHistory((historyLogs.logs || []).filter((l: any) => l.assignedTo));
      setRooms(roomsData || []);
      setStaff(staffData || []);
      setNewLog(prev => {
        const nextRoomId = roomsData.some((room: Room) => room._id === prev.roomId)
          ? prev.roomId
          : (roomsData[0]?._id ?? '');
        const nextStaffId = staffData.some((member: User) => member._id === prev.staffId)
          ? prev.staffId
          : (staffData[0]?._id ?? '');

        if (nextRoomId === prev.roomId && nextStaffId === prev.staffId) {
          return prev;
        }

        return {
          ...prev,
          roomId: nextRoomId,
          staffId: nextStaffId,
        };
      });
    } catch (err) {
      console.error('Failed to load housekeeping data', err);
    } finally {
      setHkLoading(false);
    }
  };

  useEffect(() => { fetchHK(); }, [statusFilter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await updateHousekeepingStatus(id, newStatus);
      toast.success(`Task updated to ${newStatus}`);
      fetchHK();
    } catch {
      toast.error('Failed to update task status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHousekeepingLog(newLog);
      toast.success('Housekeeping task created!');
      setShowAddModal(false);
      setNewLog({
        roomId: rooms[0]?._id ?? '',
        staffId: staff[0]?._id ?? '',
        status: 'dirty',
        task: 'Routine Cleaning',
        note: '',
      });
      fetchHK();
    } catch {
      toast.error('Failed to create task');
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'clean') return 'bg-emerald-100 text-emerald-700';
    if (status === 'cleaning') return 'bg-sky-100 text-sky-700';
    return 'bg-rose-100 text-rose-700';
  };

  const displayList = activeTab === 'active' ? tasks : history;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-spa-teal rounded-2xl flex items-center justify-center shadow-lg shadow-spa-teal/20">
            <Brush size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Housekeeping Tasks</h2>
            <p className="text-xs text-muted-foreground">Monitor and manage room cleaning operations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchHK}
            className="p-2 rounded-xl border border-border hover:bg-muted transition"
          >
            <RefreshCw size={16} className={hkLoading ? 'animate-spin text-spa-teal' : 'text-muted-foreground'} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-spa-teal hover:bg-spa-teal/90 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-spa-teal/20"
          >
            <Plus size={14} /> New Task
          </button>
          <Link
            to="/staff/housekeeping"
            className="flex items-center gap-2 border border-border hover:border-spa-teal text-muted-foreground hover:text-spa-teal px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
          >
            <ExternalLink size={14} /> Full View
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
            <AlertCircle size={16} className="text-rose-500" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">{tasks.filter(t => t.status === 'dirty').length}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Dirty</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
            <Clock size={16} className="text-sky-500" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">{tasks.filter(t => t.status === 'cleaning').length}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cleaning</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">{history.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Completed</div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-border">
          <div className="flex bg-muted p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-background text-spa-teal shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-background text-spa-teal shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              History
            </button>
          </div>
          {activeTab === 'active' && (
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl text-xs font-bold bg-muted/30 border border-border outline-none focus:border-spa-teal appearance-none cursor-pointer"
              >
                <option value="">All Active</option>
                <option value="dirty">Dirty</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </div>
          )}
        </div>

        {/* Task list */}
        <div className="divide-y divide-border">
          {hkLoading ? (
            <div className="py-12 flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 size={20} className="animate-spin text-spa-teal" />
              <span className="text-sm font-bold">Loading tasks…</span>
            </div>
          ) : displayList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                {activeTab === 'active' ? <CheckCircle2 size={28} className="text-muted-foreground" /> : <ListChecks size={28} className="text-muted-foreground" />}
              </div>
              <p className="text-sm font-bold text-muted-foreground">
                {activeTab === 'active' ? 'No active housekeeping tasks.' : 'Completed task history is empty.'}
              </p>
            </div>
          ) : (
            displayList.map(task => (
              <div key={task._id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/30 transition group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 ${
                    task.status === 'clean' ? 'bg-emerald-500 text-white' :
                    task.status === 'cleaning' ? 'bg-sky-500 text-white' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    <span className="text-[9px] uppercase leading-none">Rm</span>
                    <span className="text-base leading-none">{(task.room as any)?.roomNumber}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-foreground truncate">{task.task}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${getStatusStyle(task.status)}`}>
                        {task.status}
                      </span>
                      {(task.assignedTo as any)?.fullName && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <UserPlus size={10} /> {(task.assignedTo as any).fullName}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">• Floor {(task.room as any)?.floor || '?'}</span>
                    </div>
                  </div>
                </div>

                {activeTab === 'active' && (
                  <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.status === 'dirty' && (
                      <button
                        disabled={updatingId === task._id}
                        onClick={() => handleStatusUpdate(task._id, 'cleaning')}
                        className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition disabled:opacity-50"
                      >
                        {updatingId === task._id ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                        Start
                      </button>
                    )}
                    {task.status === 'cleaning' && (
                      <button
                        disabled={updatingId === task._id}
                        onClick={() => handleStatusUpdate(task._id, 'clean')}
                        className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition disabled:opacity-50"
                      >
                        {updatingId === task._id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}
                        Finish
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-between items-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {displayList.length} task{displayList.length !== 1 ? 's' : ''}
          </p>
          <Link to="/staff/housekeeping" className="text-xs font-bold text-spa-teal hover:underline flex items-center gap-1">
            Manage all tasks <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-foreground tracking-tight">New Housekeeping Task</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <Plus size={22} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddLog} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Room Location</label>
                <select required value={newLog.roomId} onChange={e => setNewLog({ ...newLog, roomId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-spa-teal outline-none font-bold text-foreground appearance-none cursor-pointer"
                  disabled={rooms.length === 0}>
                  {rooms.length === 0 && (
                    <option value="" className="bg-card">No rooms available</option>
                  )}
                  {rooms.map(r => (
                    <option key={r._id} value={r._id} className="bg-card">
                      {getRoomLocationLabel(r)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Assign Staff</label>
                <select value={newLog.staffId} onChange={e => setNewLog({ ...newLog, staffId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-spa-teal outline-none font-bold text-foreground appearance-none cursor-pointer"
                  disabled={staff.length === 0}>
                  <option value="" className="bg-card">
                    {staff.length === 0 ? 'No active housekeeping staff available' : 'Select Staff Member'}
                  </option>
                  {staff.map(s => <option key={s._id} value={s._id} className="bg-card">{s.fullName}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Task Type</label>
                <select value={newLog.task} onChange={e => setNewLog({ ...newLog, task: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-spa-teal outline-none font-bold text-foreground appearance-none cursor-pointer">
                  <option className="bg-card">Routine Cleaning</option>
                  <option className="bg-card">Deep Cleaning</option>
                  <option className="bg-card">Maintenance Check</option>
                  <option className="bg-card">Turn down Service</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Notes (optional)</label>
                <textarea value={newLog.note} onChange={e => setNewLog({ ...newLog, note: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border focus:border-spa-teal outline-none min-h-[100px] font-medium text-foreground resize-none placeholder:text-muted-foreground/40"
                  placeholder="Special instructions…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-border font-bold text-muted-foreground hover:bg-muted transition text-sm">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-xl bg-spa-teal hover:bg-spa-teal/90 text-white font-black uppercase tracking-wider text-sm shadow-lg shadow-spa-teal/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newLog.roomId || !newLog.staffId}>
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Main Receptionist Dashboard
───────────────────────────────────────────────────────── */
const ReceptionistDashboard = () => {
  const arrivalsPerPage = 4;
  const departuresPerPage = 6;
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [arrivalsPage, setArrivalsPage] = useState(1);
  const [departuresPage, setDeparturesPage] = useState(1);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const stats = await getDashboardStats();
      setData(stats);
      setArrivalsPage(1);
      setDeparturesPage(1);
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
    return <ReceptionistDashboardSkeleton />;
  }

  const todaysArrivals = data?.operational?.todaysArrivals || [];
  const todaysDepartures = data?.operational?.todaysDepartures || [];
  const totalArrivalPages = Math.max(1, Math.ceil(todaysArrivals.length / arrivalsPerPage));
  const totalDeparturePages = Math.max(1, Math.ceil(todaysDepartures.length / departuresPerPage));
  const paginatedArrivals = todaysArrivals.slice(
    (arrivalsPage - 1) * arrivalsPerPage,
    arrivalsPage * arrivalsPerPage,
  );
  const paginatedDepartures = todaysDepartures.slice(
    (departuresPage - 1) * departuresPerPage,
    departuresPage * departuresPerPage,
  );

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
              <h3 className="font-bold text-foreground">Pool &amp; Spa</h3>
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
                  paginatedArrivals.map((booking: any) => (
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
             {todaysArrivals.length > arrivalsPerPage && (
               <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                   Showing {(arrivalsPage - 1) * arrivalsPerPage + 1}-
                   {Math.min(arrivalsPage * arrivalsPerPage, todaysArrivals.length)} of{" "}
                   {todaysArrivals.length}
                 </p>
                 <div className="flex items-center gap-2">
                   <button
                     onClick={() => setArrivalsPage((prev) => Math.max(1, prev - 1))}
                     disabled={arrivalsPage === 1}
                     className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
                   >
                     Previous
                   </button>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                     Page {arrivalsPage} of {totalArrivalPages}
                   </span>
                   <button
                     onClick={() =>
                       setArrivalsPage((prev) => Math.min(totalArrivalPages, prev + 1))
                     }
                     disabled={arrivalsPage === totalArrivalPages}
                     className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
                   >
                     Next
                   </button>
                 </div>
               </div>
             )}
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
              paginatedDepartures.map((booking: any) => (
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
          {todaysDepartures.length > departuresPerPage && (
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Showing {(departuresPage - 1) * departuresPerPage + 1}-
                {Math.min(departuresPage * departuresPerPage, todaysDepartures.length)} of{" "}
                {todaysDepartures.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeparturesPage((prev) => Math.max(1, prev - 1))}
                  disabled={departuresPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  Page {departuresPage} of {totalDeparturePages}
                </span>
                <button
                  onClick={() =>
                    setDeparturesPage((prev) => Math.min(totalDeparturePages, prev + 1))
                  }
                  disabled={departuresPage === totalDeparturePages}
                  className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </div>

      {/* ── Housekeeping Section ── */}
      <HousekeepingPanel />
    </div>
  );
};

export default ReceptionistDashboard;
