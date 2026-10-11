'use client';

import { useState } from 'react';
import { downloadAppointmentPdf } from '@/lib/pdf';

export default function DownloadAppointmentPdfButton({ appointment, className = 'btn btn-outline-navy btn-sm' }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await downloadAppointmentPdf(appointment);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? 'Preparing...' : '⬇ Download PDF'}
    </button>
  );
}
