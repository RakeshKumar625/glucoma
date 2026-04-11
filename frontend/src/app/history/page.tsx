import Link from 'next/link';
import { Calendar, ScanLine, ArrowRight, Eye, LayoutDashboard, Activity, AlertTriangle, CheckCircle2, Minus, FileText } from 'lucide-react';
import styles from './history.module.css';
import { API_ENDPOINTS } from '@/config/api';

export const dynamic = 'force-dynamic';

interface Scan {
  id: number;
  patientId: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  riskLevel: string;
  confidenceScore: number;
  eye: string;
  resultText: string;
  recommendation: string;
  createdAt: string;
}

export default async function HistoryPage() {
  let scans: Scan[] = [];
  try {
    const res = await fetch(API_ENDPOINTS.HISTORY, { cache: 'no-store' });
    const json = await res.json();
    if (json.success) scans = json.data;
  } catch (e) {
    console.error('Failed to get scans', e);
  }

  const highRisk   = scans.filter(s => s.riskLevel === 'High Risk').length;
  const modRisk    = scans.filter(s => s.riskLevel === 'Moderate Risk').length;
  const lowRisk    = scans.filter(s => s.riskLevel === 'Low Risk').length;

  const getBadgeClass = (level: string) => {
    if (level === 'High Risk')     return styles.badgeDanger;
    if (level === 'Moderate Risk') return styles.badgeWarning;
    return styles.badgeSuccess;
  };

  const getConfColor = (score: number) =>
    score >= 70 ? 'var(--danger)' : score >= 40 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className={styles.pageShell}>
      <div className={`${styles.inner} animate-in`}>

        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.titleBlock}>
            <p className={styles.pageEyebrow}>
              <LayoutDashboard size={12} style={{ display:'inline', marginRight:4 }} />
              Scan Dashboard
            </p>
            <h1 className={styles.pageTitle}>Patient Scan History</h1>
            <p className={styles.pageSubtitle}>All retinal analyses with risk classifications and confidence scores.</p>
          </div>
          <Link href="/upload" className="btn-primary">
            New Scan <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stat cards */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} animate-in delay-1`}>
            <div className={`${styles.statIconWrap} ${styles.iconBlue}`}>
              <ScanLine size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Scans</span>
              <span className={styles.statValue}>{scans.length}</span>
            </div>
          </div>

          <div className={`${styles.statCard} animate-in delay-2`}>
            <div className={`${styles.statIconWrap} ${styles.iconRed}`}>
              <AlertTriangle size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>High Risk</span>
              <span className={`${styles.statValue} ${styles.statDanger}`}>{highRisk}</span>
            </div>
          </div>

          <div className={`${styles.statCard} animate-in delay-3`}>
            <div className={`${styles.statIconWrap} ${styles.iconYellow}`}>
              <Activity size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Moderate Risk</span>
              <span className={`${styles.statValue} ${styles.statWarning}`}>{modRisk}</span>
            </div>
          </div>

          <div className={`${styles.statCard} animate-in delay-4`}>
            <div className={`${styles.statIconWrap} ${styles.iconGreen}`}>
              <CheckCircle2 size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Low Risk</span>
              <span className={`${styles.statValue} ${styles.statSuccess}`}>{lowRisk}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`${styles.tableSection} animate-in delay-2`}>
          <div className={styles.tableSectionHeader}>
            <span className={styles.tableSectionTitle}>All Scans</span>
            <span className={styles.tableSectionCount}>{scans.length} records</span>
          </div>

          {scans.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}><ScanLine size={36} /></div>
              <h3>No scans yet</h3>
              <p>Upload your first retinal fundus image to start building your screening history.</p>
              <Link href="/upload" className="btn-primary">
                Upload Image <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Eye</th>
                    <th>Risk Level</th>
                    <th>Confidence</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan) => {
                    const parseDate = (d: string) => new Date(d.includes(' ') ? d.replace(' ', 'T') + 'Z' : d);
                    
                    // Try to find the other eye from the same session
                    const otherEye = scans.find(s => 
                      s.patientId === scan.patientId && 
                      s.id !== scan.id && 
                      Math.abs(parseDate(s.createdAt).getTime() - parseDate(scan.createdAt).getTime()) < 10000
                    );

                    const dateObj = parseDate(scan.createdAt);

                    return (
                      <tr key={scan.id}>
                        <td>
                          <div style={{ display:'flex', flexDirection:'column' }}>
                            <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>{scan.patientName || 'Anonymous'}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>ID: {scan.patientId}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.dateCell}>
                            <Calendar size={13} />
                            {dateObj.toLocaleString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td>
                          <div className={styles.eyeCell}>
                            <span className={styles.eyeIcon}>{scan.eye === 'left' ? 'L' : 'R'}</span>
                            <span className={styles.eyeText}>{scan.eye.toUpperCase()}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${getBadgeClass(scan.riskLevel)}`}>
                            {scan.riskLevel}
                          </span>
                        </td>
                        <td>
                          <div className={styles.confWrap}>
                            <div className={styles.confBar}>
                              <div
                                className={styles.confFill}
                                style={{ width: `${scan.confidenceScore}%`, backgroundColor: getConfColor(scan.confidenceScore) }}
                              />
                            </div>
                            <span className={styles.confText}>{scan.confidenceScore}%</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            <Link href={`/results/${scan.id}`} className={styles.viewBtn}>
                              <Eye size={14} /> View Report
                            </Link>
                            {otherEye && (
                              <Link 
                                href={`/results/combined?left=${scan.eye === 'left' ? scan.id : otherEye.id}&right=${scan.eye === 'right' ? scan.id : otherEye.id}`} 
                                className={styles.combinedBtn}
                                title="View combined report for both eyes"
                              >
                                <FileText size={14} /> Combined
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
