import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X, CheckCircle, AlertCircle, Camera, RefreshCw, PlayCircle } from 'lucide-react';

/**
 * ImageUploader — drag-and-drop file upload component.
 * Accepts JPEG, PNG, WebP images up to 10MB.
 * Shows preview thumbnail and file info on selection.
 */
export default function ImageUploader({ onFileSelect, accept = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }, maxSize = 10 * 1024 * 1024 }) {
  const [preview, setPreview]     = useState(null);
  const [fileName, setFileName]   = useState('');
  const [fileSize, setFileSize]   = useState('');
  const [error, setError]         = useState('');
  const [mode, setMode]           = useState('upload');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const onDrop = useCallback((accepted, rejected) => {
    setError('');
    if (rejected.length > 0) {
      const msg = rejected[0].errors[0]?.code === 'file-too-large'
        ? 'File is too large. Max 10MB.'
        : 'Invalid file type. Upload JPEG, PNG or WebP.';
      setError(msg);
      return;
    }
    if (accepted.length > 0) {
      const file = accepted[0];
      setFileName(file.name);
      setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError('');
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch (err) {
      setCameraError('Camera access was blocked or is unavailable on this device.');
      setMode('upload');
    }
  }, []);

  const handleUseCamera = async () => {
    setPreview(null);
    setFileName('');
    setFileSize('');
    setError('');
    setMode('camera');
    await startCamera();
  };

  const handleRetake = async () => {
    setPreview(null);
    setFileName('');
    setFileSize('');
    setError('');
    setMode('camera');
    await startCamera();
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !cameraReady) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `turmeric-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = URL.createObjectURL(file);
      setPreview(url);
      setFileName(file.name);
      setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      onFileSelect(file);
      stopCamera();
      setMode('upload');
    }, 'image/jpeg', 0.95);
  };

  useEffect(() => () => {
    stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept, maxSize, multiple: false,
  });

  const clearFile = (e) => {
    e.stopPropagation();
    stopCamera();
    setPreview(null);
    setFileName('');
    setFileSize('');
    setError('');
    setCameraError('');
    setMode('upload');
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`btn-secondary btn-sm ${mode === 'upload' ? 'ring-1 ring-primary-500' : ''}`}
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </button>
        <button
          type="button"
          onClick={handleUseCamera}
          className={`btn-secondary btn-sm ${mode === 'camera' ? 'ring-1 ring-primary-500' : ''}`}
        >
          <Camera className="w-4 h-4" />
          Live Camera
        </button>
      </div>

      {cameraError && (
        <div className="mb-3 flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`dropzone min-h-[220px] p-8 ${isDragActive ? 'dragging' : ''} ${preview ? 'border-primary-500 bg-primary-500/5' : ''}`}
      >
        <input {...getInputProps()} id="image-upload-input" />

        {mode === 'camera' && !preview ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-surface-700 bg-surface-900/80 shadow-lg">
              <video
                ref={videoRef}
                className="w-full aspect-video object-cover bg-black"
                autoPlay
                playsInline
                muted
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex flex-wrap justify-center gap-3">
              {!cameraReady ? (
                <button type="button" onClick={startCamera} className="btn-primary btn-sm">
                  <PlayCircle className="w-4 h-4" />
                  Start Camera
                </button>
              ) : (
                <>
                  <button type="button" onClick={capturePhoto} className="btn-primary btn-sm">
                    <Camera className="w-4 h-4" />
                    Capture Photo
                  </button>
                  <button type="button" onClick={stopCamera} className="btn-secondary btn-sm">
                    <RefreshCw className="w-4 h-4" />
                    Stop Camera
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-surface-500 text-center">
              Use the live camera to capture the leaf, stem, or rhizome, then analyze the photo instantly.
            </p>
          </div>
        ) : preview ? (
          /* Preview state */
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative">
              <img src={preview} alt="Preview" className="max-h-48 max-w-full rounded-xl object-contain ring-2 ring-primary-500/30" />
              <button
                onClick={clearFile}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0" />
              <span className="text-surface-200 font-medium truncate max-w-[200px]">{fileName}</span>
              <span className="text-surface-500 text-xs">({fileSize})</span>
            </div>
            <p className="text-xs text-surface-500">Click or drag to replace image</p>
          </div>
        ) : (
          /* Drop zone state */
          <div className="flex flex-col items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center
              ${isDragActive ? 'bg-primary-500/20 shadow-glow' : 'bg-surface-800'}
              transition-all duration-300`}>
              {isDragActive
                ? <Image className="w-10 h-10 text-primary-400 animate-bounce-slow" />
                : <Upload className="w-10 h-10 text-surface-500" />
              }
            </div>
            <div>
              <p className="text-surface-200 font-medium text-base">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
              </p>
              <p className="text-surface-500 text-sm mt-1">
                or <span className="text-primary-400 font-medium cursor-pointer hover:text-primary-300">browse files</span>
              </p>
            </div>
            <div className="flex gap-3 text-xs text-surface-600">
              <span>JPEG</span><span>·</span><span>PNG</span><span>·</span><span>WebP</span>
              <span>·</span><span>Max 10MB</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
