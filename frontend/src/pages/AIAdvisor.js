import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AIFieldPresets, { completeExample } from './AIFieldPresets';
import AIResultView from './AIResultView';

const ADVISOR_FIELDS = [
  { name: 'question', label: 'Estate planning question', type: 'textarea', required: true },
];

const ADVISOR_PRESETS = [
  { label: 'Digital legacy review', question: 'Review a fictional estate with cryptocurrency, cloud storage, social accounts, and family photo archives. Explain a practical digital-asset inventory, access, beneficiary, privacy, and executor plan, including questions for licensed counsel.' },
  { label: 'Family protection plan', question: 'For a fictional married couple with two minor children, a primary residence, retirement accounts, and life insurance, outline the will, guardianship, beneficiary, trust, and annual review decisions they should discuss with licensed professionals.' },
  { label: 'Executor readiness audit', question: 'Create a detailed executor-readiness checklist for a fictional multi-state estate. Cover documents, account access, asset valuation, deadlines, communications, tax coordination, digital legacy, and unresolved information without treating the example as legal advice.' },
];

export default function AIAdvisor() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('advisor');

  useEffect(() => {
    api.get('/ai/history').then(res => setHistory(res.data)).catch(() => {});
  }, []);

  const askQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/estate-advice', { question });
      setResult(res.data);
      const histRes = await api.get('/ai/history');
      setHistory(histRes.data);
    } catch (err) {
      setResult({ content: 'Error: ' + (err.response?.data?.error || err.message), model: 'Error' });
    }
    setLoading(false);
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    setSummary(null);
    try {
      const res = await api.post('/ai/estate-summary', {});
      setSummary(res.data);
    } catch (err) {
      setSummary({ content: 'Error: ' + (err.response?.data?.error || err.message), model: 'Error' });
    }
    setSummaryLoading(false);
  };

  const quickPrompts = [
    'What are the key components of a comprehensive estate plan?',
    'How do I protect my digital assets after death?',
    'What is the difference between a will and a living trust?',
    'How often should I review my estate plan?',
    'What are the tax implications of inheritance?',
    'How do I choose the right executor for my will?',
    'What is a power of attorney and do I need one?',
    'How can I minimize estate taxes legally?',
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🤖 AI Estate Advisor</h2>
          <p>Get expert AI-powered estate planning guidance</p>
        </div>
        <button className="btn btn-purple" onClick={generateSummary} disabled={summaryLoading}>
          {summaryLoading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div> Generating...</> : '📊 Generate Estate Summary'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className={`btn ${activeTab === 'advisor' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('advisor')}>AI Advisor</button>
        <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('history')}>Chat History ({history.length})</button>
      </div>

      {activeTab === 'advisor' && (
        <>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Ask the AI Estate Advisor</h3>
            <AIFieldPresets
              fields={ADVISOR_FIELDS}
              samples={ADVISOR_PRESETS}
              disabled={loading}
              context="AI estate advisor"
              onFill={(sample, index) => setQuestion(completeExample(ADVISOR_FIELDS, sample, index, 'AI estate advisor', { question }).question)}
            />
            <form onSubmit={askQuestion}>
              <textarea data-ai-field={"question"}
                className="form-control"
                placeholder="Ask any estate planning question..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                style={{ minHeight: '100px', marginBottom: '12px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={loading || !question.trim()}>
                  {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div> Thinking...</> : 'Ask AI Advisor'}
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-muted)' }}>Quick Questions</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickPrompts.map((q, i) => (
                <button key={i} className="btn btn-secondary btn-sm" onClick={() => { setQuestion(q); }} style={{ fontSize: '12px' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {loading && <div className="loading-spinner"><div className="spinner"></div>AI is analyzing your question...</div>}
          <AIResultView
            response={result}
            title="Estate advisor response"
            label="AI Estate Advisor"
            model={result?.model}
            tokens={result?.usage}
          />

          {summaryLoading && <div className="loading-spinner"><div className="spinner"></div>Generating comprehensive estate summary...</div>}
          <AIResultView
            response={summary}
            title="Estate plan summary"
            label="Portfolio report"
            model={summary?.model}
            tokens={summary?.usage}
          />
        </>
      )}

      {activeTab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div className="empty-state">
              <h3>No AI chat history yet</h3>
              <p>Start asking questions to build your history</p>
            </div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="status-badge status-active">{h.feature.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(h.created_at).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <strong>Prompt:</strong> {h.prompt?.substring(0, 200)}{h.prompt?.length > 200 ? '...' : ''}
                </div>
                <AIResultView
                  response={h.response}
                  title={h.feature.replace(/_/g, ' ')}
                  label="Saved AI response"
                  model={h.model}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
