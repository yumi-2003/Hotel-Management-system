import { useState, useEffect } from 'react';
import { getAllUsers, createStaffUser, updateUserStatus, updateUserRole, deleteUser } from '../../services/api';
import { useAppSelector } from '../../hooks/redux';
import type { User } from '../../types';
import toast from 'react-hot-toast';
import {
  Users, ShieldAlert, UserCheck,
  Trash2, Loader2, Search, Mail, Phone,
  UserPlus, X, Eye, EyeOff, Shield, ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/button';

// Role badge styles
const ROLE_STYLES: Record<string, string> = {
  admin:        'bg-purple-100 text-purple-700',
  manager:      'bg-blue-100 text-blue-700',
  receptionist: 'bg-teal-100 text-teal-700',
  housekeeping: 'bg-orange-100 text-orange-700',
  guest:        'bg-slate-100 text-slate-500',
};

const ROLE_LABELS: Record<string, string> = {
  admin:        'Admin',
  manager:      'Manager',
  receptionist: 'Receptionist',
  housekeeping: 'Housekeeping',
  guest:        'Guest',
};

// Which roles can be created by admin vs manager
const ADMIN_CREATABLE_ROLES  = ['manager', 'receptionist', 'housekeeping'];
const MANAGER_CREATABLE_ROLES = ['receptionist', 'housekeeping'];

// Which roles a manager can see/edit
const MANAGER_SCOPE = ['receptionist', 'housekeeping'];

// ── Create Staff Modal ────────────────────────────────────────────────────────
interface CreateStaffModalProps {
  callerRole: string;
  onClose: () => void;
  onCreated: (user: User) => void;
}

const CreateStaffModal = ({ callerRole, onClose, onCreated }: CreateStaffModalProps) => {
  const allowed = callerRole === 'admin' ? ADMIN_CREATABLE_ROLES : MANAGER_CREATABLE_ROLES;

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: allowed[0],
  });
  const [showPw, setShowPw]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())   e.fullName = 'Full name is required';
    if (!form.email.trim())      e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)          e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setSubmitting(true);
      const created = await createStaffUser({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
      });
      toast.success(`${ROLE_LABELS[form.role]} account created successfully!`);
      onCreated(created);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create staff account';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-semibold text-[#0F2F2F] mb-1.5">{label}</label>
      <input
        type={name === 'password' ? (showPw ? 'text' : 'password') : type}
        value={form[name]}
        onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: '' })); }}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border ${errors[name] ? 'border-red-400 focus:ring-red-200' : 'border-border focus:border-spa-teal focus:ring-spa-teal/20'} focus:ring-2 outline-none transition text-sm`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-spa-teal/10 flex items-center justify-center text-spa-teal">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0F2F2F]">Create Staff Account</h2>
              <p className="text-xs text-muted-foreground">New team member on board</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('fullName', 'Full Name', 'text', 'e.g. Maria Hernandez')}
            {field('email', 'Email Address', 'email', 'staff@comftay.com')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('phone', 'Phone (optional)', 'tel', '+1-555-000-0000')}
            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-[#0F2F2F] mb-1.5">Role</label>
              <div className="relative">
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-border focus:border-spa-teal focus:ring-2 focus:ring-spa-teal/20 outline-none text-sm font-medium bg-white cursor-pointer"
                >
                  {allowed.map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-[#0F2F2F] mb-1.5">Temporary Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }}
                placeholder="Min. 8 characters"
                className={`w-full px-4 py-2.5 pr-12 rounded-xl border ${errors.password ? 'border-red-400 focus:ring-red-200' : 'border-border focus:border-spa-teal focus:ring-spa-teal/20'} focus:ring-2 outline-none transition text-sm`}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0F2F2F] transition">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Role badge preview */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-border">
            <Shield size={14} className="text-spa-teal" />
            <span className="text-xs text-muted-foreground">Account will be created with</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_STYLES[form.role]}`}>
              {ROLE_LABELS[form.role]}
            </span>
            <span className="text-xs text-muted-foreground">access</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-spa-teal hover:bg-spa-teal/90 text-white gap-2">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {submitting ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const UserManagement = () => {
  const { user: currentUser } = useAppSelector(state => state.auth);
  const callerRole = currentUser?.role || 'admin';
  const isAdmin    = callerRole === 'admin';

  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal]   = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers({ role: roleFilter || undefined });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      setProcessingId(id);
      await updateUserStatus(id, newStatus);
      setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } as any : u));
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'blocked'}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally { setProcessingId(null); }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      setProcessingId(id);
      await updateUserRole(id, newRole);
      setUsers(users.map(u => u._id === id ? { ...u, role: newRole } as any : u));
      toast.success('Role updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update role');
    } finally { setProcessingId(null); }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;
    try {
      setProcessingId(id);
      await deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    } finally { setProcessingId(null); }
  };

  const handleCreated = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Role options visible in the filter and table based on caller role
  const visibleRoleOptions = isAdmin
    ? ['admin', 'manager', 'receptionist', 'housekeeping', 'guest']
    : MANAGER_SCOPE;

  // Roles manager can reassign
  const assignableRoles = isAdmin ? ADMIN_CREATABLE_ROLES : MANAGER_CREATABLE_ROLES;

  // Summary counts
  const staffCount = users.filter(u => ['manager','receptionist','housekeeping'].includes((u as any).role)).length;
  const activeCount = users.filter(u => (u as any).status === 'active').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2F2F] flex items-center gap-3">
            <Users className="text-spa-teal" /> {isAdmin ? 'User & Staff Management' : 'Staff Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? 'Manage all users, roles, and access credentials'
              : 'Create and manage Receptionist & Housekeeping accounts'}
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-spa-teal hover:bg-spa-teal/90 text-white gap-2 rounded-xl px-5"
        >
          <UserPlus size={16} /> Add Staff Member
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users',    value: users.length,  color: 'text-[#0F2F2F]' },
          { label: 'Staff Members',  value: staffCount,    color: 'text-spa-teal' },
          { label: 'Active',         value: activeCount,   color: 'text-green-600' },
          { label: 'Inactive',       value: users.length - activeCount, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-border rounded-2xl p-4 shadow-sm">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-border bg-slate-50/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border focus:border-spa-teal focus:ring-1 focus:ring-spa-teal/20 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border bg-white outline-none focus:border-spa-teal text-sm"
            >
              <option value="">All Roles</option>
              {visibleRoleOptions.map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={fetchUsers} className="rounded-xl">
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-spa-teal" size={32} />
                    <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-sm text-muted-foreground">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const uAny = u as any;
                  const isProcessing = processingId === u._id;
                  const canEdit = isAdmin || MANAGER_SCOPE.includes(uAny.role);

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Avatar + Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ${ROLE_STYLES[uAny.role] || 'bg-slate-100 text-slate-500'}`}>
                            {uAny.profileImage
                              ? <img src={`http://localhost:4000${uAny.profileImage}`} className="w-full h-full object-cover" />
                              : u.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-[#0F2F2F]">{u.fullName}</div>
                            <div className="text-[10px] text-muted-foreground">#{u._id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
                            <Mail size={11} /> {u.email}
                          </div>
                          {u.phone && (
                            <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
                              <Phone size={11} /> {u.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        {canEdit && assignableRoles.includes(uAny.role) ? (
                          <div className="relative">
                            <select
                              value={uAny.role}
                              onChange={e => handleRoleChange(u._id, e.target.value)}
                              disabled={isProcessing}
                              className={`appearance-none text-xs font-bold px-2.5 py-1 pr-6 rounded-full border-0 cursor-pointer outline-none ${ROLE_STYLES[uAny.role] || ''}`}
                            >
                              {assignableRoles.map(r => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                              ))}
                            </select>
                            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                          </div>
                        ) : (
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${ROLE_STYLES[uAny.role] || 'bg-slate-100 text-slate-500'}`}>
                            {ROLE_LABELS[uAny.role] || uAny.role}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => canEdit && handleStatusToggle(u._id, uAny.status)}
                          disabled={isProcessing || !canEdit}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                            uAny.status === 'active'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          } ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {isProcessing
                            ? <Loader2 size={10} className="animate-spin" />
                            : uAny.status === 'active' ? <UserCheck size={10} /> : <ShieldAlert size={10} />}
                          {uAny.status}
                        </button>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4">
                        <span className="text-xs text-muted-foreground">
                          {uAny.createdAt ? new Date(uAny.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => canEdit && handleDeleteUser(u._id, u.fullName || 'User')}
                          disabled={isProcessing || !canEdit}
                          className={`text-red-400 hover:text-red-600 hover:bg-red-50 ${!canEdit ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title={canEdit ? 'Delete user' : 'Insufficient permissions'}
                        >
                          {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-3 border-t border-border bg-slate-50/50 text-xs text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Create Staff Modal */}
      {showModal && (
        <CreateStaffModal
          callerRole={callerRole}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default UserManagement;
