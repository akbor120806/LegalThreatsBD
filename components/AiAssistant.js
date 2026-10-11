'use client';

import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function AiAssistant() {
  const { t } = useLanguage();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setError('');
    const nextMessages = [...messages, { role: 'user', content: q }];
    setMessages(nextMessages);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history: messages }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || 'Something went wrong.');
        setMessages(messages); // roll back the optimistic user message on failure
        return;
      }
      setMessages([...nextMessages, { role: 'assistant', content: data.answer }]);
    } catch {
      setError('Something went wrong. Please try again.');
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card card-pad ai-assistant">
      <h3 style={{ marginTop: 0, color: 'var(--navy)' }}>🤖 {t('ai_title')}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: -6 }}>{t('ai_subtitle')}</p>

      {messages.length > 0 && (
        <div className="ai-messages">
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ai-msg-${m.role}`}>
              <div className="ai-msg-bubble">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="ai-msg ai-msg-assistant">
              <div className="ai-msg-bubble ai-msg-loading">{t('ai_thinking')}</div>
            </div>
          )}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="ai-input-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('ai_placeholder')}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !question.trim()}>
          {t('ai_send')}
        </button>
      </form>

      <p className="ai-disclaimer">{t('ai_disclaimer')}</p>
    </div>
  );
}
