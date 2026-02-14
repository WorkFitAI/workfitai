import { UserCircle, Cpu, CheckCircle } from "lucide-react"

// 3-step process data
const steps = [
  {
    number: "01",
    icon: UserCircle,
    title: "Create Profile",
    description: "Build your profile with skills, experience, and career goals.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Get Matched",
    description: "Our AI analyzes thousands of roles to surface your best-fit opportunities.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Apply & Succeed",
    description: "Apply with one click and track your applications all in one place.",
  },
]

/** How It Works — 3-step explainer section */
export function HomeHowItWorks() {
  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mt-2 text-muted-foreground">
            Three simple steps to your next opportunity
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="flex flex-col items-center text-center">
              {/* Step number badge */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {number}
              </div>
              <Icon className="mb-3 h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
