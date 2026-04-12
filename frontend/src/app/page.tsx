import Link from 'next/link';
import { ArrowRight, ScanLine, ShieldCheck, Zap, Activity } from 'lucide-react';
import styles from './landing.module.css';

export default function Home() {
  return (
    <div className={styles.landingContainer}>
      {/* Hero Section */}
      <section className={`${styles.hero} animate-in`}>
        <div className={styles.badge}>
          <Activity size={16} /> Powered by Advanced Clinical AI
        </div>
        <h1 className={styles.title}>
          The Future of <span>Retinal Screening</span> starts here.
        </h1>
        <p className={styles.subtitle}>
          Experience clinical-grade glaucoma detection from home. 
          Upload fundus images and get professional AI insights in seconds.
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/upload" className="btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1.05rem' }}>
            Start Free Screening <ArrowRight size={20} />
          </Link>
          <Link href="/history" className="btn-outline" style={{ padding: '0.9rem 2.5rem', fontSize: '1.05rem' }}>
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={`${styles.featureCard} animate-in delay-1`}>
          <div className={styles.iconWrap}>
            <Zap size={24} />
          </div>
          <h3 className={styles.featureTitle}>Instant Analysis</h3>
          <p className={styles.featureText}>
            Our neural networks process high-resolution retinal scans in under 2 seconds, detecting risk patterns earlier than traditional exams.
          </p>
        </div>

        <div className={`${styles.featureCard} animate-in delay-2`}>
          <div className={styles.iconWrap}>
            <ShieldCheck size={24} />
          </div>
          <h3 className={styles.featureTitle}>Clinical Accuracy</h3>
          <p className={styles.featureText}>
            Trained on 50,000+ clinical retinal images, achieving expert-level consistency in identifying suspicious optic nerve changes.
          </p>
        </div>

        <div className={`${styles.featureCard} animate-in delay-3`}>
          <div className={styles.iconWrap}>
            <ScanLine size={24} />
          </div>
          <h3 className={styles.featureTitle}>Dual-Eye Reports</h3>
          <p className={styles.featureText}>
            Automatically correlate left and right eye health to generate a simplified consolidated medical summary for your doctor.
          </p>
        </div>
      </section>
    </div>
  );
}
