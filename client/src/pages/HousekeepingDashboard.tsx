import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { getAllHousekeepingLogs, updateHousekeepingStatus } from '../services/housekeepingService';
import StatsCard from '../components/dashboard/StatsCard';
import RoomStatusChart from '../components/dashboard/RoomStatusChart';
import { 
  Brush, AlertCircle, 
  CheckCircle, ListChecks,
  Play, CheckCircle2, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { HousekeepingLog } from '../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface DashboardData {
  kpi: {
    checkInsToday: number;
    checkOutsToday: number;
    occupancyRate: number;
    totalRooms: number;
    occupiedRooms: number;
  };
  charts: {
    roomStatusDistribution: { _id: string; count: number }[];
  };
}

const HousekeepingDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [data, setData] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<HousekeepingLog[]>([]);
  const [history, setHistory] = useState<HousekeepingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [finishingTask, setFinishingTask] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState({ roomStatus: 'available', note: '' });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, activeLogs, historyLogs] = await Promise.all([
        getDashboardStats(),
        getAllHousekeepingLogs({ status: ['dirty', 'cleaning'].join(',') }),
        getAllHousekeepingLogs({ status: 'clean' })
      ]);
      setData(stats);
      
      const filterUserTasks = (logs: HousekeepingLog[]) => {
        if (user?.role === 'housekeeping') {
          return logs.filter((l: any) => l.assignedTo?._id === user._id);
        }
        return logs.filter((l: any) => l.assignedTo);
      };

      setTasks(filterUserTasks(activeLogs));
      setHistory(filterUserTasks(historyLogs));
    } catch (err) {
      console.error('Failed to fetch housekeeping dashboard data', err);
      toast.error('Failed to refresh task list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      if (newStatus === 'clean') {
        setFinishingTask(taskId);
        return;
      }
      await updateHousekeepingStatus(taskId, newStatus);
      toast.success(`Task updated to ${newStatus}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update task', err);
      toast.error('Failed to update task status');
    }
  };

  const handleCompleteTask = async () => {
    if (!finishingTask) return;
    try {
      await updateHousekeepingStatus(
        finishingTask, 
        'clean', 
        completionData.note, 
        completionData.roomStatus
      );
      toast.success('Room marked as ' + completionData.roomStatus);
      setFinishingTask(null);
      setCompletionData({ roomStatus: 'available', note: '' });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to complete task', err);
      toast.error('Failed to complete task');
    }
  };

  const maintenanceRooms = data?.charts.roomStatusDistribution.find(d => d._id === 'maintenance')?.count || 0;
  const availableRooms = data?.charts.roomStatusDistribution.find(d => d._id === 'available')?.count || 0;

  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-spa-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-[#0F2F2F] tracking-tight">Housekeeping Hub</h1>
          <p className="text-slate-500 font-medium">Cleaning tasks and real-time room readiness</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-spa-teal text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-spa-teal/20 mb-1">
             Status: Online
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team: Alpha Squad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Active Tasks" 
          value={tasks.length} 
          icon={<ListChecks className="text-spa-teal" />}
          description="Rooms needing attention"
        />
        <StatsCard 
          title="In Maintenance" 
          value={maintenanceRooms} 
          icon={<AlertCircle className="text-amber-500" />}
          description="Service required"
        />
        <StatsCard 
          title="Guest Ready" 
          value={availableRooms} 
          icon={<CheckCircle size={24} className="text-green-500" />}
          description="Available for check-in"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <Brush size={24} className="text-spa-teal" /> Work Center
                </h2>
                <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto">
                  <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === 'active' ? 'bg-white text-spa-teal shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === 'history' ? 'bg-white text-spa-teal shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    History
                  </button>
                </div>
             </div>

             <div className="space-y-4">
                {(activeTab === 'active' ? tasks : history).length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      {activeTab === 'active' ? <CheckCircle2 size={32} className="text-slate-300" /> : <ListChecks size={32} className="text-slate-300" />}
                    </div>
                    <p className="text-slate-400 font-bold">
                      {activeTab === 'active' ? 'No assigned tasks at the moment.' : 'Your work history is empty.'}
                    </p>
                  </div>
                ) : (
                  (activeTab === 'active' ? tasks : history).map((task) => (
                    <div key={task._id} className="group flex flex-col p-6 rounded-3xl border border-slate-50 bg-slate-50/20 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 gap-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-colors ${
                               task.status === 'clean' ? 'bg-emerald-500 text-white' : 
                               task.status === 'cleaning' ? 'bg-blue-500 text-white' : 
                               'bg-amber-100 text-amber-700'
                            }`}>
                              <span className="text-[10px] uppercase leading-none mb-1">Room</span>
                              <span className="text-xl leading-none">{(task.room as any)?.roomNumber}</span>
                            </div>
                            <div>
                              <div className="font-black text-slate-800 text-lg leading-tight mb-1">{task.task}</div>
                              <div className="flex items-center gap-2">
                                 <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                   task.status === 'clean' ? 'bg-emerald-100 text-emerald-700' :
                                   task.status === 'cleaning' ? 'bg-blue-100 text-blue-700' : 
                                   'bg-red-100 text-red-700'
                                 }`}>
                                   {task.status === 'clean' ? <CheckCircle2 size={10} /> :
                                    task.status === 'cleaning' ? <Clock size={10} /> : 
                                    <AlertCircle size={10} />}
                                   {task.status}
                                 </span>
                                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">• Floor {(task.room as any)?.floor || '?'}</span>
                              </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {activeTab === 'active' && (
                            <>
                              {task.status === 'dirty' && (
                                <button 
                                  onClick={() => handleStatusUpdate(task._id, 'cleaning')}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#0F2F2F] text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-[#1a4a4a] transition shadow-lg shadow-slate-900/10"
                                >
                                  <Play size={14} /> Start
                                </button>
                              )}
                              {task.status === 'cleaning' && finishingTask !== task._id && (
                                <button 
                                  onClick={() => handleStatusUpdate(task._id, 'clean')}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/10"
                                >
                                  <CheckCircle2 size={14} /> Finish
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {activeTab === 'active' && finishingTask === task._id && (
                        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Final Room Status</label>
                              <select 
                                value={completionData.roomStatus}
                                onChange={(e) => setCompletionData({...completionData, roomStatus: e.target.value})}
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-spa-teal/20 transition"
                              >
                                <option value="available">Available / Ready</option>
                                <option value="maintenance">Maintenance Required</option>
                                <option value="cleaning">Needs Further Cleaning</option>
                              </select>
                            </div>
                            <div>
                               <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Completion Note</label>
                               <input 
                                 type="text"
                                 placeholder="e.g. All clear, mini-bar restocked"
                                 value={completionData.note}
                                 onChange={(e) => setCompletionData({...completionData, note: e.target.value})}
                                 className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-spa-teal/20 transition placeholder:text-slate-300"
                               />
                            </div>
                          </div>
                          <div className="flex gap-2">
                             <button 
                               onClick={handleCompleteTask}
                               className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-black text-xs hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/10"
                             >
                               Confirm Completion
                             </button>
                             <button 
                               onClick={() => setFinishingTask(null)}
                               className="px-6 py-3 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs hover:bg-slate-200 transition"
                             >
                               Cancel
                             </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
             </div>
          </div>

          <div className="space-y-8">
             <div className="bg-[#0F2F2F] rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Protocol Reminder</h3>
                   <p className="text-xl font-bold leading-relaxed">
                     Please ensure all "Ready for Guest" rooms are double-checked for amenities and climate control.
                   </p>
                </div>
                <Brush size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
             </div>
             <RoomStatusChart data={data?.charts.roomStatusDistribution || []} />
          </div>
      </div>
    </div>
  );
};

export default HousekeepingDashboard;
