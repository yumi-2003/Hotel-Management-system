import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { getDashboardRoute } from '../../utils/roleUtils';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      console.log('Login Payload:', result.payload);
      const payload = result.payload;
      // Handle both nested user object and flat response for backward compatibility
      const userRole = payload.user?.role || (payload as any).role;
      
      if (userRole) {
        const dashboardRoute = getDashboardRoute(userRole);
        navigate(dashboardRoute);
      } else {
        console.error('User role missing in login response:', payload);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full bg-card rounded-3xl shadow-2xl p-8 border border-border transform transition-all">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-spa-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-spa-teal" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome Back</h2>
          <p className="text-muted-foreground mt-2 font-medium">Sign in to your Comftay account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
             <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
             <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="flex justify-between items-center ml-1">
              <label htmlFor="password" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-spa-teal hover:text-spa-teal-dark">
                Forgot password?
              </Link>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spa-teal text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-spa-teal/20 hover:bg-spa-teal-dark hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-border pt-8">
          <p className="text-muted-foreground font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-spa-teal hover:text-spa-teal-dark font-bold underline underline-offset-4 decoration-2">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
