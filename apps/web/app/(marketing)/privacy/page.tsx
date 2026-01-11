export const metadata = { title: "Privacy Policy • GetAppShots" };

export default function PrivacyPage() {
  return (
    <div className="prose prose-neutral max-w-3xl">
      <h1>Privacy Policy</h1>
      <p>
        This is a starter privacy policy page. Update it for your legal requirements and the exact data you collect and
        store.
      </p>
      <h2>Data we process</h2>
      <ul>
        <li>Account identifiers (email, auth provider id)</li>
        <li>Scrape job metadata (app URL, status, counts)</li>
        <li>Billing metadata (Stripe ids, invoice references)</li>
        <li>Operational logs for security and reliability (rate limiting, error logs)</li>
      </ul>
      <h2>Cookies</h2>
      <p>We use cookies for authentication and to keep the service secure.</p>
      <h2>Your rights</h2>
      <p>You can export or delete your data from the dashboard settings.</p>
    </div>
  );
}

