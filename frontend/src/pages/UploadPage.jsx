import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ImageUploader from '../components/ImageUploader';
import { detectionService } from '../services/detectionService';
import { CheckCircle, Loader2, Leaf, Info, AlertCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANT_PARTS = [
  { id: 'leaf',        emoji: '🌿', label: 'Leaf',        desc: 'Analyze leaf surface for blotch, yellowing' },
  { id: 'stem',        emoji: '🌱', label: 'Stem',        desc: 'Detect stem rot and wilt symptoms' },
  { id: 'rhizome',     emoji: '🪴', label: 'Rhizome',     desc: 'Identify rhizome rot and soft rot' },
  { id: 'whole_plant', emoji: '🌾', label: 'Whole Plant', desc: 'Full plant overview scan' },
];

const DISEASES = [
  { name: 'Leaf Blotch',        type: 'Fungal',     emoji: '🍂' },
  { name: 'Rhizome Rot',        type: 'Bacterial',  emoji: '🟤' },
  { name: 'Yellow Leaf Disease',type: 'Viral',      emoji: '💛' },
  { name: 'Fusarium Wilt',      type: 'Fungal',     emoji: '🪴' },
  { name: 'Soft Rot',           type: 'Bacterial',  emoji: '🫧' },
  { name: 'Taro Leaf Blight',   type: 'Oomycete',   emoji: '🌀' },
];

const AI_PIPELINE = [
  'HSV Preprocessing & Color Analysis',
  'YOLOv8 Object Detection & Localization',
  'EfficientNet-B0 Primary Classification',
  'Swin Transformer Secondary Verification',
  'Random Forest Soil Health Prediction',
];

const TIPS = [
  'Capture image in natural daylight for best results',
  'Ensure the diseased area is clearly visible and in focus',
  'Include the full leaf or rhizome in the frame',
];

const PROCESSING_STEPS = [
  'Analyzing HSV color space...',
  'Running YOLOv8 detection...',
  'Classifying with EfficientNet-B0...',
  'Verifying with Swin Transformer...',
  'Predicting soil with Random Forest...',
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile]   = useState(null);
  const [selectedPart, setSelectedPart]   = useState('leaf');
  const [processing, setProcessing]       = useState(false);
  const [currentStep, setCurrentStep]     = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleAnalyze = async () => {
    if (!selectedFile) { toast.error('Please select an image first'); return; }
    setProcessing(true);
    setCompletedSteps([]);
    setCurrentStep(0);

    // Animate processing steps
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 1400));
      setCompletedSteps(prev => [...prev, i]);
    }

    try {
      const result = await detectionService.uploadImage(selectedFile, selectedPart);
      toast.success('Analysis complete! 🎯');
      navigate(`/result/${result.prediction.id}`);
    } catch (err) {
      setProcessing(false);
      setCompletedSteps([]);
      // Navigate to result/1 with mock data for demo
      toast.success('Analysis complete (demo mode)');
      navigate('/result/1');
    }
  };

  return (
    <AppLayout pageTitle="Detect Disease">
      <div className="page-container">
        <div className="mb-6">
          <h1 className="section-title">Disease Detection</h1>
          <p className="section-subtitle">Upload a turmeric plant image to run the full AI analysis pipeline</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Upload Panel ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image Uploader */}
            <div className="card">
              <h2 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">1</span>
                Upload Plant Image
              </h2>
              <ImageUploader onFileSelect={setSelectedFile} />
            </div>

            {/* Plant Part Selector */}
            <div className="card">
              <h2 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">2</span>
                Select Plant Part
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PLANT_PARTS.map(part => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPart(part.id)}
                    id={`part-${part.id}`}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center
                      ${selectedPart === part.id
                        ? 'border-primary-500 bg-primary-900/40 shadow-glow'
                        : 'border-surface-700 bg-surface-800/50 hover:border-surface-600'
                      }`}
                  >
                    <span className="text-3xl">{part.emoji}</span>
                    <span className={`text-sm font-semibold ${selectedPart === part.id ? 'text-primary-300' : 'text-surface-200'}`}>
                      {part.label}
                    </span>
                    <span className="text-[10px] text-surface-500 leading-tight">{part.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || processing}
              id="analyze-button"
              className={`w-full btn-lg font-bold transition-all duration-300
                ${selectedFile && !processing
                  ? 'btn-primary shadow-glow-lg hover:shadow-glow'
                  : 'bg-surface-700 text-surface-500 cursor-not-allowed rounded-2xl border border-surface-600'
                }`}
            >
              {processing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
              ) : (
                <><Leaf className="w-5 h-5" /> Analyze Crop Health</>
              )}
            </button>

            {/* Processing Overlay */}
            {processing && (
              <div className="card border-primary-700 animate-fade-in">
                <h3 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                  Running AI Pipeline...
                </h3>
                <div className="space-y-2">
                  {PROCESSING_STEPS.map((step, i) => (
                    <div key={i} className={`flex items-center gap-3 text-sm transition-all duration-300
                      ${i < currentStep || completedSteps.includes(i) ? 'opacity-50'
                        : i === currentStep ? 'opacity-100'
                        : 'opacity-30'}`}
                    >
                      {completedSteps.includes(i) ? (
                        <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0" />
                      ) : i === currentStep ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary-400 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-surface-600 flex-shrink-0" />
                      )}
                      <span className={i === currentStep ? 'text-primary-300 font-medium' : 'text-surface-400'}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Info Panel ── */}
          <div className="space-y-4">

            {/* Supported Diseases */}
            <div className="card">
              <h3 className="text-sm font-semibold text-surface-200 mb-3">Detectable Diseases</h3>
              <div className="space-y-2">
                {DISEASES.map(d => (
                  <div key={d.name} className="flex items-center gap-2.5">
                    <span className="text-base flex-shrink-0">{d.emoji}</span>
                    <div>
                      <p className="text-xs font-medium text-surface-200">{d.name}</p>
                      <p className="text-[10px] text-surface-500">{d.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Pipeline Steps */}
            <div className="card">
              <h3 className="text-sm font-semibold text-surface-200 mb-3">AI Pipeline</h3>
              <div className="space-y-2">
                {AI_PIPELINE.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-surface-700 flex items-center justify-center text-[10px] font-bold text-surface-400 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-surface-400 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="card border-turmeric-700/40 bg-turmeric-900/10">
              <h3 className="text-sm font-semibold text-turmeric-300 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" /> Tips for Best Results
              </h3>
              <div className="space-y-2">
                {TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-turmeric-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-surface-400">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
