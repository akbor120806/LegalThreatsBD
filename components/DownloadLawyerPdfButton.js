'use client';

import { useState } from 'react';
import { downloadLawyerProfilePdf } from '@/lib/pdf';

export default function DownloadLawyerPdfButton({ lawyer, className = 'btn btn-outline-navy btn-sm' }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await downloadLawyerProfilePdf(lawyer);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? 'Preparing...' : '⬇ Download Profile (PDF)'}
    </button>
  );
}
