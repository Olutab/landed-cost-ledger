import Layout from '../components/Layout';
export default function Research() {
  return (
    <Layout>
      <section className="wrap page-content">
        <span className="overline">Original Research</span>
        <h1>The 2026 State of US Import Costs</h1>
        <p className="lede">An analysis of 40 distinct import scenarios reveals how the 2025–2026 de minimis suspension and Section 301 tariffs are reshaping landed costs for small e-commerce sellers.</p>
        
        <h2>Key Findings</h2>
        <ul style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--ink-soft)', paddingLeft: '1.5rem' }}>
          <li><strong>The $2,500 Cliff:</strong> Shipments crossing the $2,500 threshold face a mandatory formal entry, increasing baseline compliance costs (MPF + Broker fees) by an estimated $30–$150 per shipment compared to informal entry.</li>
          <li><strong>Section 301 Dominance:</strong> For Chinese-origin goods in targeted categories (Electronics, Metals, Furniture), punitive tariffs add a flat 25% to the landed cost, often exceeding the cost of the freight itself on high-value items.</li>
          <li><strong>The Ocean LCL Penalty:</strong> While ocean freight is cheaper per kg, LCL shipments incur higher terminal handling charges and are disproportionately flagged for intensive CBP exams, adding 5–14 days of delay risk.</li>
          <li><strong>USMCA Advantage:</strong> Mexican-origin shipments in our matrix showed a 0% duty rate under USMCA, making them 25–30% cheaper in total landed cost compared to identical Chinese-origin goods.</li>
        </ul>

        <h2>Methodology</h2>
        <p>This analysis is based on a matrix of 40 audited scenarios covering the top 2 origin countries, 5 shipping modes, 4 value bands, and 10 high-volume HTS categories. All duty rates and fee structures were verified against official CBP and USITC documentation as of October 2026. Scenarios lacking direct source documentation are clearly labelled as estimates.</p>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/scenarios/" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Browse the full 40-scenario dataset →</a>
        </div>
      </section>
    </Layout>
  );
}