import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { getDashboardRoute } from '../../utils/roleUtils';
import hero1 from '../../assets/images/hero1.jpg';

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
    <div className="h-screen flex items-stretch bg-background overflow-hidden">
      {/* Hero Image Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={hero1} 
          alt="Login Hero" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-12 text-white">
          <div className="max-w-sm animate-in slide-in-from-left duration-700">
            <h1 className="text-4xl font-extrabold mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight leading-tight">Experience Tranquility</h1>
            <p className="text-base font-medium opacity-90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] leading-relaxed">Welcome back to Comftay Resort. Your sanctuary awaits.</p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-muted/30">
        <div className="max-w-md w-full animate-in zoom-in-95 duration-500 py-4">
          <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] p-8 border border-border transform transition-all">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-spa-teal/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-spa-teal/20">
                <LogIn className="w-6 h-6 text-spa-teal" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Welcome Back</h2>
              <p className="text-muted-foreground mt-1 text-sm font-medium">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                 <div className="flex-shrink-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">!</div>
                 <p className="text-xs font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[10px] font-bold text-foreground uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-border bg-muted/50 text-foreground rounded-xl focus:ring-4 focus:ring-spa-teal/10 focus:border-spa-teal focus:bg-background outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/30 shadow-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="password" className="block text-[10px] font-bold text-foreground uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" university-data-hidden="true" className="text-[10px] font-bold text-spa-teal hover:text-spa-teal-dark transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-border bg-muted/50 text-foreground rounded-xl focus:ring-4 focus:ring-spa-teal/10 focus:border-spa-teal focus:bg-background outline-none transition-all text-sm font-medium placeholder:text-muted-foreground/30 shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-spa-teal transition-colors outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-spa-teal text-white py-3 rounded-xl font-bold text-base shadow-[0_10px_20px_rgba(20,184,166,0.2)] hover:bg-spa-teal-dark hover:shadow-[0_15px_25px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 h-12"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Signing in...</span>
                  </div>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-border pt-6">
              <p className="text-muted-foreground text-sm font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-spa-teal hover:text-spa-teal-dark font-bold underline underline-offset-4 decoration-2 transition-all">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
