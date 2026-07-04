import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { detectionService } from '../services/detectionService';
import { Search, Filter, Eye, Download, Calendar, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';

const MOCK_HISTORY = [
  { id: 1, plant_part: 'leaf',       disease_name: 'Leaf Blotch',          confidence: 0.89, severity: 'moderate', created_at: '2026-07-03T10:30:00' },
  { id: 2, plant_part: 'whole_plant', disease_name: 'Healthy',              confidence: 0.94, severity: 'none',     created_at: '2026-07-02T09:15:00' },
  { id: 3, plant_part: 'rhizome',    disease_name: 'Rhizome Rot',           confidence: 0.76, severity: 'severe',   created_at: '2026-07-01T14:00:00' },
  { id: 4, plant_part: 'leaf',       disease_name: 'Yellow Leaf Disease',   confidence: 0.82, severity: 'moderate', created_at: '2026-06-30T11:00:00' },
  { id: 5, plant_part: 'stem',       disease_name: 'Healthy',               confidence: 0.91, severity: 'none',     created_at: '2026-06-29T16:20:00' },
  { id: 6, plant_part: 'leaf',       disease_name: 'Fusarium Wilt',         confidence: 0.68, severity: 'mild',     created_at: '2026-06-28T08:45:00' },
  { id: 7, plant_part: 'rhizome',    disease_name: 'Soft Rot',              confidence: 0.83, severity: 'severe',   created_at: '2026-06-27T13:30:00' },
  { id: 8, plant_part: 'leaf',       disease_name: 'Leaf Blotch',           confidence: 0.77, severity: 'mild',     created_at: '2026-06-26T10:00:00' },
  { id: 9, plant_part: 'whole_plant', disease_name: 'Healthy',              confidence: 0.95, severity: 'none',     created_at: '2026-06-25T09:00:00' },
  { id: 10, plant_part: 'leaf',      disease_name: 'Taro Leaf Blight',      confidence: 0.71, severity: 'mild',     created_at: '2026-06-24T15:00:00' },
];

const PER_PAGE = 5;

const SEVERITY_CLASSES = {
  none:     'badge-success',
  mild:     'badge-warning',
  moderate: 'bg-orange-900/50 text-orange-300 border border-orange-800',
  severe:   'badge-danger',
};

export default function HistoryPage() {
  const [history, setHistory]     = useState(MOCK_HISTORY);
  const [search, setSearch]       = useState('');
  const [partFilter, setPartFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await detectionService.getHistory();
        setHistory(data.predictions || data);
      } catch {
        // use mock
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return history.filter(item => {
      const matchSearch   = !search || item.disease_name?.toLowerCase().includes(search.toLowerCase());
      const matchPart     = partFilter === 'all' || item.plant_part === partFilter;
      const matchSeverity = severityFilter === 'all' || item.severity === severityFilter;
      return matchSearch && matchPart && matchSeverity;
    });
  }, [history, search, partFilter, severityFilter]);

  const totalPages  = Math.ceil(filtered.length / PER_PAGE);
  const paginated   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const exportCSV = () => {
    const rows = [
      ['Date', 'Plant Part', 'Disease', 'Confidence', 'Severity'],
      ...filtered.map(h => [
        new Date(h.created_at).toLocaleDateString('en-IN'),
        h.plant_part, h.disease_name,
        `${Math.round((h.confidence || 0) * 100)}%`,
        h.severity,
      ])
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'detection_history.csv' });
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <AppLayout pageTitle="History">
      <div className="page-container space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="section-title">Detection History</h1>
            <p className="section-subtitle">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <button onClick={exportCSV} className="btn-secondary btn-sm gap-1.5">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input type="text" placeholder="Search by disease..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input pl-9 h-9 text-sm" id="history-search" />
          </div>

          {/* Plant Part Filter */}
          <select value={partFilter} onChange={e => { setPartFilter(e.target.value); setPage(1); }}
            className="input h-9 text-sm w-auto" id="history-part-filter">
            <option value="all">All Parts</option>
            <option value="leaf">Leaf</option>
            <option value="stem">Stem</option>
            <option value="rhizome">Rhizome</option>
            <option value="whole_plant">Whole Plant</option>
          </select>

          {/* Severity Filter */}
          <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}
            className="input h-9 text-sm w-auto" id="history-severity-filter">
            <option value="all">All Severity</option>
            <option value="none">Healthy</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Plant Part</th>
                  <th>Disease Detected</th>
                  <th>Confidence</th>
                  <th>Severity</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((__, j) => (
                        <td key={j}><div className="h-3 skeleton rounded w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Leaf className="w-10 h-10 text-surface-700 mx-auto mb-2" />
                      <p className="text-surface-500">No records match your filters.</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-surface-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.created_at).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral text-[10px] capitalize">
                          {(item.plant_part || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="font-medium text-surface-100">{item.disease_name}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${Math.round((item.confidence || 0) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-surface-300">{Math.round((item.confidence || 0) * 100)}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge text-[10px] capitalize ${SEVERITY_CLASSES[item.severity] || 'badge-neutral'}`}>
                          {item.severity || 'none'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/result/${item.id}`}
                          className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-surface-800">
              <p className="text-xs text-surface-500">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-200 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-surface-400">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-surface-700 text-surface-400 hover:text-surface-200 disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
