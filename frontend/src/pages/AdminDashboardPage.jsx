import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import {
  Users, Activity, ScanLine, FileText, TrendingUp,
  Download, Trash2, Shield, ToggleLeft, ToggleRight,
  Search, ChevronLeft, ChevronRight, BarChart2
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Mock data for display
const MOCK_STATS = {
  total_users: 142,
  total_predictions: 1847,
  total_reports: 289,
  active_users: 118,
  disease_distribution: {
    'Healthy': 680, 'Leaf Blotch': 412, 'Rhizome Rot': 298,
    'Yellow Leaf Disease': 224, 'Fusarium Wilt': 148, 'Soft Rot': 85
  },
  weekly_scans: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], data: [42,58,39,71,65,48,52] }
};

const MOCK_USERS = [
  { id: 1, name: 'Arjun Krishnamurthy', email: 'arjun.k@farm.in', role: 'user', is_active: true, created_at: '2026-01-15', last_login: '2026-07-03' },
  { id: 2, name: 'Meena Patel', email: 'meena.p@agri.in', role: 'user', is_active: true, created_at: '2026-02-01', last_login: '2026-07-02' },
  { id: 3, name: 'Ravi Shankar', email: 'ravi.s@turmfarm.in', role: 'user', is_active: false, created_at: '2026-03-10', last_login: '2026-06-20' },
  { id: 4, name: 'Lakshmi Devi', email: 'lakshmi.d@crop.in', role: 'user', is_active: true, created_at: '2026-04-05', last_login: '2026-07-01' },
  { id: 5, name: 'Suresh Reddy', email: 'suresh.r@farm.in', role: 'user', is_active: true, created_at: '2026-05-12', last_login: '2026-06-28' },
];

const chartOptions = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e293b' } }
  }
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]         = useState(MOCK_STATS);
  const [users, setUsers]         = useState(MOCK_USERS);
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData.users || usersData);
    } catch {
      // Use mock data
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminService.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setDeletingId(userId);
    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const diseaseLabels = Object.keys(stats.disease_distribution || {});
  const diseaseValues = Object.values(stats.disease_distribution || {});

  const weeklyData = {
    labels: stats.weekly_scans?.labels || [],
    datasets: [{
      label: 'Daily Scans',
      data: stats.weekly_scans?.data || [],
      backgroundColor: '#22c55e',
      borderRadius: 6,
    }]
  };

  const diseaseData = {
    labels: diseaseLabels,
    datasets: [{
      data: diseaseValues,
      backgroundColor: ['#22c55e', '#ef4444', '#f97316', '#eab308', '#a855f7', '#3b82f6'],
      borderWidth: 0,
    }]
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users',    label: 'Users',    icon: Users },
  ];

  const AdminStatCard = ({ icon: Icon, label, value, color = 'primary', sub }) => {
    const colors = {
      primary: 'border-primary-500 bg-primary-500/10 text-primary-400',
      blue:    'border-blue-500 bg-blue-500/10 text-blue-400',
      orange:  'border-orange-500 bg-orange-500/10 text-orange-400',
      purple:  'border-purple-500 bg-purple-500/10 text-purple-400',
    };
    const [border, bg, text] = colors[color].split(' ');
    return (
      <div className={`card border-l-4 ${border} flex items-center gap-4`}>
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${text}`} />
        </div>
        <div>
          <p className="text-xs text-surface-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-display font-bold text-surface-50">{value?.toLocaleString()}</p>
          {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    );
  };

  return (
    <AppLayout pageTitle="Admin Dashboard">
      <div className="page-container space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary-400" />
              Admin Dashboard
            </h1>
            <p className="section-subtitle">System overview and user management</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => adminService.exportUsers()} className="btn-secondary btn-sm gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export Users
            </button>
            <button onClick={() => adminService.exportPredictions()} className="btn-secondary btn-sm gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export Predictions
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-900 border border-surface-800 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminStatCard icon={Users}    label="Total Users"       value={stats.total_users}       color="primary" sub={`${stats.active_users} active`} />
              <AdminStatCard icon={ScanLine} label="Total Predictions" value={stats.total_predictions} color="blue" />
              <AdminStatCard icon={FileText} label="Reports Generated" value={stats.total_reports}      color="orange" />
              <AdminStatCard icon={Activity} label="Active Users"      value={stats.active_users}       color="purple" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-sm font-semibold text-surface-200 mb-4">Weekly Scan Activity</h3>
                <Bar data={weeklyData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} height={200} />
              </div>
              <div className="card">
                <h3 className="text-sm font-semibold text-surface-200 mb-4">Disease Distribution</h3>
                <div className="h-48 flex items-center justify-center">
                  <Doughnut data={diseaseData} options={{
                    ...chartOptions,
                    cutout: '65%',
                    scales: {},
                    plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 12 } } }
                  }} />
                </div>
              </div>
            </div>

            {/* Disease stats table */}
            <div className="card">
              <h3 className="text-sm font-semibold text-surface-200 mb-4">Disease Detection Summary</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Disease</th>
                    <th>Total Cases</th>
                    <th>Percentage</th>
                    <th>Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {diseaseLabels.map((disease, i) => {
                    const count = diseaseValues[i];
                    const total = diseaseValues.reduce((a, b) => a + b, 0);
                    const pct = ((count / total) * 100).toFixed(1);
                    const colors = ['#22c55e','#ef4444','#f97316','#eab308','#a855f7','#3b82f6'];
                    return (
                      <tr key={disease}>
                        <td className="font-medium text-surface-100">{disease}</td>
                        <td className="text-surface-300">{count}</td>
                        <td className="text-surface-300">{pct}%</td>
                        <td>
                          <div className="w-32 h-1.5 bg-surface-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[i] }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input pl-9"
                  id="admin-user-search"
                />
              </div>
              <span className="text-sm text-surface-500">{filteredUsers.length} users</span>
            </div>

            {/* Users table */}
            <div className="card p-0 overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Member Since</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-surface-100 text-sm">{u.name}</p>
                            <p className="text-xs text-surface-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-neutral'} text-[10px]`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'} text-[10px]`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-surface-400 text-xs">{u.created_at}</td>
                      <td className="text-surface-400 text-xs">{u.last_login || '—'}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(u.id, u.is_active)}
                            className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'text-yellow-400 hover:bg-yellow-900/30' : 'text-primary-400 hover:bg-primary-900/30'}`}
                            title={u.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {u.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deletingId === u.id}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-surface-500">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
