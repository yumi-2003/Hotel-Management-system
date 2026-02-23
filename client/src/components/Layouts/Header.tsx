import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Home, LogIn, UserPlus, LayoutDashboard, Calendar, LogOut, Settings, Sun, Moon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logoutUser } from "../../store/slices/authSlice";
import { getDashboardRoute, UserRole } from "../../utils/roleUtils";
import NotificationBell from "./NotificationBell";
import { useTheme } from "../../contexts/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

const Header = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.fullName || user?.name || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const profileImageUrl = user?.profileImage
    ? `${API_BASE}${user.profileImage}`
    : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!user?.role) return "/";
    return getDashboardRoute(user.role);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const ThemeToggleButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={`p-2 rounded-lg border border-border text-foreground hover:text-spa-teal hover:border-spa-teal/50 hover:bg-spa-teal/5 transition-all duration-200 ${className}`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );

  const ProfileAvatar = ({ size = 'md', onClick }: { size?: 'sm' | 'md'; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className={`relative rounded-full overflow-hidden border-2 border-spa-teal/30 hover:border-spa-teal transition-all duration-200 shadow-sm hover:shadow-md ${
        size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
      }`}
    >
      {profileImageUrl ? (
        <img src={profileImageUrl} alt={displayName} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-spa-teal to-spa-teal-dark flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
    </button>
  );

  return (
    <header className="bg-card shadow-md sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          onClick={closeMenu}
          className="hover:opacity-90 transition flex items-center gap-3"
        >
          <span className="text-2xl font-bold text-spa-teal tracking-tight whitespace-nowrap">Comftay Resort Hotels</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-foreground hover:text-spa-teal transition font-medium text-sm lg:text-base px-4 py-2 border border-border rounded-lg hover:border-spa-teal/30"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role !== UserRole.GUEST && (
                <Link
                  to={getDashboardLink()}
                  className="text-foreground hover:text-spa-teal transition font-medium text-sm lg:text-base px-4 py-2 border border-border rounded-lg hover:border-spa-teal/30"
                >
                  Dashboard
                </Link>
              )}
              
              {user?.role === UserRole.GUEST && (
                <Link
                  to="/my-reservations"
                  className="text-foreground hover:text-spa-teal transition font-medium text-sm lg:text-base px-4 py-2 border border-border rounded-lg hover:border-spa-teal/30"
                >
                  My Bookings
                </Link>
              )}
              <div className="flex items-center gap-4">
                {isAuthenticated && <NotificationBell />}
                <ThemeToggleButton />
                <div className="relative" ref={profileRef}>
                  <div className="flex items-center gap-2">
                    <ProfileAvatar onClick={() => setIsProfileOpen(!isProfileOpen)} />
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="text-sm font-semibold text-foreground hover:text-spa-teal transition hidden lg:block"
                    >
                      {displayName}
                    </button>
                  </div>

                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="p-4 bg-gradient-to-r from-spa-teal/5 to-spa-mint/10 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-spa-teal/20 flex-shrink-0">
                            {profileImageUrl ? (
                              <img src={profileImageUrl} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-spa-teal to-spa-teal-dark flex items-center justify-center text-white font-bold text-sm">
                                {initials}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            <span className="inline-block mt-1 text-[10px] bg-spa-teal/10 text-spa-teal px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-spa-mint/10 hover:text-spa-teal rounded-xl transition font-medium"
                        >
                          <Settings size={16} className="text-muted-foreground" />
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5 rounded-xl transition font-medium"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggleButton />
              <Link
                to="/login"
                className="text-foreground hover:text-spa-teal transition font-medium text-sm lg:text-base px-4 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-spa-teal text-white px-5 py-2 rounded-lg hover:bg-spa-teal-dark transition font-bold text-sm shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggleButton />
          <button
            className="p-2 text-foreground hover:text-spa-teal transition active:opacity-50"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      />

      {/* Mobile drawer — use bg-card so it respects the theme */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-card z-50 md:hidden shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-bold text-spa-teal">Comftay Menu</span>
            <button onClick={closeMenu} className="p-2 text-muted-foreground hover:text-spa-teal">
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <MobileNavLink to="/" icon={<Home size={20} />} label="Home" onClick={closeMenu} />

            {isAuthenticated ? (
              <>
                {user?.role !== UserRole.GUEST && (
                  <MobileNavLink
                    to={getDashboardLink()}
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    onClick={closeMenu}
                  />
                )}
                {user?.role === UserRole.GUEST && (
                  <MobileNavLink
                    to="/my-reservations"
                    icon={<Calendar size={20} />}
                    label="My Reservations"
                    onClick={closeMenu}
                  />
                )}
                <MobileNavLink
                  to="/profile"
                  icon={<Settings size={20} />}
                  label="Profile Settings"
                  onClick={closeMenu}
                />
                
                <div className="mt-auto pt-8 flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-4 bg-spa-mint/10 rounded-2xl">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-spa-teal/20 flex-shrink-0">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-spa-teal to-spa-teal-dark flex items-center justify-center text-white font-bold text-sm">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-foreground truncate">{displayName}</span>
                      <span className="text-xs text-spa-teal font-semibold">{user?.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-4 text-destructive hover:bg-destructive/5 rounded-2xl transition font-bold"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                <MobileNavLink to="/login" icon={<LogIn size={20} />} label="Login" onClick={closeMenu} />
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full p-4 mt-2 bg-spa-teal text-white rounded-2xl shadow-lg hover:bg-spa-teal-dark transition font-bold"
                >
                  <UserPlus size={20} />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const MobileNavLink = ({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-4 p-4 text-foreground hover:text-spa-teal hover:bg-spa-mint/10 rounded-2xl transition font-bold"
  >
    <span className="text-muted-foreground">{icon}</span>
    {label}
  </Link>
);

export default Header;
