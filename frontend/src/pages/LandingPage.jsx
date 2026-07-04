import { Link } from 'react-router-dom';
import {
  Leaf, Brain, Eye, FlaskConical, BarChart3, FileText, Bell,
  CheckCircle, ArrowRight, Mail,
  Layers, Zap, Shield
} from 'lucide-react';

const FEATURES = [
  { icon: Brain,      title: 'AI Disease Detection',    desc: 'YOLOv8 + EfficientNet-B0 detect 6 turmeric diseases with 95.2% accuracy from leaf, stem, rhizome, and whole-plant images.' },
  { icon: Eye,        title: 'Grad-CAM Explainability', desc: 'Visual heatmaps highlight exactly which regions of the image triggered the disease prediction — transparent, trustworthy AI.' },
  { icon: FlaskConical, title: 'Soil Health Analysis', desc: 'Input 8 soil parameters. Random Forest model predicts fertility score and delivers precise fertilizer + irrigation recommendations.' },
  { icon: BarChart3,  title: 'HSV Color Analysis',      desc: 'OpenCV HSV color space quantifies green, yellow, and brown tissue percentages to detect chlorosis and nutrient deficiency.' },
  { icon: FileText,   title: 'PDF Crop Reports',        desc: 'One-click generation of comprehensive PDF reports with disease info, heatmaps, soil data, and actionable treatment plans.' },
  { icon: Bell,       title: 'Smart Alerts',            desc: 'Automatic alerts when recurring diseases are detected — enabling early intervention before outbreak spreads.' },
];

const AI_STEPS = [
  { step: '01', label: 'Upload Image',         icon: '📸' },
  { step: '02', label: 'Preprocessing',        icon: '⚙️' },
  { step: '03', label: 'YOLOv8 Detection',     icon: '🔍' },
  { step: '04', label: 'EfficientNet Classify',icon: '🧠' },
  { step: '05', label: 'Grad-CAM Heatmap',     icon: '🔥' },
  { step: '06', label: 'Color Analysis',       icon: '🎨' },
  { step: '07', label: 'Soil Prediction',      icon: '🌱' },
  { step: '08', label: 'Generate Report',      icon: '📄' },
];

const TESTIMONIALS = [
  { name: 'Arjun Krishnamurthy', location: 'Erode, Tamil Nadu', text: 'TurmeriCare detected Leaf Blotch 3 weeks before visible symptoms. I applied fungicide early and saved nearly 60% of my crop.', initials: 'AK' },
  { name: 'Meena Patel',        location: 'Rajkot, Gujarat',   text: 'The soil analysis feature is incredible. It told me exactly how much potassium my field was lacking — crop yield improved by 35%.', initials: 'MP' },
  { name: 'Suresh Reddy',       location: 'Nizamabad, Telangana', text: "The PDF reports are professional enough to show the bank for agricultural loans. My farm advisor was impressed by the AI analysis.", initials: 'SR' },
];

const STATS = [
  { value: '10,000+', label: 'Farms Monitored' },
  { value: '95.2%',   label: 'Detection Accuracy' },
  { value: '6',       label: 'Disease Types' },
  { value: '24/7',    label: 'AI Monitoring' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-surface-950/90 backdrop-blur-md border-b border-surface-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">TurmeriCare</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-surface-400">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">How it Works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section pt-32 pb-24 px-4 relative min-h-screen flex items-center">
        {/* Floating particles */}
        {['🌿', '🌱', '🪴', '🌾', '🍃'].map((emoji, i) => (
          <div key={i} className="particle text-2xl animate-float opacity-30"
            style={{
              left:  `${10 + i * 18}%`,
              top:   `${15 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}>
            {emoji}
          </div>
        ))}

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-900/60 border border-primary-700/50 text-primary-300 text-xs font-semibold mb-6 animate-fade-in">
              <Zap className="w-3 h-3" />
              AI-Powered Agricultural Intelligence
            </div>

            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.08] animate-slide-up">
              Protect Your
              <span className="block text-gradient">Turmeric Crop</span>
              with AI
            </h1>

            <p className="mt-6 text-lg text-surface-300 leading-relaxed max-w-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Detect diseases instantly. Analyze soil health. Get expert recommendations.
              TurmeriCare brings cutting-edge AI to every turmeric farmer in India.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/register" className="btn-primary btn-lg gap-2 shadow-glow-lg">
                Start for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/about" className="btn-secondary btn-lg">
                Learn More
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap gap-5 text-sm text-surface-400 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {['No credit card required', 'Free for small farms', 'Government certified AI'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-surface-900 border-y border-surface-800 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="font-display font-bold text-4xl text-gradient-gold">{value}</p>
              <p className="text-sm text-surface-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-white">
              Intelligent Crop Protection
            </h2>
            <p className="text-surface-400 mt-3 max-w-xl mx-auto">
              Six AI-powered tools designed specifically for turmeric cultivation,
              from seed to harvest.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover group">
                <div className="w-12 h-12 bg-primary-600/15 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600/25 transition-colors">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="font-display font-semibold text-surface-50 text-lg mb-2">{title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Workflow ── */}
      <section id="workflow" className="py-24 px-4 bg-surface-900/50 border-y border-surface-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-white">How TurmeriCare Works</h2>
            <p className="text-surface-400 mt-3">8-step AI pipeline — from image upload to expert report</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {AI_STEPS.map(({ step, label, icon }, i) => (
              <div key={step} className="flex flex-col items-center gap-2 text-center group">
                <div className="relative w-14 h-14 rounded-2xl bg-surface-800 border border-surface-700 flex flex-col items-center justify-center group-hover:border-primary-600 group-hover:bg-primary-900/30 transition-all duration-300">
                  <span className="text-2xl">{icon}</span>
                </div>
                {i < AI_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute translate-x-14 -translate-y-7 w-8 border-t border-dashed border-surface-700" />
                )}
                <p className="text-[10px] text-surface-500 font-semibold uppercase tracking-wide">{step}</p>
                <p className="text-xs text-surface-300 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-white">Trusted by Farmers</h2>
            <p className="text-surface-400 mt-3">Real results from Indian turmeric growers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, location, text, initials }) => (
              <div key={name} className="card border-l-4 border-primary-600">
                <p className="text-surface-300 text-sm leading-relaxed italic mb-4">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-100 text-sm">{name}</p>
                    <p className="text-xs text-surface-500">{location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary-900/60 to-surface-900 border border-primary-700/40 rounded-3xl p-12">
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Ready to protect your crop?
            </h2>
            <p className="text-surface-300 mb-8">
              Join 10,000+ turmeric farmers already using AI to detect disease early and maximize yield.
            </p>
            <Link to="/register" className="btn-primary btn-lg shadow-glow-lg">
              Start Free — No Credit Card <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-white">TurmeriCare</span>
              </div>
              <p className="text-xs text-surface-500 leading-relaxed">
                AI-powered turmeric crop health monitoring for Indian farmers.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Disease Detection', 'Soil Analysis', 'Reports'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Disease Guide', 'Blog'] },
              { title: 'Company', links: ['About', 'Contact', 'Privacy Policy', 'Terms'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-surface-200 mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-xs text-surface-500 hover:text-surface-300 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-surface-600">© 2026 TurmeriCare. Built with ❤️ for Indian Farmers.</p>
            <p className="text-xs text-surface-600">Powered by YOLOv8 · EfficientNet-B0 · Random Forest · OpenCV</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
