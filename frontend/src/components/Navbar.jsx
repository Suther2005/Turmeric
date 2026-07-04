import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Menu, Sun, Moon, ChevronDown, User, LogOut, Settings } from 'lucide-react';

/**
 * Top navigation bar for the authenticated dashboard layout.
 * Contains mobile menu toggle, search, notifications, and user menu.
 */
export default function Navbar({ onMobileMenuOpen, pageTitle = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const mockNotifications = [
    { id: 1, text: 'Disease detected: Leaf Blotch (87% confidence)', time: '2m ago', type: 'alert' },
    { id: 2, text: 'Soil analysis complete — Good fertility score', time: '1h ago', type: 'success' },
    { id: 3, text: 'New report generated and ready for download', time: '3h ago', type: 'info' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-surface-900/80 backdrop-blur-md border-b border-surface-800 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-lg hover:bg-surface-800 text-surface-400"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h2 className="font-display font-semibold text-surface-100 text-lg hidden sm:block">{pageTitle}</h2>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 top-12 w-80 card z-20 p-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-surface-800 flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-surface-100">Notifications</h3>
                  <span className="badge badge-success text-[10px]">{mockNotifications.length} new</span>
                </div>
                <div className="divide-y divide-surface-800">
                  {mockNotifications.map(n => (
                    <div key={n.id} className="px-4 py-3 hover:bg-surface-800/50 transition-colors cursor-pointer">
                      <p className="text-xs text-surface-200 leading-relaxed">{n.text}</p>
                      <p className="text-[11px] text-surface-500 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-surface-800">
                  <button className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                    Mark all as read
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-surface-200 hidden sm:block max-w-[100px] truncate">
              {user?.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-12 w-52 card z-20 p-1.5">
                <div className="px-3 py-2 border-b border-surface-800 mb-1">
                  <p className="text-sm font-semibold text-surface-100 truncate">{user?.name}</p>
                  <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                </div>
                <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-800 text-sm text-surface-300 hover:text-surface-100 transition-colors">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-900/30 text-sm text-red-400 hover:text-red-300 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
