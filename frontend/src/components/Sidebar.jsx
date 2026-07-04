import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Upload, FlaskConical, FileText, History,
  User, Settings, LogOut, Leaf, ChevronLeft, ChevronRight,
  ShieldCheck, Bell, BarChart3, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',     href: '/dashboard' },
  { icon: Upload,          label: 'Detect Disease', href: '/upload' },
  { icon: FlaskConical,    label: 'Soil Analysis',  href: '/soil-analysis' },
  { icon: FileText,        label: 'Reports',        href: '/reports' },
  { icon: History,         label: 'History',        href: '/history' },
  { icon: BarChart3,       label: 'About',          href: '/about' },
];

const ADMIN_ITEMS = [
  { icon: ShieldCheck, label: 'Admin Panel', href: '/admin' },
];

/**
 * Sidebar navigation for the authenticated app shell.
 * Collapsible on desktop, slide-out drawer on mobile.
 */
export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLink = ({ item }) => {
    const active = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        onClick={onMobileClose}
        className={`nav-link ${active ? 'active' : ''}`}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="nav-label truncate">{item.label}</span>}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-surface-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-glow">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-display font-bold text-white text-base leading-tight">TurmeriCare</h1>
            <p className="text-[10px] text-primary-400 font-medium tracking-wide uppercase">AI Crop Monitor</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map(item => <NavLink key={item.href} item={item} />)}

        {isAdmin && (
          <>
            <div className={`my-3 border-t border-surface-800 ${collapsed ? '' : 'mx-1'}`} />
            {!collapsed && <p className="px-4 text-[10px] font-semibold uppercase tracking-widest text-surface-600 mb-1">Admin</p>}
            {ADMIN_ITEMS.map(item => <NavLink key={item.href} item={item} />)}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-surface-800 space-y-1">
        <Link to="/profile" onClick={onMobileClose}
          className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
          title={collapsed ? 'Profile' : undefined}>
          <div className="w-5 h-5 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && <span className="nav-label truncate">{user?.name || 'Profile'}</span>}
        </Link>
        <button onClick={handleLogout}
          className={`nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-sidebar-gradient border-r border-surface-800
        transition-all duration-300 ease-in-out flex-shrink-0 relative
        ${collapsed ? 'w-[4.5rem]' : 'w-60'}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-700 border border-surface-600
            flex items-center justify-center text-surface-400 hover:text-surface-100
            hover:bg-surface-600 transition-all shadow-md z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-64 bg-sidebar-gradient border-r border-surface-800 flex flex-col z-10 animate-slide-in">
            <button onClick={onMobileClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-700 text-surface-400">
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
