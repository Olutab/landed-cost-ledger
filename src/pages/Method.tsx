import Layout from '../components/Layout';
export default function Method() {
  return (
    <Layout>
      <section className="wrap page-content">
        <h1>Method & Expert Advice</h1>
        <p className="lede">How we calculate landed cost, and the limits of this tool.</p>
        <h2>The Landed Cost Formula</h2>
        <p>True landed cost = Declared Value + Freight + Insurance + Duty + MPF + HMF + Section 301 Tariffs.</p>
        <h2>MPF (Merchandise Processing Fee)</h2>
        <p><strong>Informal Entry (Under $2,500):</strong> Estimated at a flat $5.00.<br/><strong>Formal Entry (Over $2,500):</strong> Calculated at 0.3464% of the declared value, with a minimum of $31.67 and a maximum cap of $614.35 (per FY 2026 rates).</p>
        <h2>HMF (Harbor Maintenance Fee)</h2>
        <p>Calculated at 0.125% of the declared value. This applies <strong>only</strong> to ocean freight (LCL and FCL). It does not apply to air freight, courier, or postal modes.</p>
        <div className="card" style={{ marginTop: '2rem', background: '#FDF5F4', border: '1px solid #F0D2CE' }}>
          <h3>Important Disclaimer</h3>
          <p>This tool provides structural estimates for planning purposes. It is not legal or customs advice. Final duties and fees are assessed by US Customs and Border Protection (CBP) at the time of entry. Always consult a licensed customs broker for binding rulings.</p>
        </div>
      </section>
    </Layout>
  );
}