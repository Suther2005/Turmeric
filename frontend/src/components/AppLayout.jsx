import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * AppLayout — authenticated app shell with collapsible sidebar + topbar.
 * Wraps all dashboard pages.
 */
export default function AppLayout({ children, pageTitle }) {
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMobileMenuOpen={() => setMobileOpen(true)} pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto bg-surface-950">
          {children}
        </main>
      </div>
    </div>
  );
}
