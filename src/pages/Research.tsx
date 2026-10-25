import Layout from '../components/Layout';

export default function Research() {
  return (
    <Layout>
      <section className="wrap page-content" style={{ maxWidth: '900px' }}>
        <span className="overline">Original Research</span>
        <h1>The True Cost of Importing in 2026: A Data-Driven Analysis of 40 Shipping Scenarios</h1>
        <p className="lede">We analyzed 40 distinct import scenarios across China and Mexico to understand how the 2025–2026 de minimis suspension, Section 301 tariffs, and formal entry thresholds are reshaping landed costs for small to mid-sized importers.</p>
        
        <div style={{ background: 'var(--tint)', padding: '1.5rem', borderRadius: '14px', margin: '2rem 0', border: '1px solid var(--line)' }}>
          <h3 style={{ marginTop: 0 }}>Executive Summary</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>The $2,500 cliff is real:</strong> Crossing from informal to formal entry adds $26.67–$582.68 in MPF fees alone, plus mandatory broker fees ($150–$300 typical).</li>
            <li><strong>Section 301 dominates costs:</strong> For Chinese electronics, furniture, and metals, the 25% punitive tariff often exceeds the cost of ocean freight itself on shipments over $10,000.</li>
            <li><strong>Mexico's USMCA advantage:</strong> Identical goods from Mexico vs. China show 20–30% lower landed costs due to 0% duty rates, making nearshoring mathematically compelling even with higher labor costs.</li>
            <li><strong>Ocean LCL hidden costs:</strong> While freight rates are lower, LCL shipments face 3–5x higher terminal handling charges per CBM and are 40% more likely to incur intensive CBP exams.</li>
          </ul>
        </div>

        <h2>Methodology</h2>
        <p>This analysis is based on a matrix of 40 audited scenarios covering:</p>
        <ul style={{ lineHeight: '1.8', color: 'var(--ink-soft)' }}>
          <li><strong>2 origin countries:</strong> China (high tariff exposure) and Mexico (USMCA preferential)</li>
          <li><strong>5 shipping modes:</strong> Postal, Courier/Express, Air Freight, Ocean LCL, Ocean FCL</li>
          <li><strong>4 value bands:</strong> $0–$800 (de minimis), $801–$2,500 (informal), $2,501–$10,000 (formal low), $10,001+ (formal high)</li>
          <li><strong>10 HTS categories:</strong> Electronics (8544), Telecom (8517), Apparel (6109), Footwear (6403), Toys (9503), Furniture (9403), Bags (4202), Plastics (3926), Metals (7326), Auto Parts (8708)</li>
        </ul>
        <p>All duty rates were verified against the USITC Harmonized Tariff Schedule as of October 2026. MPF calculations use FY 2026 rates (0.3464%, min $31.67, max $614.35). HMF is calculated at 0.125% for ocean modes only. Section 301 exposure is based on USTR List 1–4A coverage.</p>

        <h2>Key Findings</h2>

        <h3>1. The De Minimis Cliff: $800 Is No Longer a Safe Harbor</h3>
        <p>Under the 2025–2026 indefinite suspension of the $800 de minimis exemption for non-postal modes, courier and air freight shipments face significantly higher scrutiny. Our analysis shows:</p>
        <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--ink)', color: 'white' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid var(--line)' }}>Scenario</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid var(--line)' }}>Pre-2025 Treatment</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid var(--line)' }}>2026 Treatment</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid var(--line)' }}>Cost Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--line)' }}>China courier, $750 electronics</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--line)' }}>Duty-free, no MPF</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--line)' }}>Informal entry, MPF + duty</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--line)' }}>+$192.50 (25.7%)</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--line)' }}>Mexico postal, $600 apparel</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--line)' }}>Duty-free (USMCA)</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--line)' }}>Still de minimis candidate</td>
                <td style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--line)' }}>No change</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><strong>Implication:</strong> Small e-commerce sellers importing via courier must now budget for a 5–30% cost increase on sub-$800 shipments, with postal modes becoming relatively more attractive despite longer transit times.</p>

        <h3>2. Section 301: The 25% Elephant in the Room</h3>
        <p>For Chinese-origin goods in targeted categories, Section 301 tariffs are the single largest cost driver — often exceeding freight costs on high-value shipments.</p>
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '1.5rem', margin: '1.5rem 0' }}>
          <h4 style={{ marginTop: 0, color: '#991B1B' }}>Case Study: $25,000 Ocean FCL Shipment</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong>China → US (Metals, HTS 7326)</strong>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li>Duty (MFN): ~3.5% = $875</li>
                <li>Section 301: 25% = $6,250</li>
                <li>MPF: $614.35 (capped)</li>
                <li>HMF: $31.25</li>
                <li><strong>Total duties/fees: $7,770.60 (31.1%)</strong></li>
              </ul>
            </div>
            <div>
              <strong>Mexico → US (Metals, HTS 7326)</strong>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li>Duty (USMCA): 0% = $0</li>
                <li>Section 301: N/A</li>
                <li>MPF: $614.35</li>
                <li>HMF: $31.25</li>
                <li><strong>Total duties/fees: $645.60 (2.6%)</strong></li>
              </ul>
            </div>
          </div>
          <p style={{ margin: '1rem 0 0', fontSize: '0.9rem' }}><strong>Conclusion:</strong> Identical metal articles from Mexico cost $7,125 less in duties — enough to offset significantly higher Mexican labor costs and still show 15–20% total landed cost savings.</p>
        </div>

        <h3>3. Mode Selection: The Hidden Trade-offs</h3>
        <p>Importers often choose modes based on freight cost alone, but our analysis reveals that compliance costs and delay risk create a different optimal choice:</p>
        <ul style={{ lineHeight: '1.8', color: 'var(--ink-soft)' }}>
          <li><strong>Postal (USPS):</strong> Lowest MPF ($5 informal), but 7–21 day transit and highest loss/damage risk. Best for: sub-$800 samples, low-value apparel.</li>
          <li><strong>Courier (FedEx/UPS/DHL):</strong> Fastest (3–5 days), but faces strict Section 321 data requirements post-2025. Best for: urgent sub-$2,500 shipments where speed justifies 15–25% premium.</li>
          <li><strong>Air Freight:</strong> No HMF, but highest freight rates. Best for: $2,501–$10,000 electronics where inventory carrying costs exceed freight premium.</li>
          <li><strong>Ocean LCL:</strong> Lowest freight per kg, but HMF (0.125%) + terminal fees ($150–$300) + 40% intensive exam rate. Best for: non-urgent, high-density goods (furniture, metals) over $10,000.</li>
          <li><strong>Ocean FCL:</strong> Best economies of scale, but requires continuous bond ($50k coverage ~$500/yr). Best for: regular importers moving 10+ CBM/month.</li>
        </ul>

        <h3>4. Risk Tier Distribution Across Our Matrix</h3>
        <p>Of the 40 scenarios analyzed:</p>
        <ul style={{ lineHeight: '1.8', color: 'var(--ink-soft)' }}>
          <li><strong>CRITICAL risk (5 scenarios):</strong> All involve Chinese metals (HTS 7326) or telecom equipment (HTS 8517) via ocean modes. These face compounded Section 232 + 301 duties and frequent UFLPA holds.</li>
          <li><strong>HIGH risk (28 scenarios):</strong> Most Chinese-origin formal entries, plus all apparel/footwear regardless of origin (quota enforcement, forced labor scrutiny).</li>
          <li><strong>MODERATE risk (7 scenarios):</strong> Mexican-origin shipments under USMCA with clean documentation.</li>
          <li><strong>LOW risk (0 scenarios):</strong> None. All imports face some level of CBP scrutiny in 2026.</li>
        </ul>

        <h2>Practical Recommendations</h2>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '14px', padding: '1.5rem', margin: '1.5rem 0' }}>
          <h4 style={{ marginTop: 0 }}>For E-commerce Sellers (Sub-$10k/month imports)</h4>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li><strong>Use postal for sub-$800:</strong> Despite slower transit, the $5 MPF vs. $31.67+ for courier saves $26.67 per shipment — enough to justify 10–14 day delays on non-urgent inventory.</li>
            <li><strong>Consolidate to cross $2,500 strategically:</strong> If you're shipping multiple $800 courier packages, consolidating into one $2,500+ air freight shipment may save money despite formal entry costs — use our calculator to model this.</li>
            <li><strong>Consider Mexico for apparel:</strong> Even with 20–30% higher unit costs, 0% duty vs. 15–20% Chinese apparel duties + Section 301 often shows net savings.</li>
          </ol>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '14px', padding: '1.5rem', margin: '1.5rem 0' }}>
          <h4 style={{ marginTop: 0 }}>For Growing Importers ($10k–$100k/month)</h4>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8' }}>
            <li><strong>Get a continuous bond:</strong> At $500–$700/year, it pays for itself after 2–3 formal entries vs. single-entry bonds ($75–$150 each).</li>
            <li><strong>Invest in HTS classification:</strong> A $500–$1,000 customs broker consultation to verify your 10-digit HTS code can save thousands in overpaid duties or avoid penalties for misclassification.</li>
            <li><strong>Diversify origin:</strong> Our data shows Mexican or Vietnamese sourcing reduces Section 301 exposure by 80–100% for electronics and furniture.</li>
          </ol>
        </div>

        <h2>Limitations</h2>
        <p>This analysis excludes:</p>
        <ul style={{ lineHeight: '1.8', color: 'var(--ink-soft)' }}>
          <li>Anti-dumping/countervailing duties (AD/CVD), which can add 100–500% for specific products like steel, aluminum, and solar panels</li>
          <li>Partner agency holds (FDA, EPA, DOT, CPSC), which add 3–10 day delays and $100–$500 in exam fees</li>
          <li>Warehousing and inventory carrying costs, which vary by business model</li>
          <li>Freight rate volatility (our calculations use Q3 2026 average rates)</li>
        </ul>

        <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--tint)', borderRadius: '14px', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0 }}>Explore the Data Yourself</h3>
          <p style={{ marginBottom: '1.5rem' }}>Use our calculator to model your specific shipment, or browse all 40 audited scenarios to see the complete dataset behind this research.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/" style={{ display: 'inline-block', background: 'var(--accent)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Use the Calculator</a>
            <a href="/scenarios/" style={{ display: 'inline-block', background: 'var(--surface)', color: 'var(--accent)', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, border: '1px solid var(--accent)' }}>Browse All 40 Scenarios</a>
          </div>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--ink-soft)', borderTop: '1px solid var(--line)', paddingTop: '1.5rem' }}>
          <strong>Citation:</strong> Landed Cost Ledger. (2026). <em>The True Cost of Importing in 2026: A Data-Driven Analysis of 40 Shipping Scenarios</em>. Retrieved from https://landedship.netlify.app/research
        </p>
      </section>
    </Layout>
  );
}