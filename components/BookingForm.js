'use client';

import { useEffect, useState } from 'react';
import DownloadAppointmentPdfButton from './DownloadAppointmentPdfButton';

const PAYMENT_METHODS = [
  { id: 'visa', label: 'Visa Card', icon: '💳' },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
  { id: 'bkash', label: 'bKash', icon: '📱' },
  { id: 'nagad', label: 'Nagad', icon: '📱' },
  { id: 'rocket', label: 'Rocket', icon: '📱' },
];

const FEES = { online: 300, offline: 500 };
const PLATFORM_CHARGE = 50;

export default function BookingForm({ lawyer }) {
  const lawyerId = lawyer.id;
  const [step, setStep] = useState('details'); // 'details' | 'payment' | 'sent'
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [form, setForm] = useState({
    mode: 'online',
    appointment_date: '',
    appointment_time: '',
    notes: '',
    guest_name: '',
    guest_phone: '',
    guest_email: '',
  });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .finally(() => setCheckingSession(false));
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || null))
      .catch(() => {});
  }, []);

  const fee = FEES[form.mode];
  const total = fee + PLATFORM_CHARGE;

  function goToPayment(e) {
    e.preventDefault();
    setStep('payment');
  }

  async function submitBooking() {
    if (!paymentMethod || !transactionId.trim()) return;
    setStatus('sending');
    setMessage('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      fd.append('lawyer_id', lawyerId);
      fd.append('payment_method', paymentMethod);
      fd.append('payment_transaction_id', transactionId.trim());
      if (screenshot) fd.append('payment_screenshot', screenshot);

      const res = await fetch('/api/appointments', { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.ok) {
        setStatus('error');
        setMessage(data.message);
        return;
      }
      setConfirmedAppointment({
        id: data.id,
        lawyer_name: lawyer.name,
        expertise: lawyer.expertise,
        consultation_fee: lawyer.consultation_fee,
        client_name: user ? user.name : form.guest_name,
        mode: form.mode,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        status: 'pending',
        payment_status: 'submitted',
        payment_method: paymentMethod,
        payment_amount: data.payment_amount,
        payment_transaction_id: transactionId.trim(),
        notes: form.notes,
      });
      setStep('sent');
      setMessage(
        'Your appointment request and payment proof have been submitted. We will verify your payment and confirm shortly.' +
          (user ? ' Check your dashboard for status updates.' : '')
      );
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    } finally {
      setStatus(null);
    }
  }

  if (step === 'sent') {
    return (
      <div>
        <div className="alert alert-success">{message}</div>
        {confirmedAppointment && (
          <DownloadAppointmentPdfButton appointment={confirmedAppointment} className="btn btn-navy btn-block" />
        )}
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div>
        <button type="button" onClick={() => setStep('details')} className="btn btn-outline-navy btn-sm" style={{ marginBottom: 16 }}>
          ← Back
        </button>

        {message && <div className="alert alert-error">{message}</div>}

        <div className="payment-summary">
          <div>
            <span>Consultation type</span>
            <b style={{ textTransform: 'capitalize' }}>{form.mode}</b>
          </div>
          <div>
            <span>Date &amp; time</span>
            <b>{form.appointment_date} at {form.appointment_time}</b>
          </div>
          <div>
            <span>Consultation booking fee</span>
            <b>৳{fee}</b>
          </div>
          <div>
            <span>Platform charge</span>
            <b>৳{PLATFORM_CHARGE}</b>
          </div>
          <div className="payment-total">
            <span>Total to send</span>
            <b>৳{total}</b>
          </div>
        </div>

        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginTop: 18, marginBottom: 10 }}>
          1. Choose the method you'll pay with
        </p>
        <div className="payment-methods">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`payment-method-btn ${paymentMethod === m.id ? 'selected' : ''}`}
              onClick={() => setPaymentMethod(m.id)}
            >
              <span className="payment-method-icon">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {paymentMethod && settings && (
          <div className="payment-account-info">
            {paymentMethod === 'bkash' && settings.bkash_number && (
              <p>Send ৳{total} to <b>bKash</b> (Send Money): <b>{settings.bkash_number}</b></p>
            )}
            {paymentMethod === 'nagad' && settings.nagad_number && (
              <p>Send ৳{total} to <b>Nagad</b>: <b>{settings.nagad_number}</b></p>
            )}
            {paymentMethod === 'rocket' && settings.rocket_number && (
              <p>Send ৳{total} to <b>Rocket</b>: <b>{settings.rocket_number}</b></p>
            )}
            {paymentMethod === 'bank' && settings.bank_account_number && (
              <p>
                Transfer ৳{total} to: <b>{settings.bank_name}</b><br />
                A/C Name: <b>{settings.bank_account_name}</b> · A/C No: <b>{settings.bank_account_number}</b>
                {settings.bank_branch ? <> · Branch: <b>{settings.bank_branch}</b></> : null}
              </p>
            )}
            {paymentMethod === 'visa' && (
              <p>Complete your card payment through your bank's usual process, then enter the transaction/reference ID below.</p>
            )}
          </div>
        )}

        {paymentMethod && (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginTop: 20, marginBottom: 10 }}>
              2. After sending the money, tell us the transaction ID
            </p>
            <div className="form-group">
              <label>Transaction ID</label>
              <input
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 9G7H2K4L1M"
              />
            </div>
            <div className="form-group">
              <label>Payment Screenshot (optional, recommended)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              />
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '10px 0 16px' }}>
              We'll check this transaction against our account and confirm your
              appointment once the payment is verified — usually within a
              few hours.
            </p>
          </>
        )}

        <button
          type="button"
          onClick={submitBooking}
          className="btn btn-primary btn-block"
          disabled={!paymentMethod || !transactionId.trim() || status === 'sending'}
        >
          {status === 'sending' ? 'Submitting...' : 'Submit Payment Proof & Book'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={goToPayment}>
      {!checkingSession && !user && (
        <>
          <div className="alert" style={{ background: 'rgba(15,28,63,0.06)', color: 'var(--navy)', fontSize: 12.5 }}>
            You don't need an account to book — just fill in your contact details below.
            (Prefer to track your bookings later? <a href="/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>Create an account</a> instead.)
          </div>
          <div className="form-group">
            <label>Your Name</label>
            <input
              required
              value={form.guest_name}
              onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                required
                value={form.guest_phone}
                onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                placeholder="+880 ..."
              />
            </div>
            <div className="form-group">
              <label>Email (optional)</label>
              <input
                type="email"
                value={form.guest_email}
                onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>
        </>
      )}

      <div className="form-group">
        <label>Consultation Type</label>
        <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
          <option value="online">Online — ৳{FEES.online + PLATFORM_CHARGE} total (fee + platform charge)</option>
          <option value="offline">Offline (in person) — ৳{FEES.offline + PLATFORM_CHARGE} total (fee + platform charge)</option>
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            required
            value={form.appointment_date}
            onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input
            type="time"
            required
            value={form.appointment_time}
            onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Notes (optional)</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Briefly describe your case..."
        />
      </div>
      <button type="submit" className="btn btn-primary btn-block" disabled={checkingSession}>
        Continue to Payment (৳{total})
      </button>
    </form>
  );
}
