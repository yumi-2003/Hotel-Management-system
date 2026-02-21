import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Calendar, CheckCircle2, Package } from 'lucide-react'; // Added Package, CheckCircle2
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchNotifications, markAsRead } from '../../store/slices/notificationSlice'; // Using notificationSlice
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notifications);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
      // Optional: interval to fetch new notifications
      const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasNotifications = unreadCount > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-spa-teal hover:bg-spa-mint/10 rounded-full transition-colors"
      >
        <Bell size={24} />
        {hasNotifications && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-border bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 px-8 text-center bg-white">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 scale-110 shadow-inner">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <h4 className="text-sm font-black text-slate-800 mb-1">All Caught Up!</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  No new assignments or alerts.<br/>Take a deep breath.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`relative p-4 border-b border-border last:border-0 transition-colors ${notif.isRead ? 'opacity-60 bg-white' : 'bg-spa-mint/5'}`}
                >
                  <Link
                    to={notif.link || '#'}
                    onClick={() => {
                       if (!notif.isRead) handleMarkAsRead(notif._id);
                       setIsOpen(false);
                    }}
                    className="flex gap-3"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'assignment' ? 'bg-spa-teal/10 text-spa-teal' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {notif.type === 'assignment' ? <Package size={18} /> : <AlertTriangle size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm mb-1 ${notif.isRead ? 'text-slate-500 font-medium' : 'text-slate-800 font-bold'}`}>
                        {notif.type === 'assignment' ? 'New Task Assigned' : 'Notification'}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed mb-1">{notif.message}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <Calendar size={10} />
                        {formatDistanceToNow(new Date(notif.createdAt))} ago
                      </div>
                    </div>
                  </Link>
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-spa-teal transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 bg-slate-50/50 border-t border-border text-center">
            <button 
              onClick={() => dispatch(fetchNotifications())}
              className="text-xs font-bold text-spa-teal hover:text-spa-teal-dark transition"
            >
              Refresh Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
