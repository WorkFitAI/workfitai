export function CandidateFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} WorkfitAI. All rights reserved.
      </div>
    </footer>
  )
}
