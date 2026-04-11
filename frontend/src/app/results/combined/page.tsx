import Link from 'next/link';
import { 
  ChevronLeft, Activity, 
  User, Calendar, FileText, 
  AlertTriangle, CheckCircle2, TrendingUp, 
  Stethoscope, Info, Eye, Download, Printer
} from 'lucide-react';
import styles from './combined.module.css';
import PrintButton from '@/components/PrintButton';
import { API_ENDPOINTS } from '@/config/api';

export const dynamic = 'force-dynamic';

async function getScan(id: string) {
  try {
    const res = await fetch(API_ENDPOINTS.REPORT(id), { cache: 'no-store' });
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return null;
    }
    const json = await res.json();
    if (json.success && json.data.createdAt) {
      // Normalize date for JS parsing
      const rawDate = json.data.createdAt;
      json.data.createdAt = rawDate.includes(' ') ? rawDate.replace(' ', 'T') + 'Z' : rawDate;
    }
    return json.success ? json.data : null;
  } catch (e) {
    return null;
  }
}

export default async function CombinedResultPage({ searchParams }: { searchParams: Promise<{ left: string, right: string }> }) {
  const { left, right } = await searchParams;

  const leftScan = await getScan(left);
  const rightScan = await getScan(right);

  if (!leftScan || !rightScan) {
    return (
      <div className={styles.pageShell} style={{ textAlign: 'center', paddingTop: '8rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Reports Not Found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Unable to retrieve combined eye analysis data.</p>
        <Link href="/upload" className="btn-primary">← Back to Upload</Link>
      </div>
    );
  }

  const patientInfo = {
    id: leftScan.patientId,
    name: leftScan.patientName || 'Not Provided',
    age: leftScan.patientAge || 'N/A',
    gender: leftScan.patientGender || 'N/A',
    date: new Date(leftScan.createdAt).toLocaleString(undefined, { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    })
  };

  const hasHighRisk = leftScan.riskLevel === 'High Risk' || rightScan.riskLevel === 'High Risk';
  const hasModRisk = leftScan.riskLevel === 'Moderate Risk' || rightScan.riskLevel === 'Moderate Risk';

  let summaryText = 'Both eyes appear to be within normal risk parameters. However, regular eye check-ups are always recommended.';
  let summaryTitle = 'General Eye Health Appears Good';
  let summaryType = 'success';

  if (hasHighRisk) {
    summaryTitle = 'ABNORMALITY DETECTED: High Risk Indicators';
    summaryText = 'Significant indicators of glaucoma or other retinal abnormalities were detected in one or both eyes. Immediate clinical consultation with an ophthalmologist is mandatory.';
    summaryType = 'danger';
  } else if (hasModRisk) {
    summaryTitle = 'REVIEWS NEEDED: Moderate Risk Indicators';
    summaryText = 'Suspicious structural changes were noted in at least one eye. A comprehensive eye exam is recommended within the next 30-90 days.';
    summaryType = 'warning';
  }

  const renderEyeDetail = (scan: any, side: string) => {
    const isDanger = scan.riskLevel === 'High Risk';
    const isWarning = scan.riskLevel === 'Moderate Risk';
    const riskColor = isDanger ? '#b91c1c' : isWarning ? '#b45309' : '#15803d';

    return (
      <div className={styles.eyeDetailCard}>
        <div className={styles.eyeDetailTitle} style={{ borderLeftColor: riskColor }}>
          {side} Eye Analysis
        </div>
        <div className={styles.eyeDetailRow}>
          <span className={styles.eyeDetailLabel}>Prediction Result:</span>
          <span className={styles.eyeDetailValue} style={{ color: riskColor }}>{scan.riskLevel}</span>
        </div>
        <div className={styles.eyeDetailRow}>
          <span className={styles.eyeDetailLabel}>Confidence Level:</span>
          <span className={styles.eyeDetailValue}>{scan.confidenceScore}%</span>
        </div>
        <div className={styles.eyeDetailRow} style={{ marginTop: '0.5rem', display: 'block' }}>
          <span className={styles.eyeDetailLabel}>Findings:</span>
          <p className={styles.eyeDetailText}>{scan.resultText}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageShell}>
      <div className={`${styles.inner} animate-in`}>

        {/* Top Action Bar */}
        <div className={styles.topNav}>
          <Link href="/upload" className={styles.backLink}>
            <ChevronLeft size={18} /> New Analysis
          </Link>
          <div className={styles.navActions}>
             <PrintButton />
          </div>
        </div>

        {/* CONSOLIDATED REPORT */}
        <div className={styles.medicalReport} id="printable-report">
          
          <div className={styles.reportWatermark}>OFFICIAL REPORT</div>

          {/* Report Header */}
          <div className={styles.reportBanner}>
             <div className={styles.reportTitleMain}>CONSOLIDATED PATIENT MEDICAL REPORT</div>
             <div className={styles.reportTimestamp}>Date: {patientInfo.date}</div>
          </div>

          <div className={styles.reportSection}>
            <div className={styles.sectionHeading}>I. PATIENT INFORMATION</div>
            <div className={styles.patientDataTable}>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}>Patient ID:</div>
                <div className={styles.dataValue}>{patientInfo.id}</div>
                <div className={styles.dataLabel}>Full Name:</div>
                <div className={styles.dataValue}>{patientInfo.name}</div>
              </div>
              <div className={styles.dataRow}>
                <div className={styles.dataLabel}>Age:</div>
                <div className={styles.dataValue}>{patientInfo.age} Years</div>
                <div className={styles.dataLabel}>Gender:</div>
                <div className={styles.dataValue}>{patientInfo.gender}</div>
              </div>
            </div>
          </div>

          <div className={styles.reportSection}>
            <div className={styles.sectionHeading}>II. EYE ANALYSIS RESULTS</div>
            <div className={styles.eyeResultsContainer}>
              {renderEyeDetail(leftScan, 'Left')}
              {renderEyeDetail(rightScan, 'Right')}
            </div>
          </div>

          <div className={styles.reportSection}>
            <div className={styles.sectionHeading}>III. FINAL SUMMARY & INTERPRETATION</div>
            <div className={`${styles.summaryBox} ${styles[summaryType]}`}>
              <div className={styles.summaryTitleRow}>
                {summaryType === 'danger' && <AlertTriangle size={20} />}
                {summaryType === 'warning' && <TrendingUp size={20} />}
                {summaryType === 'success' && <CheckCircle2 size={20} />}
                <span>{summaryTitle}</span>
              </div>
              <p className={styles.summaryContent}>
                 {summaryText}
              </p>
              <div className={styles.abnormalityTag}>
                Status: {hasHighRisk || hasModRisk ? 'Abnormality Detected' : 'No Significant Abnormality detected'}
              </div>
            </div>
          </div>

          {/* RECOMMENDATIONS */}
          <div className={styles.reportSection}>
            <div className={styles.sectionHeading}>IV. CLINICAL RECOMMENDATIONS</div>
            <ul className={styles.recList}>
              <li>{leftScan.recommendation}</li>
              <li>{rightScan.recommendation}</li>
            </ul>
          </div>

          {/* Footer Disclaimer */}
          <div className={styles.reportFooter}>
            <div className={styles.disclaimerText}>
              <strong>Notice:</strong> This document is an automated AI assessment generated by GlacoVision. 
              It is designed to aid clinical screening and is not a substitute for a final medical diagnosis. 
              The analysis is based solely on the fundus images provided for Patient ID {patientInfo.id}.
            </div>
            <div className={styles.signatureRow}>
              <div className={styles.signatureLine}>Certified AI Systems Specialist</div>
              <div className={styles.signatureLine}>Automated Validation Stamp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
