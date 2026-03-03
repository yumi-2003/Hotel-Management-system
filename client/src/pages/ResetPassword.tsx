import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Mail, Lock, Hash, Loader2, Hotel } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { resetPassword, clearError, clearSuccessMessage } from '../store/slices/authSlice';

const ResetPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const result = await dispatch(resetPassword({ email, code, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors duration-300">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-spa-teal/10 dark:bg-spa-teal/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-spa-mint/20 dark:bg-spa-mint/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full bg-card text-card-foreground rounded-3xl shadow-2xl border border-border p-8 transition-colors duration-300">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Hotel className="w-6 h-6 text-spa-teal" />
            <span className="text-sm font-black tracking-[0.2em] uppercase text-spa-teal">Comftay Hotel</span>
          </div>
          <div className="w-16 h-16 bg-spa-teal/10 dark:bg-spa-teal/20 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-spa-teal/20">
            <ShieldCheck className="w-8 h-8 text-spa-teal" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Reset Password</h2>
          <p className="text-muted-foreground mt-2 font-medium">Enter the 6-digit code sent to your email</p>
        </div>

        {/* Error */}
        {(error || localError) && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-r-lg flex items-center gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
            <p className="text-sm font-semibold">{error || localError}</p>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-400 rounded-r-lg flex items-center gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border border-input bg-background text-foreground rounded-2xl focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal outline-none transition-all font-medium placeholder:text-muted-foreground/60"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Verification Code */}
          <div className="space-y-1">
            <label htmlFor="code" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
              Verification Code
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                <Hash size={18} />
              </div>
              <input
                id="code"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border border-input bg-background text-foreground rounded-2xl focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal outline-none transition-all font-medium tracking-[0.5em] text-center placeholder:tracking-normal placeholder:text-muted-foreground/60"
                placeholder="000000"
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label htmlFor="newPassword" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
              New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                <Lock size={18} />
              </div>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border border-input bg-background text-foreground rounded-2xl focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal outline-none transition-all font-medium placeholder:text-muted-foreground/60"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
              Confirm New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                <Lock size={18} />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border border-input bg-background text-foreground rounded-2xl focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal outline-none transition-all font-medium placeholder:text-muted-foreground/60"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spa-teal text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-spa-teal/20 hover:bg-spa-teal-dark hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting...
              </>
            ) : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border pt-8">
          <Link to="/login" className="inline-flex items-center text-muted-foreground hover:text-spa-teal font-bold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
