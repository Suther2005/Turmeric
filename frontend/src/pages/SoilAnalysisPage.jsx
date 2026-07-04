import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { soilService } from '../services/soilService';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
} from 'chart.js';
import {
  FlaskConical, Leaf, TrendingUp, Droplets, Thermometer,
  CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const PARAMS = [
  { key: 'ph',             label: 'Soil pH',         min: 0,    max: 14,   step: 0.1, unit: '',      ideal: '5.5 – 7.0',  icon: FlaskConical },
  { key: 'nitrogen',       label: 'Nitrogen (N)',     min: 0,    max: 500,  step: 1,   unit: 'mg/kg', ideal: '150 – 280',  icon: Leaf },
  { key: 'phosphorus',     label: 'Phosphorus (P)',   min: 0,    max: 200,  step: 0.5, unit: 'mg/kg', ideal: '20 – 60',    icon: Leaf },
  { key: 'potassium',      label: 'Potassium (K)',    min: 0,    max: 600,  step: 1,   unit: 'mg/kg', ideal: '150 – 300',  icon: Leaf },
  { key: 'moisture',       label: 'Moisture',         min: 0,    max: 100,  step: 1,   unit: '%',     ideal: '60 – 80%',   icon: Droplets },
  { key: 'organic_carbon', label: 'Organic Carbon',   min: 0,    max: 10,   step: 0.1, unit: '%',     ideal: '1.5 – 3.5%', icon: Leaf },
  { key: 'temperature',    label: 'Temperature',      min: 0,    max: 50,   step: 0.5, unit: '°C',    ideal: '25 – 35°C',  icon: Thermometer },
  { key: 'humidity',       label: 'Air Humidity',     min: 0,    max: 100,  step: 1,   unit: '%',     ideal: '70 – 90%',   icon: Droplets },
];

const DEFAULT_VALUES = {
  ph: 6.5, nitrogen: 200, phosphorus: 40, potassium: 200,
  moisture: 70, organic_carbon: 2.0, temperature: 28, humidity: 75,
};

const HEALTH_COLORS = {
  excellent: { bg: 'bg-primary-900/40 border-primary-700', text: 'text-primary-300', badge: 'badge-success' },
  good:      { bg: 'bg-primary-900/20 border-primary-800', text: 'text-primary-400', badge: 'badge-success' },
  fair:      { bg: 'bg-yellow-900/20 border-yellow-800',   text: 'text-yellow-400',  badge: 'badge-warning' },
  poor:      { bg: 'bg-red-900/20 border-red-800',         text: 'text-red-400',     badge: 'badge-danger'  },
};

function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-surface-700 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-800 hover:bg-surface-750 text-left">
        <span className="text-sm font-semibold text-surface-200">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-surface-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
      </button>
      {open && <div className="p-4 bg-surface-900/50">{children}</div>}
    </div>
  );
}

export default function SoilAnalysisPage() {
  const [values, setValues]   = useState(DEFAULT_VALUES);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, val) => setValues(prev => ({ ...prev, [key]: parseFloat(val) }));

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const data = await soilService.analyze(values);
      setResult(data);
      toast.success('Soil analysis complete! 🌱');
    } catch {
      // Mock result for demo
      setResult({
        soil_health:     'good',
        fertility_score: 68.5,
        params:          values,
        recommendations: {
          fertilizer:       'Nitrogen levels adequate. Apply Single Super Phosphate (SSP) @ 375 kg/ha for phosphorus correction.',
          organic_manure:   'Apply 15 tonnes/ha of FYM or 5 tonnes/ha of vermicompost. Supplement with neem cake @ 500 kg/ha.',
          irrigation:       'Soil moisture is optimal. Maintain current irrigation schedule of every 7–10 days.',
          soil_improvement: 'pH (6.5) is within optimal range for turmeric (5.5–7.0). Continue current soil management.',
          pesticide:        'Low risk. Apply Trichoderma harzianum @ 2 kg/ha as preventive biocontrol.',
          tips: [
            'Test soil every 6 months for pH and NPK to track fertility changes.',
            'Apply rhizome treatment with Mancozeb 0.3% before planting.',
            'Maintain 45 × 30 cm plant spacing for optimal air circulation.',
            'Incorporate crop residues back into soil after harvest.',
          ],
        },
      });
      toast.success('Analysis complete (demo mode)');
    } finally {
      setLoading(false);
    }
  };

  const hc = result ? (HEALTH_COLORS[result.soil_health] || HEALTH_COLORS.fair) : null;

  const radarData = {
    labels: ['pH', 'Nitrogen', 'Phosphorus', 'Potassium', 'Moisture', 'Org.Carbon', 'Temp', 'Humidity'],
    datasets: [{
      label: 'Your Soil',
      data: [
        (values.ph / 14) * 100,
        (values.nitrogen / 500) * 100,
        (values.phosphorus / 200) * 100,
        (values.potassium / 600) * 100,
        values.moisture,
        (values.organic_carbon / 10) * 100,
        (values.temperature / 50) * 100,
        values.humidity,
      ],
      fill: true,
      backgroundColor: 'rgba(34,197,94,0.15)',
      borderColor:     '#22c55e',
      pointBackgroundColor: '#22c55e',
      borderWidth: 2,
      pointRadius: 3,
    }, {
      label: 'Ideal Range',
      data: [46, 43, 20, 38, 70, 25, 60, 80],
      fill: true,
      backgroundColor: 'rgba(234,179,8,0.08)',
      borderColor:     '#eab308',
      pointBackgroundColor: '#eab308',
      borderWidth: 1,
      pointRadius: 2,
      borderDash: [5, 5],
    }],
  };

  const radarOptions = {
    responsive: true,
    scales: {
      r: {
        min: 0, max: 100, beginAtZero: true,
        ticks: { color: '#64748b', font: { size: 9 }, backdropColor: 'transparent' },
        grid:  { color: '#1e293b' },
        pointLabels: { color: '#94a3b8', font: { size: 10 } },
        angleLines: { color: '#1e293b' },
      },
    },
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 } },
    },
  };

  return (
    <AppLayout pageTitle="Soil Analysis">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="section-title">Soil Health Analysis</h1>
          <p className="section-subtitle">Input your soil parameters to receive AI-powered fertility score and recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left: Input Form ── */}
          <div className="card space-y-5">
            <h2 className="text-sm font-semibold text-surface-200">Soil Parameters</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {PARAMS.map(({ key, label, min, max, step, unit, ideal }) => (
                <div key={key}>
                  <div className="flex justify-between mb-1.5">
                    <label className="input-label mb-0 text-xs" htmlFor={`soil-${key}`}>{label}</label>
                    <span className="text-xs font-semibold text-primary-400">
                      {values[key]}{unit}
                    </span>
                  </div>
                  <input
                    id={`soil-${key}`}
                    type="range"
                    min={min} max={max} step={step}
                    value={values[key]}
                    onChange={e => handleChange(key, e.target.value)}
                    className="w-full accent-primary-500 h-1.5"
                  />
                  <p className="text-[10px] text-surface-600 mt-0.5">Ideal for turmeric: {ideal}</p>
                </div>
              ))}
            </div>

            <button onClick={handleAnalyze} disabled={loading} id="soil-analyze-btn"
              className="btn-primary w-full btn-lg mt-4">
              {loading ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg> Analyzing...</>
              ) : (
                <><FlaskConical className="w-4 h-4" /> Analyze Soil Health</>
              )}
            </button>
          </div>

          {/* ── Right: Results Panel ── */}
          <div className="space-y-4">
            {result ? (
              <>
                {/* Soil Health Score Card */}
                <div className={`card border ${hc.bg} text-center`}>
                  <p className="text-xs text-surface-400 mb-1">Soil Health Status</p>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className={`badge ${hc.badge} text-xs uppercase font-bold`}>{result.soil_health}</span>
                  </div>
                  <p className={`font-display font-bold text-5xl ${hc.text}`}>
                    {Math.round(result.fertility_score)}
                    <span className="text-lg font-normal">/100</span>
                  </p>
                  <p className="text-xs text-surface-500 mt-1">Fertility Score</p>
                </div>

                {/* Radar Chart */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-surface-200 mb-4">Nutrient Profile Radar</h3>
                  <Radar data={radarData} options={radarOptions} />
                </div>

                {/* Recommendations Accordion */}
                <div className="space-y-2">
                  <AccordionSection title="🌾 Fertilizer Recommendation" defaultOpen>
                    <p className="text-sm text-surface-300 leading-relaxed">{result.recommendations?.fertilizer}</p>
                  </AccordionSection>
                  <AccordionSection title="🌿 Organic Manure">
                    <p className="text-sm text-surface-300 leading-relaxed">{result.recommendations?.organic_manure}</p>
                  </AccordionSection>
                  <AccordionSection title="💧 Irrigation">
                    <p className="text-sm text-surface-300 leading-relaxed">{result.recommendations?.irrigation}</p>
                  </AccordionSection>
                  <AccordionSection title="🧪 Soil Improvement">
                    <p className="text-sm text-surface-300 leading-relaxed">{result.recommendations?.soil_improvement}</p>
                  </AccordionSection>
                  <AccordionSection title="🛡️ Pesticide Advice">
                    <p className="text-sm text-surface-300 leading-relaxed">{result.recommendations?.pesticide}</p>
                  </AccordionSection>
                  {result.recommendations?.tips && (
                    <AccordionSection title="💡 Actionable Tips" defaultOpen>
                      <ul className="space-y-2">
                        {result.recommendations.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                            <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </AccordionSection>
                  )}
                </div>
              </>
            ) : (
              <div className="card flex flex-col items-center justify-center text-center py-20 border-dashed">
                <FlaskConical className="w-12 h-12 text-surface-700 mb-3" />
                <p className="text-surface-400 text-sm">Adjust the soil parameters and click</p>
                <p className="text-primary-400 font-semibold text-sm mt-0.5">"Analyze Soil Health"</p>
                <p className="text-xs text-surface-600 mt-2">Results will appear here with recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
