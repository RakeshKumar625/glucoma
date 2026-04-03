"use client";

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, Loader2, ArrowRight, ShieldCheck, Zap, Clock, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './upload.module.css';

const STEPS = ['Uploading image…', 'Preprocessing retina…', 'Running AI model…', 'Generating report…'];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [selectedEye, setSelectedEye] = useState<'left' | 'right'>('left');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) { setStepIdx(0); return; }
    const interval = setInterval(() => {
      setStepIdx(i => (i < STEPS.length - 1 ? i + 1 : i));
    }, 420);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelected(e.dataTransfer.files[0]);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
  };

  const handleFileSelected = (f: File) => {
    setError(null);
    if (!f.type.startsWith('image/')) { setError('Please upload a valid image file (JPG or PNG).'); return; }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const clearSelection = () => {
    setFile(null); setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeImage = async () => {
    if (!file) return;
    setIsLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('eye', selectedEye);
      const response = await fetch('http://localhost:5000/predict', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to analyze image');
      setTimeout(() => router.push(`/results/${result.data.id}`), 400);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Is the backend server running?');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageShell}>
      <div className={`${styles.inner} animate-in`}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageBreadcrumb}>
            <Zap size={12} /> AI Screening
          </div>
          <h1 className={styles.pageTitle}>Retinal Scan & Analyze</h1>
          <p className={styles.pageSubtitle}>
            Upload a digital retinal fundus image to receive an instant glaucoma risk report powered by AI.
          </p>
        </div>

        {/* Card */}
        <div className={styles.uploadCard}>
          {/* Dropzone */}
          <div
            className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${previewUrl ? styles.hasFile : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept="image/jpeg,image/png,image/jpg"
              className={styles.hiddenInput}
            />

            {!previewUrl ? (
              <div className={styles.placeholder}>
                <div className={styles.uploadIconRing}>
                  <UploadCloud size={36} strokeWidth={1.5} />
                </div>
                <h3>Drop your retinal image here</h3>
                <p>or click to browse from your computer</p>
                <div className={styles.formatChips}>
                  <span className={styles.formatChip}>JPG</span>
                  <span className={styles.formatChip}>PNG</span>
                  <span className={styles.formatChip}>up to 20MB</span>
                </div>
              </div>
            ) : (
              <div className={styles.previewContainer}>
                <div className={styles.imageFrame}>
                  <img src={previewUrl} alt="Retinal scan preview" className={styles.previewImage} />
                  {isLoading && (
                    <div className={styles.scanningOverlay}>
                      <div className={styles.scannerLine}></div>
                      <span className={styles.scanOverlayText}>{STEPS[stepIdx]}</span>
                    </div>
                  )}
                </div>

                <div className={styles.fileInfoBar}>
                  <ImageIcon size={16} className={styles.fileInfoIcon} />
                  <span className={styles.fileName}>{file?.name}</span>
                  {!isLoading && (
                    <button
                      className={styles.removeBtn}
                      onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Eye Selection */}
          <div className={styles.eyeSelectionContainer}>
            <p className={styles.eyeSelectionLabel}>Which eye are you scanning?</p>
            <div className={styles.eyeOptions}>
              <div 
                className={`${styles.eyeOption} ${selectedEye === 'left' ? styles.selected : ''}`}
                onClick={() => setSelectedEye('left')}
              >
                <span className={styles.eyeOptionIcon}>👁️</span>
                <span className={styles.eyeOptionName}>Left Eye</span>
              </div>
              <div 
                className={`${styles.eyeOption} ${selectedEye === 'right' ? styles.selected : ''}`}
                onClick={() => setSelectedEye('right')}
              >
                <span className={styles.eyeOptionIcon}>👁️</span>
                <span className={styles.eyeOptionName}>Right Eye</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorAlert}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Info row */}
          <div className={styles.divider}>What happens next?</div>
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <Zap size={16} className={styles.infoItemIcon} />
              <div>
                <span className={styles.infoItemLabel}>Speed</span>
                <span className={styles.infoItemValue}>Under 2 seconds</span>
              </div>
            </div>
            <div className={styles.infoItem}>
              <ShieldCheck size={16} className={styles.infoItemIcon} />
              <div>
                <span className={styles.infoItemLabel}>Privacy</span>
                <span className={styles.infoItemValue}>Ephemeral processing</span>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Clock size={16} className={styles.infoItemIcon} />
              <div>
                <span className={styles.infoItemLabel}>Report</span>
                <span className={styles.infoItemValue}>Saved to dashboard</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className={styles.actionArea}>
            <button
              className={`btn-primary ${styles.analyzeBtn}`}
              disabled={!file || isLoading}
              onClick={analyzeImage}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className={styles.spinner} />
                  {STEPS[stepIdx]}
                </>
              ) : (
                <>
                  Analyze Scan <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
