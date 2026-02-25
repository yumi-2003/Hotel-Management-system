import { useState, useRef, useEffect } from 'react';
import { Camera, Save, User, Mail, Phone, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateProfile, uploadProfileImage } from '../store/slices/authSlice';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string)?.replace('/api', '') || '';

const ProfileSettings = () => {
  const { user, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  const displayName = user?.fullName || user?.name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const profileImageUrl = previewImage
    || (user?.profileImage ? `${API_BASE}${user.profileImage}` : null);

  // Sync form when user data changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);

    setImageUploading(true);
    try {
      await dispatch(uploadProfileImage(file)).unwrap();
      showSuccess('Profile image updated!');
    } catch {
      setPreviewImage(null);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile({ fullName, phone })).unwrap();
      showSuccess('Profile updated successfully!');
    } catch {
      // Error handled by slice
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'from-red-500 to-orange-500',
      manager: 'from-purple-500 to-indigo-500',
      receptionist: 'from-blue-500 to-cyan-500',
      housekeeping: 'from-green-500 to-emerald-500',
      guest: 'from-spa-teal to-spa-teal-dark',
    };
    return colors[role] || colors.guest;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-spa-mint/5 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and preferences</p>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            <span className="font-medium text-sm">{successMessage}</span>
          </div>
        )}

        {/* Profile Image Card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-spa-teal via-spa-teal-dark to-spa-teal relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
          </div>
          <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-card shadow-lg">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-spa-teal to-spa-teal-dark flex items-center justify-center text-white font-bold text-2xl">
                    {initials}
                  </div>
                )}
              </div>
              {/* Upload Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                {imageUploading ? (
                  <Loader2 size={24} className="text-white animate-spin opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <h2 className="mt-3 text-xl font-bold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRoleBadgeColor(user?.role || 'guest')}`}>
              <Shield size={12} />
              {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-foreground mb-6">Personal Information</h3>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <User size={14} className="text-muted-foreground" />
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-muted/50 focus:bg-background focus:border-spa-teal focus:ring-2 focus:ring-spa-teal/20 outline-none transition text-sm"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Mail size={14} className="text-muted-foreground" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-4 py-3 border border-border rounded-xl bg-muted text-muted-foreground cursor-not-allowed text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Phone size={14} className="text-muted-foreground" />
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-muted/50 focus:bg-background focus:border-spa-teal focus:ring-2 focus:ring-spa-teal/20 outline-none transition text-sm"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-spa-teal to-spa-teal-dark text-white rounded-xl hover:shadow-lg hover:shadow-spa-teal/25 transition-all duration-200 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
