import { useEffect, useState } from 'react';
import { getAllHousekeepingLogs, assignHousekeepingTask } from '../services/housekeepingService';
import { getAllUsers } from '../services/api';
import type { User, HousekeepingLog } from '../types';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  ClipboardList, 
  MapPin, 
  UserPlus,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const HousekeepingAssignment = () => {
  const [tasks, setTasks] = useState<HousekeepingLog[]>([]);
  const [housekeepers, setHousekeepers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logs, users] = await Promise.all([
        getAllHousekeepingLogs({ status: 'dirty' }),
        getAllUsers({ role: 'housekeeping' })
      ]);
      setTasks(logs.filter((l: any) => !l.assignedTo));
      setHousekeepers(users);
    } catch (err) {
      console.error('Failed to fetch assignment data', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (taskId: string, staffId: string) => {
    try {
      await assignHousekeepingTask(taskId, staffId);
      toast.success('Task successfully assigned');
      fetchData();
    } catch (err) {
      console.error('Assignment failed', err);
      toast.error('Failed to assign task');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-spa-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black text-[#0F2F2F] tracking-tight">Assignment Command</h1>
        <p className="text-slate-500 font-medium">Coordinate the cleanup crew and distribute daily tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="text-spa-teal" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Unassigned Tasks</h2>
          </div>
          
          {tasks.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center">
              <ShieldCheck size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No rooms currently awaiting assignment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tasks.map((task) => (
                <div key={task._id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-[#0F2F2F] text-white rounded-2xl flex flex-col items-center justify-center font-black">
                        <span className="text-[10px] uppercase leading-none mb-1">Room</span>
                        <span className="text-2xl leading-none">{(task.room as any)?.roomNumber}</span>
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-lg mb-1">{task.task}</div>
                        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><MapPin size={12} /> Floor {(task.room as any)?.floor}</span>
                          <span className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                            <AlertCircle size={10} /> {task.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select 
                        className="flex-1 sm:w-48 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-spa-teal/20 transition"
                        onChange={(e) => handleAssign(task._id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Select Staff</option>
                        {housekeepers.map(hk => (
                          <option key={hk._id} value={hk._id}>{hk.fullName}</option>
                        ))}
                      </select>
                      <div className="p-3 bg-spa-teal/10 text-spa-teal rounded-xl">
                        <UserPlus size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-spa-teal" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">On-Duty Staff</h2>
          </div>
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm divide-y divide-slate-50">
            {housekeepers.length === 0 ? (
              <p className="text-slate-400 font-bold py-4 text-center">No staff found.</p>
            ) : (
              housekeepers.map(hk => (
                <div key={hk._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-xs">
                      {hk.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{hk.fullName}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Housekeeping Agent</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-200 group-hover:text-spa-teal transition-colors" />
                </div>
              ))
            )}
          </div>

          <div className="bg-[#0F2F2F] rounded-[2rem] p-8 text-white">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Management Tip</h3>
            <p className="text-sm font-bold leading-relaxed">
              Equally distributing rooms helps maintain peak efficiency. Check "Floor" to minimize staff travel time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousekeepingAssignment;
