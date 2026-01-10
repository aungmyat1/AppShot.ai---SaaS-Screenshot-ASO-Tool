export const metadata = { title: "Contact • GetAppShots" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="text-muted-foreground">
        For support or enterprise inquiries, email{" "}
        <a className="underline" href="mailto:support@getappshots.example">
          support@getappshots.example
        </a>
        .
      </p>
    </div>
  );
}

