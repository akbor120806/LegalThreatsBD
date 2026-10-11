'use client';

import { useState } from 'react';
import { downloadDocumentPdf } from '@/lib/pdf';

export default function DownloadDocumentPdfButton({ document: doc, className = 'btn btn-navy btn-sm' }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await downloadDocumentPdf(doc);
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
