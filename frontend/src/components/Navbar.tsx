import Link from 'next/link';
import { Activity, LayoutDashboard, ScanLine, Home, Menu, Zap } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Activity size={20} color="white" strokeWidth={2.5} />
          </div>
          <div className={styles.logoTextWrap}>
            <span className={styles.logoText}>Glauc<span>AI</span></span>
            <span className={styles.logoBadge}>Early Detection Platform</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            <Home size={15} /> Home
          </Link>
          <Link href="/upload" className={styles.navLink}>
            <ScanLine size={15} /> Scan
          </Link>
          <Link href="/history" className={styles.navLink}>
            <LayoutDashboard size={15} /> Dashboard
          </Link>
        </nav>

        {/* Status + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className={styles.statusDot}>
            <span className={styles.statusDotPulse}></span>
            AI Model Online
          </div>
          <Link href="/upload" className={styles.navCta}>
            <Zap size={15} /> New Scan
          </Link>
        </div>

        {/* Mobile */}
        <div className={styles.mobileMenu}>
          <Menu size={22} />
        </div>
      </div>
    </header>
  );
}
