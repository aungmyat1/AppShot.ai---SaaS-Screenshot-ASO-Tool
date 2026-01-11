export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-background via-background to-muted/30 px-6 py-16 sm:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-[520px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
        <div className="relative">
          {/* Client hero (toggle + fetch) */}
          <LandingHero />

          <div className="mt-10 text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Trusted by teams at</div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
              <div className="rounded-md border bg-background/40 px-3 py-1 text-xs">Studio</div>
              <div className="rounded-md border bg-background/40 px-3 py-1 text-xs">AppMasters</div>
              <div className="rounded-md border bg-background/40 px-3 py-1 text-xs">PixelPerfect</div>
              <div className="rounded-md border bg-background/40 px-3 py-1 text-xs">LaunchLab</div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Everything you need, nothing you don&apos;t.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Powerful features designed to streamline your workflow and save time.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard title="Blazing Fast" desc="Get screenshots for any app in seconds. Optimized processing keeps things snappy." />
          <FeatureCard title="High Resolution" desc="Download original, high‑quality screenshots directly from the app stores." />
          <FeatureCard title="Bulk Downloads" desc="Select all or specific screenshots and download them in a single ZIP file." />
          <FeatureCard title="Developer API" desc="Integrate screenshot extraction into your workflows with a simple REST API." />
        </div>
      </section>

      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Loved by Professionals Worldwide</h2>
          <p className="mt-2 text-sm text-muted-foreground">Here’s what our users are saying about GetAppShots.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Testimonial
            quote="This tool saved me hours of manual work. A must‑have for any app marketer!"
            name="Sarah Johnson"
            title="Marketing Manager"
          />
          <Testimonial
            quote="The API is clean and easy to integrate. We use it in our internal dashboards."
            name="Michael Chen"
            title="Lead Developer"
          />
          <Testimonial
            quote="As a designer, getting high-quality assets is crucial — this delivers every time."
            name="Emily Rodriguez"
            title="UI/UX Designer"
          />
        </div>
      </section>

      <section id="pricing" className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Simple, Transparent Pricing</h2>
          <p className="mt-2 text-sm text-muted-foreground">Choose the plan that fits your usage.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <PricingCard
            name="Free"
            price="$0"
            badge={null}
            items={["10 screenshots / month", "Standard quality", "Single downloads", "Community support"]}
            cta={{ label: "Sign Up Free", href: "/sign-up" }}
          />
          <PricingCard
            name="Pro"
            price="$29"
            badge="Most Popular"
            items={["500 screenshots / month", "High quality downloads", "Bulk ZIP downloads", "Developer API access", "Email support"]}
            cta={{ label: "Get Started", href: "/dashboard/billing" }}
            highlighted
          />
          <PricingCard
            name="Enterprise"
            price="Contact Us"
            badge={null}
            items={["Unlimited usage", "Highest quality available", "Custom integrations", "Dedicated account manager", "Priority support"]}
            cta={{ label: "Contact Sales", href: "/contact" }}
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-2 text-sm text-muted-foreground">Have questions? We have answers.</p>
        </div>
        <div className="mx-auto max-w-3xl space-y-2">
          <Faq q="How do I find the App ID or link?">
            Use the public store URL. For iOS, the app id is the number after <code>id</code>. For Play, use the{" "}
            <code>id=</code> package name.
          </Faq>
          <Faq q="Are the downloaded screenshots high quality?">Yes — we fetch original store screenshots when available.</Faq>
          <Faq q="Can I use this for commercial projects?">Generally yes, but you’re responsible for rights and store terms.</Faq>
          <Faq q="Do you offer a plan with more usage?">Yes — contact us for enterprise usage and custom limits.</Faq>
          <Faq q="How does the Developer API work?">You can generate API keys in the dashboard and call the FastAPI endpoints.</Faq>
        </div>
      </section>

      <footer className="rounded-3xl border bg-muted/20 px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-2">
            <div className="font-semibold tracking-tight">getappshots</div>
            <div className="text-sm text-muted-foreground">Download app screenshots, instantly.</div>
          </div>

          <div>
            <div className="text-sm font-medium">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a className="hover:text-foreground" href="/features">
                  Features
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="/pricing">
                  Pricing
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="/docs">
                  API Docs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-medium">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a className="hover:text-foreground" href="/contact">
                  Contact
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="/blog">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-medium">Legal</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a className="hover:text-foreground" href="/terms">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="/privacy">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} getappshots. All rights reserved.</div>
      </footer>
    </div>
  );
}

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LandingHero } from "@/app/landing-hero";

function FeatureCard(props: { title: string; desc: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm font-medium">{props.title}</div>
      <div className="mt-2 text-sm text-muted-foreground">{props.desc}</div>
    </Card>
  );
}

function Testimonial(props: { quote: string; name: string; title: string }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-muted-foreground">“{props.quote}”</div>
      <div className="mt-4 text-sm font-medium">{props.name}</div>
      <div className="text-xs text-muted-foreground">{props.title}</div>
    </Card>
  );
}

function PricingCard(props: {
  name: string;
  price: string;
  badge: string | null;
  items: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
}) {
  return (
    <Card className={["p-6", props.highlighted ? "border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/.2)]" : ""].join(" ")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{props.name}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {props.price}
            {props.price.startsWith("$") && props.name !== "Enterprise" ? <span className="text-sm font-normal text-muted-foreground"> / month</span> : null}
          </div>
        </div>
        {props.badge ? <div className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">{props.badge}</div> : null}
      </div>

      <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
        {props.items.map((i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-primary" />
            <span>{i}</span>
          </li>
        ))}
      </ul>

      <a
        href={props.cta.href}
        className={[
          "mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition",
          props.highlighted ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted hover:bg-muted/80",
        ].join(" ")}
      >
        {props.cta.label}
      </a>
    </Card>
  );
}

function Faq(props: { q: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl border bg-background/40 px-4 py-3">
      <summary className="cursor-pointer list-none text-sm font-medium">
        <div className="flex items-center justify-between gap-3">
          <span>{props.q}</span>
          <span className="text-muted-foreground group-open:rotate-45 transition">+</span>
        </div>
      </summary>
      <div className="mt-3 text-sm text-muted-foreground">{props.children}</div>
    </details>
  );
}

