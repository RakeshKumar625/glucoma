import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Activity, Upload, BarChart3, FileText, Eye, Lock } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.wrapper}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`${styles.heroContent} animate-in`}>
          <div className={styles.badge}>
            <span className={styles.badgePulse}></span>
            AI — Powered Early Screening
          </div>

          <h1 className={styles.title}>
            AI-Based Early<br />
            <span className={styles.highlight}>Glaucoma Detection</span>
          </h1>

          <p className={styles.subtitle}>
            Detect early. Prevent blindness. Upload a retinal fundus image and receive a
            clinical-grade AI risk report in under 2 seconds.
          </p>

          <div className={styles.heroActions}>
            <Link href="/upload" className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}>
              Start Free Screening <ArrowRight size={18} />
            </Link>
            <Link href="/history" className="btn-outline">
              View Dashboard
            </Link>
          </div>

          <div className={styles.trustRow}>
            <div className={styles.trustItem}>
              <span className={styles.trustNum}>92%</span>
              <span className={styles.trustLabel}>Detection Accuracy</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustNum}>&lt;2s</span>
              <span className={styles.trustLabel}>Avg. Analysis Time</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustNum}>HIPAA</span>
              <span className={styles.trustLabel}>Privacy Compliant</span>
            </div>
          </div>
        </div>

        {/* Scan Card Visual */}
        <div className={`${styles.heroVisual} animate-in delay-2`}>
          <div className={styles.scanCard}>
            <div className={styles.scanCardHeader}>
              <span className={styles.scanCardTitle}>Live Retinal Analysis</span>
              <div className={styles.liveChip}>
                <span className={styles.liveChipDot}></span> Live
              </div>
            </div>

            <div className={styles.scanImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=700"
                alt="Retinal Fundus Image"
                className={styles.heroImage}
              />
              <div className={styles.scannerLine}></div>
              <div className={styles.aiChip}>⚡ AI Running</div>
              <div className={styles.metricBubble}>
                <span className={styles.metricDot}></span>
                <div className={styles.metricText}>
                  <span className={styles.metricLabel}>Risk Score</span>
                  <span className={styles.metricValue}>Low — 23%</span>
                </div>
              </div>
            </div>

            <div className={styles.scanStats}>
              <div className={styles.scanStat}>
                <span className={styles.scanStatLabel}>Cup-Disc Ratio</span>
                <span className={styles.scanStatValue}>0.42</span>
              </div>
              <div className={styles.scanStat}>
                <span className={styles.scanStatLabel}>Confidence</span>
                <span className={styles.scanStatValue}>94.7%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={styles.howSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>How It Works</span>
          <h2 className={styles.sectionTitle}>Clinical-grade screening in 3 steps</h2>
          <p className={styles.sectionSubtitle}>No equipment needed. Just a digital retinal image and our AI does the rest.</p>
        </div>
        <div className={styles.stepsGrid}>
          {[
            { icon: Upload,    title: 'Upload Retinal Image', desc: 'Drag & drop a fundus photograph in JPG or PNG format.' },
            { icon: Zap,       title: 'AI Analysis',          desc: 'Our deep learning model scans optic nerve structure in milliseconds.' },
            { icon: FileText,  title: 'Download Report',      desc: 'Receive a structured clinical report with risk score and recommendations.' },
          ].map((step, i) => (
            <div key={i} className={`${styles.stepCard} animate-in delay-${i + 1}`}>
              <div className={styles.stepNum}>{i + 1}</div>
              <div className={styles.stepIcon}><step.icon size={24} /></div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features (dark) ── */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresInner}>
          <div className={`${styles.featuresHeader} ${styles.sectionHeader}`}>
            <span className={styles.sectionTag}>Why GlacoVision</span>
            <h2 className={styles.sectionTitle}>Built for real clinical use</h2>
            <p className={styles.sectionSubtitle}>A platform trusted by clinicians and accessible to every patient.</p>
          </div>
          <div className={styles.featuresGrid}>
            {[
              { icon: Zap,        title: 'Instant Results',       desc: 'Analysis completes in under 2 seconds. No waiting, no queues.' },
              { icon: BarChart3,  title: 'Confidence Scoring',    desc: 'Probabilistic output with colour-coded risk bands and gauge visualisation.' },
              { icon: Eye,        title: 'Heatmap Overlay',       desc: 'Simulated attention map highlights suspicious retinal regions.' },
              { icon: ShieldCheck,title: 'Privacy First',         desc: 'Images processed ephemerally. Nothing stored without consent.' },
              { icon: Lock,       title: 'Audit Trail',           desc: 'Full scan history with searchable timestamps and exportable reports.' },
              { icon: Activity,   title: 'Multi-risk Detection',  desc: 'Graduated output: Low / Moderate / High with tailored clinical guidance.' },
            ].map((f, i) => (
              <div key={i} className={`${styles.featureCard} animate-in delay-${(i % 4) + 1}`}>
                <div className={styles.featureIcon}><f.icon size={22} /></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className={styles.ctaBanner}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaContent}>
            <h2>Ready to screen your first patient?</h2>
            <p>GlacoVision is free to try. No sign-up required. Upload a retinal image and get results instantly.</p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/upload" className={styles.btnWhite}>
              Start Screening <ArrowRight size={18} />
            </Link>
            <Link href="/history" className={styles.btnGhost}>
              See Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
