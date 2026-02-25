import { useState, useEffect } from 'react';
import { 
  Waves, Thermometer, Users, Clock, 
  Save, Loader2, RefreshCcw, AlertCircle, CheckCircle2
} from 'lucide-react';
import { getPoolStatus, updatePoolStatus } from '../../services/poolService';
import type { Pool } from '../../types';
import { Button } from '../../components/ui/button';
import { FormSkeleton } from '../../components/dashboard/DashboardSkeleton';

const PoolManagement = () => {
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    status: 'open',
    currentOccupancy: 0,
    maxCapacity: 50,
    temperature: 28,
    openingTime: '08:00',
    closingTime: '22:00',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getPoolStatus();
      setPool(data);
      setFormData({
        status: data.status,
        currentOccupancy: data.currentOccupancy,
        maxCapacity: data.maxCapacity,
        temperature: data.temperature,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        notes: data.notes || ''
      });
    } catch (error) {
      console.error('Failed to fetch pool status', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'currentOccupancy' || name === 'maxCapacity' || name === 'temperature' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updatedPool = await updatePoolStatus(formData);
      setPool(updatedPool);
      setMessage({ type: 'success', text: 'Pool status updated successfully!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update pool status.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">Facility Management</h1>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mt-1">Infinity Pool Control Center</p>
          </div>
          <Button variant="outline" onClick={fetchData} className="rounded-xl gap-2 font-bold">
            <RefreshCcw size={18} /> Refresh Data
          </Button>
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="font-bold">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Status Section */}
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-spa-teal mb-2">
                <Waves size={24} />
                <h2 className="text-lg font-black uppercase tracking-widest">Operational Status</h2>
              </div>
              
              <div>
                <label className="block text-sm font-black text-muted-foreground/60 uppercase mb-2 tracking-wider">Current Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-14 px-5 rounded-2xl border border-border focus:border-spa-teal outline-none font-bold appearance-none bg-muted/50 text-foreground"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-muted-foreground/60 uppercase mb-2 tracking-wider">Open Time</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-spa-teal/50" />
                    <input 
                      type="time" 
                      name="openingTime"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className="w-full h-14 pl-12 pr-5 rounded-2xl border border-border focus:border-spa-teal outline-none font-bold bg-muted/50 text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-muted-foreground/60 uppercase mb-2 tracking-wider">Close Time</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-spa-teal/50" />
                    <input 
                      type="time" 
                      name="closingTime"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className="w-full h-14 pl-12 pr-5 rounded-2xl border border-border focus:border-spa-teal outline-none font-bold bg-muted/50 text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Section */}
            <div className="bg-card border border-border p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-spa-teal mb-2">
                <Thermometer size={24} />
                <h2 className="text-lg font-black uppercase tracking-widest">Metrics & Capacity</h2>
              </div>

              <div>
                <label className="block text-sm font-black text-muted-foreground/60 uppercase mb-2 tracking-wider">Temperature (°C)</label>
                <input 
                  type="number" 
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="w-full h-14 px-5 rounded-2xl border border-border focus:border-spa-teal outline-none font-bold bg-muted/50 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-muted-foreground/60 uppercase mb-2 tracking-wider">Occupancy</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-spa-teal/50" />
                    <input 
                      type="number" 
                      name="currentOccupancy"
                      value={formData.currentOccupancy}
                      onChange={handleChange}
                      className="w-full h-14 pl-12 pr-5 rounded-2xl border border-border focus:border-spa-teal outline-none font-bold bg-muted/50 text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-muted-foreground/60 uppercase mb-2 tracking-wider">Max Cap.</label>
                  <input 
                    type="number" 
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    className="w-full h-14 px-5 rounded-2xl border border-border focus:border-spa-teal outline-none font-bold bg-muted/50 text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
            <label className="block text-sm font-black text-muted-foreground/60 uppercase mb-4 tracking-wider">Internal Management Notes</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="E.g., pH levels checked at 9AM, minor tiles crack reported near north ladder..."
              className="w-full h-32 p-6 rounded-2xl border border-border focus:border-spa-teal outline-none font-bold bg-muted/50 text-foreground resize-none"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => fetchData()}
              className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest"
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="h-16 px-12 bg-spa-teal hover:bg-spa-teal-dark text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-spa-teal/20 transition-all hover:-translate-y-1"
            >
              {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>

        {pool && (
          <div className="mt-12 text-center">
            <p className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
              Last updated by {typeof pool.updatedBy === 'object' ? pool.updatedBy.fullName : 'System'} • {new Date(pool.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolManagement;
