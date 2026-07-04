import { Link } from 'react-router-dom';
import {
  Leaf, Brain, FlaskConical, Eye, BarChart3, CheckCircle,
  Users, ArrowRight
} from 'lucide-react';

const TECH_STACK = [
  { layer: 'Frontend',  items: ['React 18', 'Vite', 'Tailwind CSS', 'Chart.js', 'React Router', 'Axios'] },
  { layer: 'Backend',   items: ['Python 3.10', 'Flask REST API', 'SQLAlchemy', 'JWT Auth', 'Flask-CORS'] },
  { layer: 'AI & ML',   items: ['YOLOv8 (Object Detection)', 'EfficientNet-B0 (Classification)', 'Grad-CAM (Explainability)', 'OpenCV HSV Analysis', 'Random Forest (Soil)'] },
  { layer: 'Database',  items: ['MySQL 8.0', '5 normalised tables', 'Foreign key relationships', 'Index optimisation'] },
];

const DISEASES_DB = [
  { name: 'Leaf Blotch',         pathogen: 'Taphrina maculans',       type: 'Fungal',     season: 'Monsoon' },
  { name: 'Rhizome Rot',         pathogen: 'Pythium spp.',             type: 'Oomycete',   season: 'High moisture' },
  { name: 'Yellow Leaf Disease', pathogen: 'Phytoplasma spp.',         type: 'Viral',      season: 'Summer' },
  { name: 'Fusarium Wilt',       pathogen: 'Fusarium oxysporum',       type: 'Fungal',     season: 'Dry' },
  { name: 'Soft Rot',            pathogen: 'Pythium aphanidermatum',   type: 'Bacterial',  season: 'Waterlogged' },
  { name: 'Taro Leaf Blight',    pathogen: 'Phytophthora colocasiae',  type: 'Oomycete',   season: 'Monsoon' },
];

const PIPELINE = [
  { step: '01', title: 'Image Upload & Validation', desc: 'Accepts JPEG/PNG up to 16MB. Validates format and resolution before processing.' },
  { step: '02', title: 'Preprocessing',             desc: 'CLAHE enhancement, Gaussian noise removal, and resizing to 224×224 for model input.' },
  { step: '03', title: 'YOLOv8 Detection',          desc: 'Identifies plant parts (leaf, stem, rhizome) and draws bounding boxes around disease regions.' },
  { step: '04', title: 'EfficientNet-B0 Classification', desc: 'Classifies the detected disease type with confidence scores and top-3 predictions.' },
  { step: '05', title: 'Grad-CAM Explainability',   desc: 'Generates a heatmap overlaid on the original image showing which pixels drove the prediction.' },
  { step: '06', title: 'HSV Color Analysis',        desc: 'Quantifies green/yellow/brown percentages to detect chlorosis, necrosis, and stress.' },
  { step: '07', title: 'Soil Health Prediction',    desc: 'Random Forest model evaluates 8 soil parameters and outputs fertility score + recommendations.' },
  { step: '08', title: 'Report Generation',         desc: 'ReportLab generates a professional PDF with all findings, heatmaps, and treatment plans.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-surface-950/90 backdrop-blur-md border-b border-surface-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">TurmeriCare</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="btn-ghost text-sm px-4 py-2">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-surface-950 via-primary-950/20 to-surface-950">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-900/60 border border-primary-700/50 text-primary-300 text-xs font-semibold mb-6">
            <Brain className="w-3.5 h-3.5" /> About TurmeriCare
          </div>
          <h1 className="font-display font-bold text-5xl text-white mb-4">
            AI for Every<br />
            <span className="text-gradient">Turmeric Farmer</span>
          </h1>
          <p className="text-surface-300 text-lg leading-relaxed">
            TurmeriCare was built to solve a real problem: turmeric diseases cost Indian farmers ₹3,000+ crore annually.
            Our mission is to make AI-powered disease detection accessible to every farmer — free, fast, and in their hands.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Eye,      title: 'Early Detection',    desc: '95.2% accuracy in detecting disease at early stages when treatment is most effective and affordable.' },
            { icon: Users,    title: 'Farmer First',       desc: 'Designed for rural India. Works with any smartphone photo. No scientific knowledge required.' },
            { icon: FlaskConical, title: 'Science Backed', desc: 'Trained on 50,000+ real turmeric plant images collected across Karnataka, Tamil Nadu, and Andhra Pradesh.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card text-center">
              <div className="w-12 h-12 bg-primary-600/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="font-display font-semibold text-lg text-surface-50 mb-2">{title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 bg-surface-900/50 border-y border-surface-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-white text-center mb-12">Technology Stack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TECH_STACK.map(({ layer, items }) => (
              <div key={layer} className="card">
                <h3 className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-3">{layer}</h3>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-surface-300">
                      <CheckCircle className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disease Database */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-white text-center mb-4">Disease Database</h2>
          <p className="text-surface-400 text-center mb-10">Six major turmeric diseases covered by TurmeriCare's AI engine</p>
          <div className="card p-0 overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Disease Name</th>
                  <th>Pathogen</th>
                  <th>Type</th>
                  <th>Peak Season</th>
                </tr>
              </thead>
              <tbody>
                {DISEASES_DB.map(d => {
                  const typeColors = {
                    Fungal: 'badge-warning', Oomycete: 'badge-danger',
                    Viral: 'bg-purple-900/50 text-purple-300 border border-purple-800',
                    Bacterial: 'badge-danger',
                  };
                  return (
                    <tr key={d.name}>
                      <td className="font-medium text-surface-100">{d.name}</td>
                      <td className="text-surface-400 italic text-xs">{d.pathogen}</td>
                      <td><span className={`badge text-[10px] ${typeColors[d.type] || 'badge-neutral'}`}>{d.type}</span></td>
                      <td className="text-surface-400 text-xs">{d.season}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* AI Pipeline */}
      <section className="py-16 px-4 bg-surface-900/50 border-y border-surface-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-white text-center mb-12">8-Step AI Pipeline</h2>
          <div className="space-y-4">
            {PIPELINE.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 card">
                <div className="w-12 h-12 rounded-xl bg-primary-900/50 border border-primary-700/50 flex items-center justify-center flex-shrink-0 font-display font-bold text-primary-400 text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-surface-100">{title}</h3>
                  <p className="text-sm text-surface-400 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="font-display font-bold text-3xl text-white mb-4">Ready to get started?</h2>
        <p className="text-surface-400 mb-8">Free for all farmers. No subscription required.</p>
        <Link to="/register" className="btn-primary btn-lg shadow-glow-lg">
          Create Free Account <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-6 px-4 text-center">
        <p className="text-xs text-surface-600">© 2026 TurmeriCare. Built with ❤️ for Indian Farmers.</p>
      </footer>
    </div>
  );
}
