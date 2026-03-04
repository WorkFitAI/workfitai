"use client"

import { Briefcase, MapPin, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"

/** 3-field inline search bar: Industry | Location | You + Search button */
export function HomeHeroSearch() {
  return (
    <div className="flex items-center rounded-lg border border-border bg-white shadow-md">
      {/* Industry */}
      <div className="flex flex-1 items-center gap-2 px-4 py-3">
        <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
        <select className="w-full bg-transparent text-sm text-foreground outline-none">
          <option value="">Industry</option>
          <option value="tech">Technology</option>
          <option value="finance">Finance</option>
          <option value="marketing">Marketing</option>
          <option value="hr">Human Resources</option>
        </select>
      </div>
      <div className="h-8 w-px bg-border" />
      {/* Location */}
      <div className="flex flex-1 items-center gap-2 px-4 py-3">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <select className="w-full bg-transparent text-sm text-foreground outline-none">
          <option value="">Location</option>
          <option value="hanoi">Hanoi</option>
          <option value="hcm">Ho Chi Minh City</option>
          <option value="remote">Remote</option>
        </select>
      </div>
      <div className="h-8 w-px bg-border" />
      {/* Keyword */}
      <div className="flex flex-1 items-center gap-2 px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Keyword"
          aria-label="Search keyword"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      {/* Search button */}
      <Button className="m-1 gap-1 rounded-md bg-primary px-5 text-white hover:bg-primary/90">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </div>
  )
}
