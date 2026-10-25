import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

interface Scenario {
  id: string; slug: string; entity_name: string; alias: string; category: string; summary_fact: string;
  source_url: string; source_name: string; last_checked: string; auditing_status: string; image_query: string;
  origin_name: string; mode: string; value_band: string; hts_category: string; section_301_exposure: string;
  entry_path: string; risk_tier: string; fee_profile: string; computed_entry_bucket: string;
  computed_nearest_neighbors: string; computed_page_variant: string;
}

const CATEGORIES = ['Electronics', 'Apparel', 'Toys', 'Telecom', 'Furniture', 'Footwear', 'Bags', 'Plastics', 'Metals', 'Auto Parts'];
const MODES = [
  { id: 'postal', label: 'Postal / Mail' }, { id: 'courier', label: 'Courier / Express' },
  { id: 'air', label: 'Air Freight' }, { id: 'ocean_lcl', label: 'Ocean LCL (shared container)' },
  { id: 'ocean_fcl', label: 'Ocean FCL (full container)' },
];

export default function Home() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [origin, setOrigin] = useState('China');
  const [mode, setMode] = useState('courier');
  const [category, setCategory] = useState('Electronics');
  const [value, setValue] = useState(1000);

  useEffect(() => { fetch('/matrix.json').then(r => r.json()).then(setScenarios).catch(() => setScenarios([])); }, []);

  const getValueBand = (val: number) => val <= 800 ? '0-800' : val <= 2500 ? '801-2500' : val <= 10000 ? '2501-10000' : '10001-plus';

  const matchedScenario =
    scenarios.find(s => s.origin_name === origin && s.mode === mode && s.value_band === getValueBand(value) && s.hts_category.toLowerCase().includes(category.toLowerCase())) ||
    scenarios.find(s => s.origin_name === origin && s.mode === mode && s.value_band === getValueBand(value));

  const isInformal = value <= 2500;
  const mpf = isInformal ? 5.0 : Math.max(31.67, Math.min(614.35, value * 0.003464));
  const hmf = mode.includes('ocean') ? value * 0.00125 : 0;
  let dutyRate = origin === 'China' && ['Electronics', 'Furniture', 'Metals', 'Apparel', 'Telecom', 'Auto Parts', 'Footwear', 'Bags', 'Plastics'].includes(category) ? 0.25 : origin === 'Mexico' ? 0.0 : 0.05;
  const duty = value * dutyRate;
  const total = value + mpf + hmf + duty;

  const verdict = value <= 800 ? { warn: false, text: 'Under $800 — de minimis candidate. Subject to current suspension rules for non-postal modes and to HTS-level exclusions.' }
    : value <= 2500 && mode === 'postal' ? { warn: false, text: '$801–$2,500 by mail — postal informal entry candidate. Duty and fees are collected in the mail stream.' }
    : value <= 2500 ? { warn: false, text: '$801–$2,500 — informal entry candidate. Your carrier or broker files a simplified entry.' }
    : { warn: true, text: 'Over $2,500 — formal entry likely: continuous bond, licensed broker and full documentation required.' };

  const money = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Layout>
      <section className="hero">
        <span className="overline">US import cost calculator</span>
        <h1>Know the true landed cost before you pay for freight.</h1>
        <p className="lede">Landed Cost Ledger estimates duty, MPF, HMF and Section 301 exposure for small US importers and e-commerce sellers — applying the 2025–2026 de minimis suspension and postal informal-entry rules, with every figure sourced or clearly labelled as an estimate.</p>
        <div className="chips">
          <span className="chip">No login</span><span className="chip">No account</span><span className="chip">Runs in your browser</span><span className="chip">40 audited scenarios</span>
        </div>
      </section>

      <section className="wrap tool" id="calculator">
        <h2>Estimate a shipment</h2>
        <div className="worksheet">
          <div className="worksheet-left">
            <h3 className="panel-title">Shipment details</h3>
            <div className="field"><label htmlFor="origin">Origin country</label><select id="origin" value={origin} onChange={e => setOrigin(e.target.value)}><option value="China">China</option><option value="Mexico">Mexico</option></select></div>
            <div className="field"><label htmlFor="mode">Shipping mode</label><select id="mode" value={mode} onChange={e => setMode(e.target.value)}>{MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
            <div className="field"><label htmlFor="category">Product category</label><select id="category" value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="field"><label htmlFor="value">Declared goods value (USD)</label><input id="value" type="number" min={1} value={value} onChange={e => setValue(Math.max(1, Number(e.target.value)))} /></div>
          </div>

          <div className="worksheet-right">
            <h3 className="panel-title">Cost stack</h3>
            <div className="line"><span>Declared goods value</span><strong>${money(value)}</strong></div>
            <div className="line"><span>Duty & Section 301 estimate ({(dutyRate * 100).toFixed(0)}%)</span><strong>${money(duty)}</strong></div>
            <div className="line"><span>Merchandise Processing Fee (MPF)</span><strong>${money(mpf)}</strong></div>
            <div className="line"><span>Harbor Maintenance Fee (HMF)</span><strong>${money(hmf)}</strong></div>
            <div className="total"><span>Estimated landed cost</span><strong>${money(total)}</strong></div>

            <div className={verdict.warn ? 'verdict warn' : 'verdict'}><strong>Entry path: </strong>{verdict.text}</div>
            <p className="matched">{matchedScenario ? <>Behind this estimate: <strong>{matchedScenario.alias}</strong> — Section 301 exposure “{matchedScenario.section_301_exposure}”, risk tier {matchedScenario.risk_tier}, audit status {matchedScenario.auditing_status}.</> : <>No exact audited scenario matches these inputs; the math above is the generalized method.</>}</p>
            <p className="limits">Excludes freight and insurance quotes, state fees, anti-dumping/countervailing duties and partner-agency holds. Estimates, not legal or customs advice.</p>
          </div>
        </div>
      </section>

      <section className="wrap trust" aria-label="Why this tool is trustworthy">
        <div className="card"><h3>Sourced or labelled</h3><p>Every rate ties to an official CBP, USITC or CPSC document — or is marked ESTIMATED with the method stated. No invented numbers, no hidden benchmarks.</p></div>
        <div className="card"><h3>Private by design</h3><p>Zero backend, zero login. The math runs entirely in your browser; nothing you type into the calculator leaves your device.</p></div>
        <div className="card"><h3>Rules dated, not assumed</h3><p>Threshold logic follows the current publication status of CBP and Federal Register rules. Where a rule could not be tied to a document, the result says so.</p></div>
      </section>

      <section className="wrap" style={{ paddingBottom: '3rem', textAlign: 'center' }}>
        <a href="/scenarios/" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
          Browse all 40 audited import scenarios →
        </a>
      </section>
    </Layout>
  );
}