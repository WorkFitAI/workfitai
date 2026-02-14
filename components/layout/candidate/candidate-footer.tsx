import Link from "next/link"
import { Linkedin, Twitter, Github } from "lucide-react"

// Footer navigation columns
const footerColumns = [
  {
    heading: "For Candidates",
    links: [
      { label: "Browse Jobs", href: "#" },
      { label: "My Profile", href: "#" },
      { label: "Saved Jobs", href: "#" },
      { label: "Applications", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
]

const socialLinks = [
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
]

export function CandidateFooter() {
  return (
    <footer className="border-t border-border bg-accent/30">
      {/* Main columns */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold text-primary">
              WorkfitAI
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              AI-powered workforce management and job matching platform.
            </p>
          </div>

          {/* Nav columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-3 text-sm font-semibold text-primary">{col.heading}</h3>
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
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} WorkfitAI. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
