/**
 * API Configuration
 * Replace the LOCAL_URL with your production backend URL during deployment.
 * You can also use environment variables for better management.
 */

const IS_PROD = process.env.NODE_ENV === 'production';

// In Next.js, environment variables prefixed with NEXT_PUBLIC_ are available in the browser.
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  PREDICT: `${BACKEND_URL}/predict`,
  HISTORY: `${BACKEND_URL}/history`,
  REPORT: (id: string | number) => `${BACKEND_URL}/report/${id}`,
};

export default BACKEND_URL;
