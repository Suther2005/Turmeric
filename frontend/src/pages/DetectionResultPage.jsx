import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import HeatmapViewer from '../components/HeatmapViewer';
import ColorAnalysisChart from '../components/ColorAnalysisChart';
import { DiseaseBadge, SeverityIndicator, ConfidenceBar } from '../components/DiseaseBadge';
import { detectionService } from '../services/detectionService';
import { reportService } from '../services/reportService';
import {
  CheckCircle, AlertTriangle, Leaf, Upload, FileText,
  Bug, Target, Layers, ChevronRight, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_RESULT = {
  id: 1,
  plant_part: 'leaf',
  disease_name: 'Leaf Blotch',
  confidence: 0.89,
  severity: 'moderate',
  affected_part: 'Leaf margin and midrib area',
  image_path: null,
  heatmap_path: null,
  color_analysis: {
    green_pct: 42.3, yellow_pct: 31.7, brown_pct: 18.5, other_pct: 7.5,
    condition: 'leaf_yellowing', health_index: 52,
  },
  bounding_boxes: [{ x: 50, y: 80, w: 120, h: 90, label: 'Leaf Blotch', confidence: 0.89 }],
  top_predictions: [
    { disease: 'Leaf Blotch',        confidence: 0.89 },
    { disease: 'Yellow Leaf Disease', confidence: 0.07 },
    { disease: 'Healthy',             confidence: 0.04 },
  ],
  pests_detected: [{ name: 'Aphids', confidence: 0.73 }],
  gradcam_explanation: 'The model focused primarily on the dark brown spots along the leaf margins and mid-vein, which are characteristic lesions of Leaf Blotch caused by Taphrina maculans.',
  recommendations: {
    prevention_tips: [
      'Remove and destroy infected leaves immediately to prevent spread',
      'Apply Mancozeb 75 WP @ 2 g/L every 10–14 days as protective spray',
      'Improve field drainage to reduce canopy humidity below 70%',
    ],
    pesticide: 'Mancozeb 75 WP @ 2 g/L or Chlorothalonil 75 WP @ 2 g/L as foliar spray',
    treatment:  'Apply systemic fungicide Propiconazole 25 EC @ 1 ml/L for curative action',
  },
  created_at: new Date().toISOString(),
};

export default function DetectionResultPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const data = await detectionService.getResult(id);
        setResult(data?.prediction || data);
      } catch {
        setResult(MOCK_RESULT); // fallback to demo
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const predictionId = result?.id || result?.prediction?.id;
      const soilAnalysisId = result?.soil_analysis_id || null;
      const report = await reportService.generateReport(predictionId, soilAnalysisId);
      toast.success('Report generated! Redirecting...');
      navigate('/reports');
    } catch {
      toast.error('Could not generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Detection Result">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card space-y-4">
                <div className="h-4 skeleton w-32 rounded" />
                <div className="h-48 skeleton rounded-xl" />
                <div className="h-4 skeleton w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const r = result || MOCK_RESULT;
  const isHealthy = !r.disease_name || r.disease_name === 'Healthy';

  return (
    <AppLayout pageTitle="Detection Result">
      <div className="page-container space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="section-title">Analysis Result</h1>
            <p className="section-subtitle">
              {new Date(r.created_at).toLocaleString('en-IN')} ·
              <span className="ml-1 capitalize">{(r.plant_part || '').replace('_', ' ')} scan</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/upload" className="btn-secondary btn-sm">
              <Upload className="w-4 h-4" /> New Analysis
            </Link>
            <button onClick={handleGenerateReport} disabled={generating} className="btn-primary btn-sm">
              <FileText className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Disease Alert Banner */}
        {!isHealthy && (
          <div className="alert alert-error animate-slide-up">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Disease Detected: {r.disease_name}</p>
              <p className="text-xs mt-0.5 opacity-80">
                {Math.round((r.confidence || 0) * 100)}% confidence · Severity: {r.severity}
              </p>
            </div>
          </div>
        )}
        {isHealthy && (
          <div className="alert alert-success animate-slide-up">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Plant Appears Healthy</p>
              <p className="text-xs mt-0.5 opacity-80">No significant disease detected. Continue regular monitoring.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left Column ── */}
          <div className="space-y-6">

            {/* Heatmap Viewer */}
            <div className="card">
              <HeatmapViewer
                originalPath={r.image_path}
                heatmapPath={r.heatmap_path}
                explanation={r.gradcam_explanation}
              />
            </div>

            {/* Color Analysis */}
            <div className="card">
              <ColorAnalysisChart data={r.color_analysis} />
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-6">

            {/* Disease Info Card */}
            <div className="card space-y-5">
              <h2 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                Disease Information
              </h2>

              {/* Plant Part */}
              <div className="flex items-center gap-3">
                <span className="badge badge-neutral capitalize">
                  <Leaf className="w-3 h-3" />
                  {(r.plant_part || '').replace('_', ' ')}
                </span>
                <DiseaseBadge disease={r.disease_name} />
              </div>

              {/* Confidence */}
              <ConfidenceBar confidence={r.confidence || 0} />

              {/* Severity */}
              <SeverityIndicator severity={r.severity || 'none'} />

              {/* Affected Part */}
              {r.affected_part && (
                <div className="flex items-start gap-2 text-sm">
                  <Target className="w-4 h-4 text-surface-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-surface-500">Affected region: </span>
                    <span className="text-surface-200">{r.affected_part}</span>
                  </div>
                </div>
              )}

              {/* Bounding boxes count */}
              {r.bounding_boxes?.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-surface-400 flex-shrink-0" />
                  <span className="text-surface-500">{r.bounding_boxes.length} disease region{r.bounding_boxes.length > 1 ? 's' : ''} detected</span>
                </div>
              )}
            </div>

            {/* Top Predictions */}
            {r.top_predictions?.length > 0 && (
              <div className="card space-y-3">
                <h2 className="text-sm font-semibold text-surface-200">Top AI Predictions</h2>
                {r.top_predictions.map((p, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-surface-300 font-medium">{p.disease}</span>
                      <span className="text-surface-400">{Math.round((p.confidence || 0) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.round((p.confidence || 0) * 100)}%`,
                          backgroundColor: i === 0 ? '#22c55e' : '#475569',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pests Detected */}
            {r.pests_detected?.length > 0 && (
              <div className="card">
                <h2 className="text-sm font-semibold text-surface-200 mb-3 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-orange-400" /> Pests Detected
                </h2>
                {r.pests_detected.map((pest, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-surface-200">{pest.name}</span>
                    <span className="badge badge-warning text-[10px]">
                      {Math.round((pest.confidence || 0) * 100)}% conf.
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {r.recommendations && (
              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-surface-200">Treatment & Prevention</h2>

                {r.recommendations.prevention_tips?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                    <p className="text-surface-300 leading-relaxed">{tip}</p>
                  </div>
                ))}

                {r.recommendations.pesticide && (
                  <div className="mt-2 p-3 bg-orange-900/20 border border-orange-700/40 rounded-xl">
                    <p className="text-xs font-semibold text-orange-300 mb-1">Recommended Pesticide</p>
                    <p className="text-xs text-surface-300">{r.recommendations.pesticide}</p>
                  </div>
                )}
                {r.recommendations.treatment && (
                  <div className="p-3 bg-blue-900/20 border border-blue-700/40 rounded-xl">
                    <p className="text-xs font-semibold text-blue-300 mb-1">Treatment Protocol</p>
                    <p className="text-xs text-surface-300">{r.recommendations.treatment}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
