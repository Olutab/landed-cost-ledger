import Layout from '../components/Layout';
export default function Privacy() {
  return (
    <Layout>
      <section className="wrap page-content">
        <h1>Privacy Policy</h1>
        <p>We collect zero personal data. Landed Cost Ledger is a static, client-side application.</p>
        <h2>No Cookies or Tracking</h2>
        <p>We do not use Google Analytics, Meta Pixels, or any advertising trackers. We do not set cookies on your device.</p>
        <h2>No Data Transmission</h2>
        <p>When you type numbers into the calculator, those numbers never leave your browser. We do not have a database of your shipment estimates.</p>
      </section>
    </Layout>
  );
}