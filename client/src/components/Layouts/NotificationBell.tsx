import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Calendar, CheckCircle2, Package, Loader2, Trash2 } from 'lucide-react'; // Added Loader2, Trash2
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchNotifications, markAsRead, markAllNotificationsAsRead, deleteAllNotifications } from '../../store/slices/notificationSlice'; // Using notificationSlice
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { notifications, loading } = useAppSelector((state) => state.notifications);
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

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleClearAll = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="text-sm font-bold text-foreground">Clear all notifications?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              dispatch(deleteAllNotifications());
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold uppercase rounded hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-foreground text-[10px] font-bold uppercase rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        background: 'var(--card)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      },
    });
  };

  const handleRefresh = async () => {
    try {
      await dispatch(fetchNotifications()).unwrap();
      // Toast removed as per user request
    } catch (error) {
      toast.error('Failed to refresh notifications');
    }
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
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="p-1 px-2 text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition flex items-center gap-1 font-bold uppercase"
                  title="Clear all notifications"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              )}
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] text-spa-teal hover:underline font-bold uppercase tracking-tight"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto bg-card relative min-h-[200px] transition-all duration-300">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 px-8 text-center animate-pulse">
                <Loader2 size={32} className="text-spa-teal animate-spin mb-4 opacity-50" />
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Checking for updates...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4 scale-110 shadow-inner">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <h4 className="text-sm font-black text-foreground mb-1">All Caught Up!</h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                  No new assignments or alerts.<br/>Take a deep breath.
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`relative p-4 border-b border-border last:border-0 transition-colors ${notif.isRead ? 'opacity-60 bg-card' : 'bg-spa-mint/5 dark:bg-spa-teal/5'}`}
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
                        notif.type === 'assignment' ? 'bg-spa-teal/10 text-spa-teal' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        {notif.type === 'assignment' ? <Package size={18} /> : <AlertTriangle size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm mb-1 ${notif.isRead ? 'text-muted-foreground font-medium' : 'text-foreground font-bold'}`}>
                          {notif.type === 'assignment' ? 'New Task Assigned' : 'Notification'}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-1">{notif.message}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
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
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-muted/50 border-t border-border text-center">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="text-xs font-bold text-spa-teal hover:text-spa-teal-dark transition flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Refresh Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
