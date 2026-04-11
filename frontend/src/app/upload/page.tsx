"use client";

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, Loader2, ArrowRight, ShieldCheck, Zap, Clock, Eye, User, Info, Users, Hash, Calendar as CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './upload.module.css';
import { API_ENDPOINTS } from '@/config/api';

const STEPS = ['Uploading images…', 'Verifying fundus integrity…', 'Analyzing both retinas…', 'Aggregating results…', 'Generating combined report…'];

export default function UploadPage() {
  const router = useRouter();
  
  // Patient Details
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');

  // Eye Files
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [leftPreview, setLeftPreview] = useState<string | null>(null);
  const [rightPreview, setRightPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) { setStepIdx(0); return; }
    const interval = setInterval(() => {
      setStepIdx(i => (i < STEPS.length - 1 ? i + 1 : i));
    }, 600);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileSelected = (f: File, side: 'left' | 'right') => {
    setError(null);
    if (!f.type.startsWith('image/')) { 
      setError('Please upload a valid image file (JPG or PNG).'); 
      return; 
    }
    if (side === 'left') {
      setLeftFile(f);
      setLeftPreview(URL.createObjectURL(f));
    } else {
      setRightFile(f);
      setRightPreview(URL.createObjectURL(f));
    }
  };

  const clearSelection = (side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftFile(null); setLeftPreview(null);
      if (leftInputRef.current) leftInputRef.current.value = '';
    } else {
      setRightFile(null); setRightPreview(null);
      if (rightInputRef.current) rightInputRef.current.value = '';
    }
  };

  const analyzeImages = async () => {
    if (!leftFile || !rightFile || !patientName || !patientAge) {
      setError('Check required fields: Patient Name, Age, and both Eye images.');
      return;
    }

    setIsLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('leftEye', leftFile);
      formData.append('rightEye', rightFile);
      formData.append('patientId', patientId);
      formData.append('patientName', patientName);
      formData.append('patientAge', patientAge);
      formData.append('patientGender', patientGender);
      
      const response = await fetch(API_ENDPOINTS.PREDICT, { method: 'POST', body: formData });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error('Server returned non-JSON:', text);
        throw new Error('The server did not return a valid JSON response. Please check if the backend is running on port 5000.');
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to analyze images');
      
      // Redirect to combined report
      setTimeout(() => router.push(`/results/combined?left=${result.data.leftScanId}&right=${result.data.rightScanId}`), 400);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Check if the backend server is active.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageShell}>
      <div className={`${styles.inner} animate-in`}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageBreadcrumb}>
            <Zap size={12} /> Combined AI Screening
          </div>
          <h1 className={styles.pageTitle}>Dual Retinal Analysis</h1>
          <p className={styles.pageSubtitle}>
            Please provide patient details and upload retinal fundus images for both eyes to generate a single diagnostic report.
          </p>
        </div>

        {/* Form & Upload Card */}
        <div className={styles.uploadCard}>
          
          {/* Warning Banner */}
          <div className={styles.warningBanner}>
            <Info className={styles.warningIcon} size={20} />
            <div>
              <span className={styles.warningTitle}>Format Requirements</span>
              <p className={styles.warningText}>
                The AI model strictly accepts **JPEG** and **PNG** fundus images. 
                Ensure both eye scans are uploaded before generation.
              </p>
            </div>
          </div>

          {/* Patient Details Form */}
          <div className={styles.patientInfoSection}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="patientName">
                  <User size={14} /> Full Name *
                </label>
                <input
                  id="patientName"
                  type="text"
                  className={styles.patientIdInput}
                  placeholder="e.g. John Doe"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="patientId">
                  <Hash size={14} /> Patient ID (Optional)
                </label>
                <input
                  id="patientId"
                  type="text"
                  className={styles.patientIdInput}
                  placeholder="e.g. PID-1234"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="patientAge">
                  <CalendarIcon size={14} /> Age *
                </label>
                <input
                  id="patientAge"
                  type="number"
                  className={styles.patientIdInput}
                  placeholder="Years"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="patientGender">
                  <Users size={14} /> Gender
                </label>
                <select
                  id="patientGender"
                  className={styles.selectInput}
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.divider}>Retinal Scans</div>

          {/* Dropzone Grid */}
          <div className={styles.dropzoneGrid}>
            {/* Left Eye */}
            <div className={styles.dropzoneContainer}>
              <label className={styles.dropzoneLabel}><Eye size={14} /> Left Eye Retinal Image *</label>
              <div
                className={`${styles.dropzone} ${leftPreview ? styles.hasFile : ''}`}
                onClick={() => !leftPreview && leftInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={leftInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0], 'left')}
                  accept="image/jpeg, image/png"
                  className={styles.hiddenInput}
                />
                {!leftPreview ? (
                  <div className={styles.placeholder}>
                    <div className={styles.uploadIconRing}>
                      <UploadCloud size={24} strokeWidth={1.5} />
                    </div>
                    <h3>Upload L-Eye</h3>
                    <p>Click to browse</p>
                  </div>
                ) : (
                  <div className={styles.previewContainer}>
                    <div className={styles.imageFrame}>
                      <img src={leftPreview} alt="Left eye scan" className={styles.previewImage} />
                      {isLoading && <div className={styles.scanningOverlay}><div className={styles.scannerLine}></div></div>}
                    </div>
                    <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); clearSelection('left'); }}>Remove</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Eye */}
            <div className={styles.dropzoneContainer}>
              <label className={styles.dropzoneLabel}><Eye size={14} /> Right Eye Retinal Image *</label>
              <div
                className={`${styles.dropzone} ${rightPreview ? styles.hasFile : ''}`}
                onClick={() => !rightPreview && rightInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={rightInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0], 'right')}
                  accept="image/jpeg, image/png"
                  className={styles.hiddenInput}
                />
                {!rightPreview ? (
                  <div className={styles.placeholder}>
                    <div className={styles.uploadIconRing}>
                      <UploadCloud size={24} strokeWidth={1.5} />
                    </div>
                    <h3>Upload R-Eye</h3>
                    <p>Click to browse</p>
                  </div>
                ) : (
                  <div className={styles.previewContainer}>
                    <div className={styles.imageFrame}>
                      <img src={rightPreview} alt="Right eye scan" className={styles.previewImage} />
                      {isLoading && <div className={styles.scanningOverlay}><div className={styles.scannerLine}></div></div>}
                    </div>
                    <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); clearSelection('right'); }}>Remove</button>
                  </div>
                )}
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

          {/* CTA */}
          <div className={styles.actionArea}>
            <button
              className={`btn-primary ${styles.analyzeBtn}`}
              disabled={isLoading || !leftFile || !rightFile}
              onClick={analyzeImages}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className={styles.spinner} />
                  {STEPS[stepIdx]}
                </>
              ) : (
                <>
                  Generate Combined Report <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
