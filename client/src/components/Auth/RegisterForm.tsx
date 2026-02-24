import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Mail, User, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { getDashboardRoute } from '../../utils/roleUtils';

const RegisterForm = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNum = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    return minLength && hasUpper && hasLower && (hasNum || hasSpecial);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (!validatePassword(password)) {
      setLocalError('Password must be at least 8 characters and include uppercase, lowercase, and a number or special character.');
      return;
    }

    const result = await dispatch(registerUser({ fullName, email, password }));
    if (registerUser.fulfilled.match(result)) {
      const userRole = result.payload.user.role;
      const dashboardRoute = getDashboardRoute(userRole);
      navigate(dashboardRoute);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full bg-card rounded-3xl shadow-2xl p-8 border border-border">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-spa-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-spa-teal" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Create Account</h2>
          <p className="text-muted-foreground mt-2 font-medium">Join Comftay Resort today</p>
        </div>

        {(error || localError) && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
             <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
             <p className="text-sm font-semibold">{error || localError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs font-bold text-foreground uppercase tracking-wider ml-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                <User size={18} />
              </div>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 border border-border bg-muted text-foreground rounded-2xl focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal focus:bg-background outline-none transition-all font-medium"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-bold text-foreground uppercase tracking-wider ml-1">
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
                className="w-full pl-11 pr-4 py-3.5 border border-border bg-muted text-foreground rounded-2xl focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal focus:bg-background outline-none transition-all font-medium"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-bold text-foreground uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-12 py-3.5 border border-border bg-muted text-foreground rounded-2xl focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal focus:bg-background outline-none transition-all font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-spa-teal transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-foreground uppercase tracking-wider ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                <Lock size={18} />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-11 pr-12 py-3.5 border border-border bg-muted text-foreground rounded-2xl focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal focus:bg-background outline-none transition-all font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-spa-teal transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spa-teal text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-spa-teal/20 hover:bg-spa-teal-dark hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 mt-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border pt-8">
          <p className="text-muted-foreground font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-spa-teal hover:text-spa-teal-dark font-bold underline underline-offset-4 decoration-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
