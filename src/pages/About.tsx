import Layout from '../components/Layout';
export default function About() {
  return (
    <Layout>
      <section className="wrap page-content">
        <h1>About Us</h1>
        <p>Landed Cost Ledger was built to solve a specific problem: small e-commerce sellers and independent importers often get blindsided by hidden customs fees, MPF, HMF, and Section 301 tariffs when their goods arrive at the US border.</p>
        <p>Freight forwarders and customs brokers are built for enterprise shippers moving full containers. For someone importing $5,000 worth of goods via courier or ocean LCL, the cost structure is opaque, and the rules change frequently.</p>
        <h2>Our Philosophy</h2>
        <p>We believe cost estimation should be transparent, private, and honest. We built this tool as a zero-backend, zero-login application. We don't want your email address, we don't track your inputs, and we don't store your shipment details. The math runs entirely in your browser.</p>
      </section>
    </Layout>
  );
}