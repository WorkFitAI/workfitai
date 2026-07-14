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
      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} WorkfitAI. All right reserved.
          </p>
          {/* <div className="flex items-center gap-4">
            <select aria-label="Language" className="bg-transparent text-sm text-muted-foreground outline-none">
              <option>🇺🇸 English</option>
              <option>🇻🇳 Vietnamese</option>
            </select>
            <select aria-label="Currency" className="bg-transparent text-sm text-muted-foreground outline-none">
              <option>USD</option>
              <option>VND</option>
            </select>
          </div> */}
        </div>
      </div>
    </footer>
  )
}
