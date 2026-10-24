import Layout from '../components/Layout';
export default function FAQ() {
  return (
    <Layout>
      <section className="wrap page-content">
        <h1>Frequently Asked Questions</h1>
        <h2>Is this tool free to use?</h2>
        <p>Yes, the calculator is completely free and requires no account or credit card.</p>
        <h2>Do you save my shipment data?</h2>
        <p>No. This is a client-side application. The math happens in your web browser, and no data is ever sent to our servers.</p>
        <h2>Why is my actual customs bill different?</h2>
        <p>This tool estimates government duties and fees (MPF, HMF, Section 301). It does <em>not</em> estimate the freight forwarder's shipping rates, insurance, or broker clearance fees, which vary wildly based on the market.</p>
      </section>
    </Layout>
  );
}