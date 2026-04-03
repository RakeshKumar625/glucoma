"use client";

import { Printer } from 'lucide-react';
import styles from '../app/results/[id]/results.module.css';

export default function PrintButton() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <button className={styles.printBtn} onClick={handlePrint}>
      <Printer size={16} /> Print Report
    </button>
  );
}
