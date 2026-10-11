'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelAppointmentButton({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm('Cancel this appointment?')) return;
    setLoading(true);
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleCancel} disabled={loading} className="btn btn-ghost btn-sm">
      {loading ? 'Cancelling...' : 'Cancel'}
    </button>
  );
}
