import { useState, useEffect } from 'react';
import { getAllAmenities, createAmenity, updateAmenity, deleteAmenity } from '../../services/roomService';
import type { Amenity } from '../../types';
import { 
  Sparkles, Plus, Edit2, Trash2, 
  Loader2, X, Info 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import DynamicIcon from '../../components/common/DynamicIcon';
import { GridCardSkeleton } from '../../components/dashboard/DashboardSkeleton';

const AmenityManagement = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  
  const [formData, setFormData] = useState({ name: '', icon: 'Check' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const data = await getAllAmenities();
      setAmenities(data);
    } catch (error) {
      console.error('Failed to fetch amenities', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleOpenModal = (amenity?: Amenity) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setFormData({ name: amenity.name, icon: amenity.icon || 'Check' });
    } else {
      setEditingAmenity(null);
      setFormData({ name: '', icon: 'Check' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAmenity) {
        await updateAmenity(editingAmenity._id, formData);
        setAmenities(amenities.map(a => a._id === editingAmenity._id ? { ...a, ...formData } : a));
      } else {
        const newAm = await createAmenity(formData);
        setAmenities([...amenities, newAm]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save amenity', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this amenity?')) return;
    try {
      await deleteAmenity(id);
      setAmenities(amenities.filter(a => a._id !== id));
    } catch (error) {
      console.error('Failed to delete amenity', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="text-spa-teal" /> Amenity Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage global amenities available for all room types</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-spa-teal hover:bg-spa-teal-dark text-white rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Add Amenity
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <GridCardSkeleton count={8} />
        ) : amenities.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-txl">
            No amenities found. Add one to get started.
          </div>
        ) : (
          amenities.map((a) => (
            <div key={a._id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-spa-teal/10 flex items-center justify-center text-spa-teal">
                   <DynamicIcon name={a.icon || 'Check'} size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(a)} className="p-2 text-spa-teal hover:bg-spa-teal/5 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(a._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-foreground">{a.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Icon: {a.icon || 'Default'}</p>
            </div>
          ))
        )}
      </div>

      {/* Basic Modal Implementation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">{editingAmenity ? 'Edit Amenity' : 'New Amenity'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Amenity Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-spa-teal outline-none"
                  placeholder="e.g. Free Wi-Fi, Ocean View"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Icon Name (Lucide)</label>
                <input 
                  type="text" 
                  value={formData.icon}
                  onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-spa-teal outline-none"
                  placeholder="Wifi, Tv, Coffee, etc."
                />
                <div className="mt-2 p-3 bg-muted/50 rounded-xl flex items-center gap-2 text-[10px] text-muted-foreground">
                   <Info size={14} className="text-spa-teal" />
                   <span>Enter any valid Lucide icon name. Common: Wifi, Tv, Coffee, Wind (AC), Bath.</span>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl h-12 font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-spa-teal hover:bg-spa-teal-dark text-white rounded-xl h-12 font-bold"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : 'Save Amenity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmenityManagement;
