"use client"

import { useState } from "react"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

/** Newsletter CTA banner — full-width blue with email subscribe input */
export function HomeCtaBanner() {
  const [email, setEmail] = useState("")

  function handleSubscribe() {
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }
    toast.success("Thanks for subscribing!")
    setEmail("")
  }

  return (
    <section className="relative overflow-hidden bg-primary py-16">
      {/* Decorative corner blocks */}
      <div className="absolute left-4 top-4 hidden grid-cols-1 gap-2 opacity-70 lg:grid">
        <div className="h-20 w-24 rounded-lg bg-white/20" />
        <div className="h-20 w-24 rounded-lg bg-white/20" />
      </div>
      <div className="absolute right-4 top-4 hidden grid-cols-1 gap-2 opacity-70 lg:grid">
        <div className="h-20 w-24 rounded-lg bg-white/20" />
        <div className="h-20 w-24 rounded-lg bg-white/20" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-xl px-4 text-center">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          New Things Will Always Update Regularly
        </h2>
        <div className="mt-6 flex overflow-hidden rounded-lg bg-white shadow-md">
          <div className="flex flex-1 items-center gap-2 px-4">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={handleSubscribe}
            className="rounded-none rounded-r-lg bg-primary px-6 text-white hover:bg-primary/90"
          >
            Subscribe
          </Button>
        </div>
      </div>
    </section>
  )
}
