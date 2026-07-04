import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import StatCard from '../components/StatCard';
import HealthScoreGauge from '../components/HealthScoreGauge';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';
import {
  ScanLine, Leaf, AlertTriangle, Activity, Upload,
  ChevronRight, Bell, AlertCircle, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_STATS = {
  total_scans: 28,
  healthy_plants: 19,
  diseased_plants: 9,
  crop_health_score: 72,
  soil_health_score: 65,
  disease_distribution: {
    'Healthy': 19, 'Leaf Blotch': 4, 'Rhizome Rot': 2,
    'Yellow Leaf Disease': 2, 'Fusarium Wilt': 1,
  },
  monthly_scans: {
    labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    data:   [3, 5, 4, 8, 6, 28],
  },
};

const MOCK_RECENT = [
  { id: 1, plant_part: 'leaf',       disease_name: 'Leaf Blotch',         confidence: 0.89, severity: 'moderate', created_at: '2026-07-03' },
  { id: 2, plant_part: 'whole_plant', disease_name: 'Healthy',             confidence: 0.94, severity: 'none',     created_at: '2026-07-02' },
  { id: 3, plant_part: 'rhizome',    disease_name: 'Rhizome Rot',          confidence: 0.76, severity: 'mild',     created_at: '2026-07-01' },
  { id: 4, plant_part: 'leaf',       disease_name: 'Yellow Leaf Disease',  confidence: 0.82, severity: 'moderate', created_at: '2026-06-30' },
  { id: 5, plant_part: 'stem',       disease_name: 'Healthy',              confidence: 0.91, severity: 'none',     created_at: '2026-06-29' },
];

const MOCK_ALERTS = [
  { id: 1, type: 'warning', message: 'Leaf Blotch detected 3 times this week — high recurrence risk', time: '2h ago' },
  { id: 2, type: 'info',    message: 'Soil moisture is low for your last recorded field — consider irrigation', time: '1d ago' },
];

// ── Chart Options ──────────────────────────────────────────────────────────
const BAR_OPTIONS = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 },
  },
  scales: {
    x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: '#1e293b' } },
  },
};

const DONUT_OPTIONS = {
  responsive: true,
  cutout: '68%',
  plugins: {
    legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, padding: 12 } },
    tooltip: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 },
  },
  scales: {},
};

const DISEASE_COLORS = ['#22c55e', '#ef4444', '#f97316', '#eab308', '#a855f7', '#3b82f6'];

function severityBadge(severity) {
  const map = {
    none:     'badge-success',
    mild:     'badge-warning',
    moderate: 'bg-orange-900/60 text-orange-300 border border-orange-800',
    severe:   'badge-danger',
  };
  return `badge ${map[severity] || 'badge-neutral'}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(MOCK_STATS);
  const [recent, setRecent]   = useState(MOCK_RECENT);
  const [alerts, setAlerts]   = useState(MOCK_ALERTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [s, r, a] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecent(),
          dashboardService.getAlerts(),
        ]);
        setStats(s);
        setRecent(r.predictions || r);
        setAlerts(a.alerts || a);
      } catch {
        // Use mock data silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr  = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const barData = {
    labels: stats.monthly_scans?.labels || [],
    datasets: [{
      label: 'Scans',
      data: stats.monthly_scans?.data || [],
      backgroundColor: '#22c55e',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const diseaseLabels = Object.keys(stats.disease_distribution || {});
  const diseaseValues = Object.values(stats.disease_distribution || {});

  const donutData = {
    labels: diseaseLabels,
    datasets: [{ data: diseaseValues, backgroundColor: DISEASE_COLORS, borderWidth: 0 }],
  };

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="page-container space-y-6">

        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-surface-50">
              {greeting}, {user?.name?.split(' ')[0] || 'Farmer'} 👋
            </h1>
            <p className="text-surface-500 text-sm mt-0.5">{dateStr}</p>
          </div>
          <Link to="/upload" className="btn-primary flex-shrink-0">
            <Upload className="w-4 h-4" /> New Analysis
          </Link>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={ScanLine}     label="Total Scans"       value={stats.total_scans}    color="blue"    trend="up" trendValue="+12%" loading={loading} />
          <StatCard icon={Leaf}         label="Healthy Plants"    value={stats.healthy_plants}  color="primary" trend="up" trendValue="+5%"  loading={loading} />
          <StatCard icon={AlertTriangle} label="Diseased Plants"  value={stats.diseased_plants} color="red"     trend="down" trendValue="-3%"  loading={loading} />
          <StatCard icon={Activity}     label="Crop Health Score" value={`${stats.crop_health_score}%`} color="turmeric" loading={loading} />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
              Monthly Scan Activity
            </h3>
            <Bar data={barData} options={BAR_OPTIONS} height={180} />
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-turmeric-400" />
              Disease Distribution
            </h3>
            <div className="h-44">
              <Doughnut data={donutData} options={DONUT_OPTIONS} />
            </div>
          </div>
        </div>

        {/* ── Health Score Gauges ── */}
        <div className="card">
          <h3 className="text-sm font-semibold text-surface-200 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
            Health Scores
          </h3>
          <div className="flex flex-wrap gap-12 justify-center sm:justify-start">
            <HealthScoreGauge score={stats.crop_health_score} label="Crop Health Score" loading={loading} />
            <HealthScoreGauge score={stats.soil_health_score} label="Soil Health Score" loading={loading} />
          </div>
        </div>

        {/* ── Alerts ── */}
        {alerts.length > 0 && (
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" />
              Active Alerts
              <span className="badge badge-warning text-[10px]">{alerts.length}</span>
            </h3>
            {alerts.map(a => (
              <div key={a.id} className={`alert ${a.type === 'warning' ? 'alert-warning' : 'alert-info'}`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{a.message}</p>
                  {a.time && <p className="text-xs opacity-60 mt-0.5">{a.time}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Recent Detections ── */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-surface-800">
            <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
              Recent Detections
            </h3>
            <Link to="/history" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plant Part</th>
                  <th>Disease Detected</th>
                  <th>Confidence</th>
                  <th>Severity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r.id}>
                    <td className="text-xs text-surface-400">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className="badge badge-neutral text-[10px] capitalize">{r.plant_part?.replace('_', ' ')}</span>
                    </td>
                    <td className="font-medium text-surface-100">{r.disease_name || 'Unknown'}</td>
                    <td className="text-sm font-semibold text-surface-200">{Math.round((r.confidence || 0) * 100)}%</td>
                    <td>
                      <span className={severityBadge(r.severity) + ' text-[10px] capitalize'}>
                        {r.severity || 'none'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/result/${r.id}`}
                        className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center gap-3">
                        <Leaf className="w-10 h-10 text-surface-700" />
                        <p className="text-surface-500 text-sm">No detections yet.</p>
                        <Link to="/upload" className="btn-outline btn-sm">Upload first image</Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
