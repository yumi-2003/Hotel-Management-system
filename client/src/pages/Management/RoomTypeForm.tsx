import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomTypeById, createRoomType, updateRoomType, getAllAmenities } from '../../services/roomService';
import type { Amenity } from '../../types';
import { 
  ArrowLeft, Save, Loader2, Image as ImageIcon, Plus, Trash2, 
  Check, Info, DollarSign, Users, Maximize, BedSingle 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

const RoomTypeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    typeName: '',
    description: '',
    basePrice: 0,
    maxAdults: 2,
    maxChildren: 1,
    maxGuests: 3,
    bedType: 'King',
    sizeSqm: 35,
    images: [] as (string | File)[],
    existingImages: [] as string[],
    selectedAmenities: [] as string[],
    isFeatured: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ams = await getAllAmenities();
        setAmenities(ams);

        if (isEdit && id) {
          const rt = await getRoomTypeById(id);
          setFormData({
            typeName: rt.typeName,
            description: rt.description,
            basePrice: rt.basePrice,
            maxAdults: rt.maxAdults,
            maxChildren: rt.maxChildren,
            maxGuests: rt.maxGuests,
            bedType: rt.bedType,
            sizeSqm: rt.sizeSqm || 35,
            images: [],
            existingImages: rt.images || [],
            selectedAmenities: (rt.amenities as any[]).map(a => typeof a === 'string' ? a : a._id),
            isFeatured: rt.isFeatured,
          });
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter(id => id !== amenityId)
        : [...prev.selectedAmenities, amenityId]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      
      const validFiles = filesArray.filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext && validExtensions.includes(ext)) {
          return true;
        }
        toast.error(`Invalid file type: ${file.name}. Only JPG, JPEG, PNG, WEBP allowed.`);
        return false;
      });

      if (validFiles.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...validFiles] 
        }));
      }
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formToSend = new FormData();
      formToSend.append('typeName', formData.typeName);
      formToSend.append('description', formData.description);
      formToSend.append('basePrice', String(formData.basePrice));
      formToSend.append('maxAdults', String(formData.maxAdults));
      formToSend.append('maxChildren', String(formData.maxChildren));
      formToSend.append('maxGuests', String(formData.maxGuests));
      formToSend.append('bedType', formData.bedType);
      formToSend.append('sizeSqm', String(formData.sizeSqm));
      formToSend.append('isFeatured', String(formData.isFeatured));
      
      formData.selectedAmenities.forEach(id => {
        formToSend.append('amenities[]', id);
      });

      formData.existingImages.forEach(url => {
        formToSend.append('existingImages[]', url);
      });

      formData.images.forEach(image => {
        if (image instanceof File) {
          formToSend.append('images', image);
        }
      });

      if (isEdit && id) {
        await updateRoomType(id, formToSend);
        toast.success('Room type updated successfully!');
      } else {
        await createRoomType(formToSend);
        toast.success('Room type created successfully!');
      }
      navigate('/admin/rooms');
    } catch (error: any) {
      console.error('Failed to save room type', error);
      toast.error(error?.response?.data?.message || 'Failed to save room type. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin h-10 w-10 text-spa-teal" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/admin/rooms')}
            className="flex items-center gap-2 text-muted-foreground hover:text-spa-teal font-bold transition mb-2"
          >
            <ArrowLeft size={18} /> Back to Rooms
          </button>
          <h1 className="text-3xl font-bold text-[#0F2F2F]">
            {isEdit ? 'Edit Room Type' : 'Create Room Type'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0F2F2F] mb-6 flex items-center gap-2">
            <Info className="text-spa-teal" size={20} /> Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#0F2F2F]/60 mb-2">Room Type Name</label>
              <input 
                type="text" 
                name="typeName"
                value={formData.typeName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-spa-teal outline-none"
                placeholder="e.g. Deluxe Ocean View Suite"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#0F2F2F]/60 mb-2">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-spa-teal outline-none h-32"
                placeholder="Describe the room features, view, and unique selling points..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F2F2F]/60 mb-2">
                 <div className="flex items-center gap-1"><DollarSign size={14} /> Base Price (per night)</div>
              </label>
              <input 
                type="number" 
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-spa-teal outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F2F2F]/60 mb-2">
                 <div className="flex items-center gap-1"><BedSingle size={14} /> Bed Type</div>
              </label>
              <select 
                name="bedType"
                value={formData.bedType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-spa-teal outline-none bg-white"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Queen">Queen</option>
                <option value="King">King</option>
                <option value="Twin">Twin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F2F2F]/60 mb-2">
                 <div className="flex items-center gap-1"><Maximize size={14} /> Size (sqm)</div>
              </label>
              <input 
                type="number" 
                name="sizeSqm"
                value={formData.sizeSqm}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-spa-teal outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-8">
              <input 
                type="checkbox" 
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData(p => ({ ...p, isFeatured: e.target.checked }))}
                className="w-5 h-5 rounded border-border text-spa-teal focus:ring-spa-teal"
              />
              <label htmlFor="isFeatured" className="text-sm font-bold text-[#0F2F2F]">Feature this room on home page</label>
            </div>
          </div>
        </div>

        {/* Occupancy */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0F2F2F] mb-6 flex items-center gap-2">
            <Users className="text-spa-teal" size={20} /> Occupancy Limits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#0F2F2F]/60 mb-2">Max Adults</label>
              <input 
                type="number" 
                name="maxAdults"
                value={formData.maxAdults}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-spa-teal outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F2F2F]/60 mb-2">Max Children</label>
              <input 
                type="number" 
                name="maxChildren"
                value={formData.maxChildren}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-spa-teal outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F2F2F]/60 mb-2">Total Max Guests</label>
              <input 
                type="number" 
                name="maxGuests"
                value={formData.maxGuests}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-spa-teal outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Categories / Amenities */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0F2F2F] mb-6 flex items-center gap-2">
            <Check className="text-spa-teal" size={20} /> Amenities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
             {amenities.map(amenity => (
               <button
                 key={amenity._id}
                 type="button"
                 onClick={() => handleAmenityToggle(amenity._id)}
                 className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                   formData.selectedAmenities.includes(amenity._id)
                     ? 'bg-spa-mint/10 border-spa-teal text-spa-teal'
                     : 'bg-white border-border text-[#0F2F2F]/60 hover:border-spa-teal/50'
                 }`}
               >
                 {amenity.name}
                 {formData.selectedAmenities.includes(amenity._id) && <Check size={14} />}
               </button>
             ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#0F2F2F] flex items-center gap-2">
              <ImageIcon className="text-spa-teal" size={20} /> Room Images
            </h2>
            <div className="flex gap-2">
              <input
                type="file"
                id="room-images"
                multiple
                accept="image/jpeg, image/png, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById('room-images')?.click()}
                className="rounded-xl border-dashed border-2 hover:border-spa-teal hover:text-spa-teal"
              >
                <Plus size={16} /> Add Images
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Existing Images */}
            {formData.existingImages.map((img, idx) => (
              <div key={`existing-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                <img src={img} alt="Existing" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveExistingImage(idx)}
                    className="text-white hover:text-red-400"
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>
            ))}

            {/* New Uploads */}
            {formData.images.map((img, idx) => (
              <div key={`new-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-spa-teal/30 bg-spa-teal/5">
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                  <ImageIcon size={24} className="text-spa-teal mb-1" />
                  <span className="text-[10px] font-bold text-[#0F2F2F] truncate w-full">
                    {img instanceof File ? img.name : 'New File'}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveNewImage(idx)}
                    className="text-white hover:text-red-400"
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-muted-foreground italic">
            Tip: Upload high-quality landscape photos. All images will be automatically optimized and stored in the cloud.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => navigate('/admin/rooms')}
            className="rounded-xl font-bold px-8 h-12"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={submitting}
            className="bg-spa-teal hover:bg-spa-teal-dark text-white rounded-xl font-bold px-12 h-12 shadow-md shadow-spa-teal/20"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : (
              <div className="flex items-center gap-2"><Save size={18} /> {isEdit ? 'Update Room Type' : 'Create Room Type'}</div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoomTypeForm;
