export const metadata = {
  title: "Features • GetAppShots",
};

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Features</h1>
      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
        <li>App Store + Google Play screenshot scraping</li>
        <li>ZIP export</li>
        <li>Usage limits per plan</li>
        <li>Optional background queue processing</li>
      </ul>
    </div>
  );
}

