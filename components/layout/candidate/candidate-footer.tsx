import Link from "next/link"
import { Facebook, Linkedin, PlayCircle, Twitter } from "lucide-react"
import { Box } from "lucide-react"

const footerColumns = [
  {
    heading: "Resources",
    links: [
      { label: "About Us", href: "#" },
      { label: "Our Team", href: "#" },
      { label: "Products", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Feature", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Credit", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    heading: "Quick links",
    links: [
      { label: "iOS", href: "#" },
      { label: "Android", href: "#" },
      { label: "Microsoft", href: "#" },
      { label: "Desktop", href: "#" },
    ],
  },
  {
    heading: "More",
    links: [
      { label: "Cookie Policy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
]

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
]

export function CandidateFooter() {
  return (
    <footer className="border-t border-border bg-white">
      {/* Main columns */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Box className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">WorkfitAI</span>
            </Link>
            <p className="mt-3 max-w-[200px] text-sm text-muted-foreground">
              WorkfitAI is the best resource to discover and connect with jobs worldwide.
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Download App column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Download App</h3>
            <div className="flex flex-col gap-2">
              {/* App Store badge */}
              <a
                href="#"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:border-primary"
              >
                <svg
                  className="h-5 w-5 shrink-0 text-foreground"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="leading-tight">
                  <p className="text-[10px] text-muted-foreground">Download on the</p>
                  <p className="text-xs font-semibold text-foreground">App Store</p>
                </div>
              </a>
              {/* Google Play badge */}
              <a
                href="#"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:border-primary"
              >
                <PlayCircle className="h-5 w-5 shrink-0 text-primary" />
                <div className="leading-tight">
                  <p className="text-[10px] text-muted-foreground">Get it on</p>
                  <p className="text-xs font-semibold text-foreground">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} WorkfitAI. All right reserved.
          </p>
          <div className="flex items-center gap-4">
            <select className="bg-transparent text-sm text-muted-foreground outline-none">
              <option>🇺🇸 English</option>
              <option>🇻🇳 Vietnamese</option>
            </select>
            <select className="bg-transparent text-sm text-muted-foreground outline-none">
              <option>USD</option>
              <option>VND</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  )
}
