// Apply pass 5 — Extensions UI for Estate backlog (vault, LTC, multistate, etc.)
import React, { useEffect, useState } from 'react';
import AIFieldPresets, { completeExample } from './AIFieldPresets';
import AIResultView from './AIResultView';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
function authH() {
  const t = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}
async function api(path, opts = {}) {
  const r = await fetch(`${API}${path}`, { ...opts, headers: authH() });
  let body; try { body = await r.json(); } catch { body = {}; }
  return { ok: r.ok, status: r.status, body };
}

const ResultCard = ({ data, title, label = 'Result' }) => (
  <AIResultView response={data} title={title} label={label} model={data?.model} tokens={data?.usage} />
);

export default function Extensions() {
  const [tab, setTab] = useState('vault');
  const tabs = [
    { id: 'vault', label: 'Document Vault' },
    { id: 'legal', label: 'Multi-State Legal' },
    { id: 'ltc', label: 'Long-Term Care' },
    { id: 'consol', label: 'Consolidation' },
    { id: 'family', label: 'Family Meeting' },
    { id: 'portal', label: 'Beneficiary Portal' },
    { id: 'intl', label: 'International' }
  ];
  return (
    <div style={{ padding: 24 }}>
      <h2>Extensions <small style={{ color: '#94a3b8', fontWeight: 400 }}>(pass 5 backlog)</small></h2>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1',
                     background: tab === t.id ? '#1e40af' : '#f8fafc',
                     color: tab === t.id ? 'white' : 'inherit', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'vault' && <Vault />}
      {tab === 'legal' && <Legal />}
      {tab === 'ltc' && <LTC />}
      {tab === 'consol' && <Consol />}
      {tab === 'family' && <Family />}
      {tab === 'portal' && <Portal />}
      {tab === 'intl' && <Intl />}
    </div>
  );
}

function Vault() {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState('Will draft');
  const [content, setContent] = useState('Plain-text contents to encrypt at rest...');
  const [last, setLast] = useState(null);
  async function load() { setList((await api('/ext/vault/list')).body || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h3>Document Vault (envelope-encrypted)</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="title" style={{ width: '100%', marginBottom: 8 }} />
      <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} style={{ width: '100%' }} />
      <button onClick={async () => { await api('/ext/vault/upload', { method: 'POST', body: JSON.stringify({ title, content, category: 'general' }) }); load(); }}>Encrypt + store</button>
      <ResultCard data={list} title="Stored vault documents" />
      <h4>Decrypt</h4>
      {list.map(d => <button key={d.id} onClick={async () => setLast((await api(`/ext/vault/${d.id}`)).body)} style={{ marginRight: 6, marginBottom: 6 }}>{d.title}</button>)}
      <ResultCard data={last} title="Decrypted document" />
    </div>
  );
}
function Legal() {
  const [j, setJ] = useState('US-CA');
  const [scenario, setScenario] = useState('A married couple with minor children, a home, retirement accounts, and digital assets.');
  const [info, setInfo] = useState(null);
  const [s, setS] = useState(null);
  const fields = [
    { name: 'jurisdiction', label: 'Jurisdiction', type: 'text', required: true },
    { name: 'scenario', label: 'Estate scenario', type: 'textarea' },
  ];
  const samples = [
    { label: 'California family', jurisdiction: 'US-CA', scenario: 'A married couple with two minor children, a primary residence, retirement accounts, life insurance, and digital assets.' },
    { label: 'New York business owner', jurisdiction: 'US-NY', scenario: 'A single business owner has a closely held company, a condominium, charitable goals, and beneficiaries in two states.' },
    { label: 'Florida retirement plan', jurisdiction: 'US-FL', scenario: 'A retired couple has a homestead, retirement accounts, a revocable trust, long-term-care concerns, and adult children.' },
  ];
  const fill = (sample, index) => {
    const values = completeExample(fields, sample, index, 'multi-state legal summary', { jurisdiction: j, scenario });
    setJ(values.jurisdiction);
    setScenario(values.scenario);
  };
  return (
    <div>
      <h3>Multi-State Legal Compliance</h3>
      <AIFieldPresets fields={fields} samples={samples} onFill={fill} context="multi-state legal summary" />
      <label className="form-group">Jurisdiction<input className="form-control" value={j} onChange={e => setJ(e.target.value)} placeholder="US-CA" /></label>
      <label className="form-group">Estate scenario<textarea className="form-control" value={scenario} onChange={e => setScenario(e.target.value)} /></label>
      <button onClick={async () => setInfo((await api('/ext/legal/jurisdiction-info?jurisdiction=' + encodeURIComponent(j))).body)}>Provider status / info</button>{' '}
      <button onClick={async () => setS((await api('/ext/ai/multistate-summary', { method: 'POST', body: JSON.stringify({ jurisdiction: j, scenario }) })).body)}>AI summary</button>
      <ResultCard data={info} title="Jurisdiction provider information" />
      <ResultCard data={s} title="Multi-state legal summary" label="AI generated" />
    </div>
  );
}
function LTC() {
  const [form, setForm] = useState({
    scenario_name: 'Skilled nursing planning', monthly_cost: 9000, years: 5, inflation: 0.04,
    age_now: 60, expected_age_of_need: 80, assets: '$650,000 liquid savings plus retirement accounts', insurance: 'No current long-term-care policy',
  });
  const [proj, setProj] = useState(null);
  const [adv, setAdv] = useState(null);
  const fields = [
    { name: 'scenario_name', label: 'Scenario name', type: 'text', required: true },
    { name: 'monthly_cost', label: 'Monthly cost', type: 'number', min: 1, required: true },
    { name: 'years', label: 'Years of care', type: 'number', min: 1, required: true },
    { name: 'inflation', label: 'Annual inflation', type: 'number', min: 0, max: 1, required: true },
    { name: 'age_now', label: 'Current age', type: 'number', min: 18, max: 120, required: true },
    { name: 'expected_age_of_need', label: 'Expected age of need', type: 'number', min: 18, max: 120, required: true },
    { name: 'assets', label: 'Liquid assets', type: 'textarea' },
    { name: 'insurance', label: 'Existing coverage', type: 'textarea' },
  ];
  const samples = [
    { label: 'Home care plan', scenario_name: 'Home care planning', monthly_cost: 6500, years: 4, inflation: 0.035, age_now: 58, expected_age_of_need: 78, assets: '$500,000 liquid savings and retirement accounts', insurance: 'No current long-term-care policy' },
    { label: 'Assisted living plan', scenario_name: 'Assisted living planning', monthly_cost: 8500, years: 5, inflation: 0.04, age_now: 64, expected_age_of_need: 80, assets: '$750,000 liquid assets plus home equity', insurance: 'Hybrid life and long-term-care policy under review' },
    { label: 'Skilled nursing plan', scenario_name: 'Skilled nursing planning', monthly_cost: 12000, years: 6, inflation: 0.05, age_now: 68, expected_age_of_need: 82, assets: '$1,100,000 diversified retirement and taxable savings', insurance: 'Traditional policy with a three-year benefit period' },
  ];
  const set = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const fill = (sample, index) => setForm(completeExample(fields, sample, index, 'long-term care advisory', form));
  const runProjection = async () => setProj((await api('/ext/ltc/project', { method: 'POST', body: JSON.stringify(form) })).body);
  const runAdvisory = async () => setAdv((await api('/ext/ai/ltc-advisory', { method: 'POST', body: JSON.stringify({ projected_total: proj?.projected_total || 0, years: Number(form.years), age_of_need: Number(form.expected_age_of_need), assets: form.assets, insurance: form.insurance }) })).body);
  return (
    <div>
      <h3>Long-Term Care Cost Modeling</h3>
      <AIFieldPresets fields={fields} samples={samples} onFill={fill} context="long-term care advisory" />
      <div className="form-row">
        {fields.map((field) => (
          <div className="form-group" key={field.name}>
            <label htmlFor={`ltc-${field.name}`}>{field.label}{field.required ? ' *' : ''}</label>
            {field.type === 'textarea'
              ? <textarea id={`ltc-${field.name}`} className="form-control" value={form[field.name]} onChange={(event) => set(field.name, event.target.value)} />
              : <input id={`ltc-${field.name}`} className="form-control" type={field.type} min={field.min} max={field.max} step={field.name === 'inflation' ? '0.001' : '1'} value={form[field.name]} onChange={(event) => set(field.name, event.target.value)} />}
          </div>
        ))}
      </div>
      <button onClick={runProjection}>Project costs</button>{' '}
      <button onClick={runAdvisory}>AI advisory</button>
      <ResultCard data={proj} title="Long-term care projection" />
      <ResultCard data={adv} title="Long-term care advisory" label="AI generated" />
    </div>
  );
}
function Consol() {
  const [r, setR] = useState(null);
  return (
    <div>
      <h3>Account Consolidation</h3>
      <button onClick={async () => setR((await api('/ext/ai/account-consolidate', { method: 'POST', body: '{}' })).body)}>Recommend</button>
      <ResultCard data={r} title="Account consolidation recommendation" label="AI generated" />
    </div>
  );
}
function Family() {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState('Q2 family review');
  const [agenda, setAgenda] = useState('Estate review and Q&A');
  const [att, setAtt] = useState('[{"name":"Alice","email":"a@e.com","relationship":"daughter"}]');
  const [attendeeCount, setAttendeeCount] = useState(3);
  const [sensitiveTopics, setSensitiveTopics] = useState('Unequal distributions, executor roles, and privacy boundaries');
  const [ai, setAI] = useState(null);
  const aiFields = [
    { name: 'topic', label: 'Meeting topic', type: 'text', required: true },
    { name: 'attendee_count', label: 'Attendee count', type: 'number', min: 1, required: true },
    { name: 'sensitive_topics', label: 'Sensitive topics', type: 'textarea' },
  ];
  const aiSamples = [
    { label: 'Annual family review', topic: 'Annual estate plan review', attendee_count: 4, sensitive_topics: 'Document updates, executor readiness, and communication preferences' },
    { label: 'Inheritance discussion', topic: 'Inheritance expectations and family responsibilities', attendee_count: 6, sensitive_topics: 'Unequal distributions, family business roles, and conflict prevention' },
    { label: 'Digital legacy meeting', topic: 'Digital legacy access and privacy planning', attendee_count: 5, sensitive_topics: 'Account access, private archives, designated contacts, and executor authority' },
  ];
  const fillAI = (sample, index) => {
    const values = completeExample(aiFields, sample, index, 'family meeting agenda', { topic: title, attendee_count: attendeeCount, sensitive_topics: sensitiveTopics });
    setTitle(values.topic);
    setAttendeeCount(values.attendee_count);
    setSensitiveTopics(values.sensitive_topics);
  };
  async function load() { setList((await api('/ext/family-meetings')).body || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h3>Family Meeting Coordinator</h3>
      <AIFieldPresets fields={aiFields} samples={aiSamples} onFill={fillAI} context="family meeting agenda" />
      <div className="form-group"><label htmlFor="family-title">Title / AI topic</label><input id="family-title" className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="title" /></div>
      <div className="form-group"><label htmlFor="family-agenda">Saved meeting agenda</label><input id="family-agenda" className="form-control" value={agenda} onChange={e => setAgenda(e.target.value)} placeholder="agenda" /></div>
      <div className="form-group"><label htmlFor="family-attendees">Saved attendees JSON</label><textarea id="family-attendees" className="form-control" value={att} onChange={e => setAtt(e.target.value)} rows={3} /></div>
      <div className="form-row">
        <div className="form-group"><label htmlFor="family-count">AI attendee count</label><input id="family-count" className="form-control" type="number" min="1" value={attendeeCount} onChange={e => setAttendeeCount(e.target.value)} /></div>
        <div className="form-group"><label htmlFor="family-sensitive">AI sensitive topics (optional)</label><textarea id="family-sensitive" className="form-control" value={sensitiveTopics} onChange={e => setSensitiveTopics(e.target.value)} /></div>
      </div>
      <button onClick={async () => { let parsed = []; try { parsed = JSON.parse(att); } catch {}; await api('/ext/family-meetings', { method: 'POST', body: JSON.stringify({ title, agenda, attendees: parsed }) }); load(); }}>Schedule</button>{' '}
      <button onClick={async () => setAI((await api('/ext/ai/family-meeting-agenda', { method: 'POST', body: JSON.stringify({ topic: title, attendee_count: Number(attendeeCount), sensitive_topics: sensitiveTopics }) })).body)}>AI agenda</button>
      <ResultCard data={list} title="Saved family meetings" />
      <ResultCard data={ai} title="Family meeting agenda" label="AI generated" />
    </div>
  );
}
function Portal() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  async function load() { setList((await api('/ext/beneficiary-portal/list')).body || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h3>Beneficiary Portal Invites</h3>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="beneficiary name" style={{ width: '60%', marginRight: 8 }} />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" style={{ width: '35%' }} />
      <div style={{ marginTop: 8 }}>
        <button onClick={async () => { await api('/ext/beneficiary-portal/invite', { method: 'POST', body: JSON.stringify({ beneficiary_name: name, beneficiary_email: email }) }); load(); }}>Create invite</button>
      </div>
      <ResultCard data={list} title="Beneficiary portal invitations" />
      <p style={{ color: '#64748b' }}>Activate via POST /api/ext/beneficiary-portal/&lt;id&gt;/activate. Public view at /api/ext-public/beneficiary-portal/view/&lt;token&gt;.</p>
    </div>
  );
}
function Intl() {
  const [list, setList] = useState([]);
  const [c, setC] = useState('UK');
  const [r, setR] = useState('citizen');
  const [s, setS] = useState(null);
  async function load() { setList((await api('/ext/intl/jurisdictions')).body || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h3>International Planning</h3>
      <input value={c} onChange={e => setC(e.target.value)} placeholder="country" style={{ width: '60%', marginRight: 8 }} />
      <input value={r} onChange={e => setR(e.target.value)} placeholder="residency status" style={{ width: '35%' }} />
      <div style={{ marginTop: 8 }}>
        <button onClick={async () => { await api('/ext/intl/jurisdictions', { method: 'POST', body: JSON.stringify({ country: c, residency_status: r }) }); load(); }}>Add jurisdiction</button>{' '}
        <button onClick={async () => setS((await api('/ext/ai/intl-treaty-summary', { method: 'POST', body: '{}' })).body)}>AI treaty summary</button>
      </div>
      <ResultCard data={list} title="International jurisdictions" />
      <ResultCard data={s} title="International treaty summary" label="AI generated" />
    </div>
  );
}
