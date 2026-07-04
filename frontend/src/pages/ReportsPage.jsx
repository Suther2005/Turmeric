import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { reportService } from '../services/reportService';
import { FileText, Download, Trash2, Calendar, Activity, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MOCK_REPORTS = [
  { id: 1, disease_name: 'Leaf Blotch',     crop_health_score: 62,  severity: 'moderate', report_date: '2026-07-03T10:30:00', pdf_path: '/uploads/reports/report_1.pdf' },
  { id: 2, disease_name: 'Healthy',          crop_health_score: 87,  severity: 'none',     report_date: '2026-07-02T09:15:00', pdf_path: '/uploads/reports/report_2.pdf' },
  { id: 3, disease_name: 'Rhizome Rot',      crop_health_score: 41,  severity: 'severe',   report_date: '2026-07-01T14:00:00', pdf_path: '/uploads/reports/report_3.pdf' },
  { id: 4, disease_name: 'Yellow Leaf Disease', crop_health_score: 55, severity: 'moderate', report_date: '2026-06-28T11:00:00', pdf_path: null },
];

function ScoreBadge({ score }) {
  const color = score >= 75 ? 'text-primary-400 bg-primary-900/50 border-primary-700'
    : score >= 50 ? 'text-yellow-400 bg-yellow-900/30 border-yellow-700'
    : 'text-red-400 bg-red-900/30 border-red-700';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${color}`}>
      <Activity className="w-3 h-3" />
      {Math.round(score)}%
    </span>
  );
}

export default function ReportsPage() {
  const [reports, setReports]   = useState(MOCK_REPORTS);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await reportService.getReports();
        setReports(data.reports || data);
      } catch {
        // use mock
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDownload = async (report) => {
    if (!report.pdf_path) {
      toast.error('PDF not available for this report. Please regenerate it.');
      return;
    }
    try {
      await reportService.downloadReport(report.id);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await reportService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      toast.success('Report deleted');
    } catch {
      toast.error('Failed to delete report');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AppLayout pageTitle="Reports">
      <div className="page-container space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Crop Health Reports</h1>
            <p className="section-subtitle">Download comprehensive PDF reports for your crop analysis</p>
          </div>
          <Link to="/upload" className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> New Report
          </Link>
        </div>

        {/* Report Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card space-y-4">
                <div className="h-4 skeleton w-28 rounded" />
                <div className="h-3 skeleton w-36 rounded" />
                <div className="h-8 skeleton rounded-xl" />
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="card text-center py-20 border-dashed">
            <FileText className="w-12 h-12 text-surface-700 mx-auto mb-3" />
            <p className="text-surface-400">No reports yet.</p>
            <Link to="/upload" className="btn-primary btn-sm mt-4 inline-flex">Generate First Report</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map(r => {
              const date = new Date(r.report_date);
              const severityClass = !r.severity || r.severity === 'none' ? 'badge-success'
                : r.severity === 'mild' ? 'badge-warning'
                : r.severity === 'moderate' ? 'bg-orange-900/50 text-orange-300 border border-orange-800'
                : 'badge-danger';

              return (
                <div key={r.id} className="card card-hover group space-y-4">
                  {/* Report Icon + Date */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary-900/40 border border-primary-700/50 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-400" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-surface-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Disease Name */}
                  <div>
                    <p className="font-semibold text-surface-100">{r.disease_name || 'Crop Health Report'}</p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <ScoreBadge score={r.crop_health_score || 50} />
                    <span className={`badge ${severityClass} text-[10px] capitalize`}>{r.severity || 'none'}</span>
                    {!r.pdf_path && <span className="badge badge-neutral text-[10px]">No PDF</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-surface-800">
                    <button
                      onClick={() => handleDownload(r)}
                      className="flex-1 btn-outline btn-sm gap-1.5 text-xs"
                      disabled={!r.pdf_path}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      className="p-2 rounded-xl border border-surface-700 text-red-400 hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
