import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Mail, User, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { getDashboardRoute } from '../../utils/roleUtils';
import hero from '../../assets/images/hero.jpg';

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
    <div className="h-screen flex items-stretch bg-background overflow-hidden font-sans">
      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-y-auto bg-muted/30 order-2 lg:order-1">
        <div className="max-w-md w-full animate-in zoom-in-95 duration-500 py-4">
          <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.1)] p-6 border border-border transform transition-all">
            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-spa-teal/10 rounded-lg flex items-center justify-center mx-auto mb-2 border border-spa-teal/20">
                <ShieldCheck className="w-5 h-5 text-spa-teal" />
              </div>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">Create Account</h2>
              <p className="text-muted-foreground mt-0.5 text-xs font-medium">Join Comftay Resort today</p>
            </div>

            {(error || localError) && (
              <div className="mb-3 p-2.5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                 <div className="flex-shrink-0 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">!</div>
                 <p className="text-[11px] font-semibold leading-tight">{error || localError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-[9px] font-bold text-foreground uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                    <User size={14} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-border bg-muted/50 text-foreground rounded-lg focus:ring-4 focus:ring-spa-teal/10 focus:border-spa-teal focus:bg-background outline-none transition-all text-xs font-medium placeholder:text-muted-foreground/30 shadow-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-[9px] font-bold text-foreground uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                    <Mail size={14} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-border bg-muted/50 text-foreground rounded-lg focus:ring-4 focus:ring-spa-teal/10 focus:border-spa-teal focus:bg-background outline-none transition-all text-xs font-medium placeholder:text-muted-foreground/30 shadow-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-[9px] font-bold text-foreground uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                    <Lock size={14} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-11 py-2.5 border border-border bg-muted/50 text-foreground rounded-lg focus:ring-4 focus:ring-spa-teal/10 focus:border-spa-teal focus:bg-background outline-none transition-all text-xs font-medium placeholder:text-muted-foreground/30 shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-spa-teal transition-colors outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-[9px] font-bold text-foreground uppercase tracking-wider ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-spa-teal transition-colors">
                    <Lock size={14} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-11 py-2.5 border border-border bg-muted/50 text-foreground rounded-lg focus:ring-4 focus:ring-spa-teal/10 focus:border-spa-teal focus:bg-background outline-none transition-all text-xs font-medium placeholder:text-muted-foreground/30 shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-spa-teal transition-colors outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-spa-teal text-white py-2.5 rounded-lg font-bold text-sm shadow-[0_5px_15px_rgba(20,184,166,0.2)] hover:bg-spa-teal-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1.5 h-10"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-xs">Creating...</span>
                  </div>
                ) : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center border-t border-border pt-4">
              <p className="text-muted-foreground text-[11px] font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-spa-teal hover:text-spa-teal-dark font-bold underline underline-offset-4 decoration-2 transition-all">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Image Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden order-1 lg:order-2">
        <img 
          src={hero} 
          alt="Register Hero" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 hover:scale-110 shadow-inner"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent flex flex-col justify-end p-12 text-white text-left">
          <div className="max-w-sm animate-in slide-in-from-right duration-700">
            <h1 className="text-4xl font-extrabold mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight leading-tight">Begin Your Journey</h1>
            <p className="text-base font-medium opacity-90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] leading-relaxed">Join Comftay Resort today and unlock exclusive benefits.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
