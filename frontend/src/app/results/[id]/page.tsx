import Link from 'next/link';
import {
  ChevronLeft, Activity,
  User, Calendar, FileText,
  AlertTriangle, CheckCircle2, TrendingUp,
  Stethoscope, Info, Eye
} from 'lucide-react';
import styles from './results.module.css';

import PrintButton from '@/components/PrintButton';

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let scan: any = null;
  try {
    const res = await fetch(`http://localhost:5000/report/${id}`, { cache: 'no-store' });
    const json = await res.json();
    if (json.success) {
      scan = json.data;
      if (scan.createdAt) {
        scan.createdAt = scan.createdAt.includes(' ') ? scan.createdAt.replace(' ', 'T') + 'Z' : scan.createdAt;
      }
    }
  } catch (e) {
    console.error('API Error', e);
  }

  if (!scan) {
    return (
      <div className={styles.pageShell} style={{ textAlign: 'center', paddingTop: '8rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Report Not Found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
          The scan report with ID <strong>{id}</strong> does not exist.
        </p>
        <Link href="/history" className="btn-primary">← Back to Dashboard</Link>
      </div>
    );
  }

  const isDanger  = scan.riskLevel === 'High Risk';
  const isWarning = scan.riskLevel === 'Moderate Risk';
  const isSafe    = scan.riskLevel === 'Low Risk';

  const riskColor  = isDanger ? 'var(--danger)'  : isWarning ? 'var(--warning)'  : 'var(--success)';
  const riskBg     = isDanger ? 'var(--danger-light)' : isWarning ? 'var(--warning-light)' : 'var(--success-light)';
  const RiskIcon   = isDanger ? AlertTriangle : isWarning ? TrendingUp : CheckCircle2;

  const reportCode = `GLC-${String(scan.id).padStart(6, '0')}`;

  return (
    <div className={styles.pageShell}>
      <div className={`${styles.inner} animate-in`}>

        {/* Top Nav */}
        <div className={styles.topNav}>
          <Link href="/history" className={styles.backLink}>
            <ChevronLeft size={18} /> Back to Dashboard
          </Link>
          <PrintButton />
        </div>

        {/* Report Card */}
        <div className={styles.reportCard} id="printable-report">
          <div className={styles.reportStrip} />

          {/* Header */}
          <div className={styles.reportHeader}>
            <div className={styles.brandRow}>
              <div className={styles.brandIcon}>
                <Activity size={22} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <div className={styles.brandName}>Glauc<span>AI</span></div>
                <span className={styles.brandSub}>Automated Retinal Analysis Report</span>
              </div>
            </div>
            <div className={styles.reportMetaRight}>
              <span className={styles.reportMetaLabel}>Report ID</span>
              <span className={styles.reportMetaValue}>{reportCode}</span>
              <span className={styles.reportMetaLabel} style={{ marginTop: '0.5rem' }}>Generated</span>
              <span className={styles.reportMetaValue} style={{ fontFamily: 'inherit', fontSize: '0.85rem' }}>
                {new Date(scan.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Patient Info */}
          <div className={styles.patientRow}>
            <div className={styles.patientCell}>
              <div className={styles.patientCellIcon}><User size={18} /></div>
              <div>
                <span className={styles.patientCellLabel}>Patient Name</span>
                <span className={styles.patientCellValue}>{scan.patientName || 'Anonymous'}</span>
              </div>
            </div>
            <div className={styles.patientCell}>
               <div className={styles.patientCellIcon}><Calendar size={18} /></div>
               <div>
                 <span className={styles.patientCellLabel}>Age / Gender</span>
                 <span className={styles.patientCellValue}>
                   {scan.patientAge ? `${scan.patientAge}Y` : 'N/A'} • {scan.patientGender || 'N/A'}
                 </span>
               </div>
            </div>
            <div className={styles.patientCell}>
              <div className={styles.patientCellIcon}><FileText size={18} /></div>
              <div>
                <span className={styles.patientCellLabel}>Patient ID</span>
                <span className={styles.patientCellValue}>{scan.patientId}</span>
              </div>
            </div>
            <div className={styles.patientCell}>
              <div className={styles.patientCellIcon}><Eye size={18} /></div>
              <div>
                <span className={styles.patientCellLabel}>Analyzed Eye</span>
                <span className={styles.patientCellValue} style={{ textTransform: 'capitalize' }}>
                  {scan.eye} Eye
                </span>
              </div>
            </div>
          </div>

          {/* Risk Result */}
          <div className={styles.resultBlock}>
            <div className={styles.riskHeader}>
              <div className={styles.riskLeft}>
                <div className={styles.riskIconWrap} style={{ background: riskBg }}>
                  <RiskIcon size={28} color={riskColor} strokeWidth={2} />
                </div>
                <div>
                  <div className={styles.riskTitle} style={{ color: riskColor }}>
                    {scan.riskLevel}
                    <span className={styles.eyeIndicatorBadge} title={`${scan.eye.toUpperCase()} EYE`}>
                      <Eye size={12} strokeWidth={3} /> {scan.eye === 'left' ? 'L' : 'R'}
                    </span>
                  </div>
                  <div className={styles.riskSub}>Glaucoma Risk Classification for <strong>{scan.eye.toUpperCase()} EYE</strong></div>
                </div>
              </div>
              <div className={styles.confidencePill} style={{ borderColor: riskColor, color: riskColor, background: riskBg }}>
                <span className={styles.confidenceNum}>{scan.confidenceScore}%</span>
                <span className={styles.confidenceLabel}>Confidence Score</span>
              </div>
            </div>

            {/* Gauge */}
            <div className={styles.gaugeWrap}>
              <div className={styles.gaugeTrack}>
                <div
                  className={styles.gaugeFill}
                  style={{
                    width: `${scan.confidenceScore}%`,
                    background: `linear-gradient(90deg, ${isSafe ? 'var(--success)' : isWarning ? 'var(--warning)' : 'var(--danger)'} 0%, ${riskColor} 100%)`
                  }}
                />
                <div
                  className={styles.gaugeThumb}
                  style={{ left: `${scan.confidenceScore}%`, borderColor: riskColor }}
                />
              </div>
              <div className={styles.gaugeLabels}>
                <span className={styles.gaugeLabel} style={{ color: 'var(--success)' }}>Low (0–40)</span>
                <span className={styles.gaugeLabel} style={{ color: 'var(--warning)' }}>Moderate (40–70)</span>
                <span className={styles.gaugeLabel} style={{ color: 'var(--danger)' }}>High (70–100)</span>
              </div>
            </div>

            {/* Findings + Recommendation */}
            <div className={styles.findingsGrid}>
              <div className={styles.findingsBox}>
                <div className={styles.findingsBoxTitle}>
                  <Info size={14} /> AI Findings
                </div>
                <p className={styles.findingsText}>{scan.resultText}</p>
              </div>
              <div className={styles.findingsBox}>
                <div className={styles.findingsBoxTitle}>
                  <Stethoscope size={14} /> Clinical Recommendation
                </div>
                <div className={styles.recBox} style={{ borderLeftColor: riskColor }}>
                  {scan.recommendation}
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className={styles.disclaimer}>
            <Info size={16} className={styles.disclaimerIcon} />
            <p>
              <strong>Medical Disclaimer:</strong> This report is generated by an AI model intended to assist qualified
              medical professionals. It does not constitute a clinical diagnosis. Always confirm findings with a
              board-certified ophthalmologist before initiating treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
