"use client";

import { useState } from "react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Briefcase,
  Wrench,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Check,
  Target,
  Zap,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import PreferenceCategoryPicker from "@/components/jobs/preferences/preference-category-picker";
import PreferenceMultiToggle from "@/components/jobs/preferences/preference-multi-toggle";
import PreferenceSkillPicker from "@/components/jobs/preferences/preference-skill-picker";
import PreferenceSalaryField from "@/components/jobs/preferences/preference-salary-field";

import onboardingAnimation from "@/public/gifs/onboarding.json";
import { JobPreferences, PreferenceCurrency } from "@/types/job-preferences";

const EXPERIENCE_LEVELS = ["FRESHER", "JUNIOR", "MID", "SENIOR", "LEAD"];
const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "REMOTE"];

const EMPTY_PREFS: JobPreferences = {
  experienceLevel: [],
  employmentType: [],
  skillNames: [],
  categoryName: undefined,
  salaryMin: undefined,
  currency: "VND",
};

// Ordered onboarding steps. Each step is fully optional — the user can advance
// (or Skip) at any point without filling anything in.
const STEPS: { key: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    key: "category",
    title: "What kind of role?",
    description: "Pick the job category that fits you best.",
    icon: Briefcase,
  },
  {
    key: "skills",
    title: "Your top skills",
    description: "Choose the skills you want to be matched on.",
    icon: Wrench,
  },
  {
    key: "experience",
    title: "Experience, work style & salary",
    description: "Tell us your seniority, how you prefer to work, and your minimum salary.",
    icon: BarChart3,
  },
];

const VALUE_PROPS = [
  { icon: Target, text: "Get jobs matched to your exact skills & category" },
  { icon: Zap, text: "Skip the manual filtering — we do it for you" },
  { icon: RefreshCcw, text: "Change your mind anytime from the sidebar" },
];

interface Props {
  open: boolean;
  initialPreferences?: JobPreferences | null;
  onSave: (prefs: JobPreferences) => void;
  /** Called on Escape/overlay/X/Skip close without saving. Parent decides the
   * storage effect: first-run should dismiss (suppress future prompts), edit
   * mode should just close without touching saved prefs. */
  onClose: () => void;
}

const SLIDE_DISTANCE = 24;

export default function JobPreferencesModal({
  open,
  initialPreferences,
  onSave,
  onClose,
}: Props) {
  const isEditMode = !!initialPreferences;
  const [prefs, setPrefs] = useState<JobPreferences>(EMPTY_PREFS);
  // -1 = intro/welcome screen (first-run only), 0..STEPS.length-1 = question steps.
  const [step, setStep] = useState(isEditMode ? 0 : -1);
  const [direction, setDirection] = useState(1);
  // Tracks the `open` value from the previous render so we can detect the
  // closed->open transition and re-seed the form + reset to the first step
  // (React's "adjusting state during rendering" pattern — no effect needed).
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setPrefs(initialPreferences ?? EMPTY_PREFS);
      setStep(isEditMode ? 0 : -1);
      setDirection(1);
    }
  }

  const isLastStep = step === STEPS.length - 1;
  const current = step >= 0 ? STEPS[step] : null;

  const toggleValue = (
    key: "experienceLevel" | "employmentType" | "skillNames",
    value: string
  ) => {
    setPrefs((prev) => {
      const values = prev[key];
      const next = values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value];

      return { ...prev, [key]: next };
    });
  };

  const handleSalaryChange = (salaryMin: number | undefined, currency: PreferenceCurrency) => {
    setPrefs((prev) => ({ ...prev, salaryMin, currency }));
  };

  // All steps are optional, so the sidebar can jump to any step directly —
  // not just forward one at a time.
  const goToStep = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  };

  const goNext = () => {
    if (isLastStep) {
      onSave(prefs);
      return;
    }
    goToStep(step + 1);
  };

  const goBack = () => goToStep(step - 1);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="!max-w-[60vw] w-full overflow-hidden p-0 gap-0">
        {step === -1 ? (
          <div className="grid grid-cols-1 items-center gap-6 px-8 py-10 sm:grid-cols-2 sm:gap-8">
            <div className="hidden sm:flex items-center justify-center">
              <Lottie animationData={onboardingAnimation} loop autoplay className="w-full max-w-xs" />
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <Sparkles className="h-8 w-8" />
              </div>

              <DialogHeader className="mt-5 space-y-2">
                <DialogTitle className="text-2xl">Let&apos;s find jobs that fit you</DialogTitle>
                <DialogDescription className="text-sm max-w-sm mx-auto">
                  Answer {STEPS.length} quick questions and we&apos;ll tailor your job search automatically —
                  every time you visit.
                </DialogDescription>
              </DialogHeader>

              <ul className="mt-6 w-full max-w-sm space-y-3 text-left">
                {VALUE_PROPS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              <Button
                onClick={goNext}
                className="mt-8 w-full max-w-sm gap-1.5 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Get started
                <ChevronRight className="h-4 w-4" />
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="mt-3 text-sm text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Skip, I&apos;ll browse all jobs
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top bar: brand chip + step count. The real per-step heading lives in
                the content pane below; Title/Description here stay for a11y. */}
            <DialogHeader className="flex-row items-center justify-between space-y-0 border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {isEditMode ? "Edit your preferences" : "Personalize your job search"}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-400 mr-8">
                Step {step + 1} of {STEPS.length}
              </span>
              <DialogTitle className="sr-only">{current?.title}</DialogTitle>
              <DialogDescription className="sr-only">{current?.description}</DialogDescription>
            </DialogHeader>

            {/* Mobile-only progress bar; the step sidebar takes over on sm+ */}
            <div className="flex items-center gap-1.5 px-6 py-3 sm:hidden">
              {STEPS.map((s, i) => (
                <div
                  key={s.key}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors duration-300",
                    i <= step ? "bg-blue-500" : "bg-slate-100"
                  )}
                />
              ))}
            </div>

            {/* Two-column body: step nav sidebar (desktop) + active step content */}
            <div className="flex flex-col border-t border-slate-200 sm:flex-row sm:min-h-[420px]">
              <aside className="hidden shrink-0 border-r border-slate-200 bg-slate-50/60 p-3 sm:block sm:w-56">
                <nav className="space-y-1">
                  {STEPS.map((s, i) => {
                    const isDone = i < step;
                    const isCurrent = i === step;

                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => goToStep(i)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer",
                          isCurrent
                            ? "border-slate-200 bg-white shadow-sm"
                            : "border-transparent hover:bg-white/70"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                            isDone || isCurrent
                              ? "bg-blue-500 text-white"
                              : "bg-slate-200 text-slate-500"
                          )}
                        >
                          {isDone ? <Check className="h-3 w-3" /> : i + 1}
                        </span>
                        <span
                          className={cn(
                            "truncate text-sm font-medium",
                            isCurrent ? "text-slate-900" : "text-slate-500"
                          )}
                        >
                          {s.title}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start gap-3 px-6 pb-4 pt-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    {current && <current.icon className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold leading-tight text-slate-900">
                      {current?.title}
                    </h3>
                    <p className="text-sm text-slate-500">{current?.description}</p>
                  </div>
                </div>

                <div className="relative flex-1 overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      initial={{ opacity: 0, x: direction * SLIDE_DISTANCE }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -SLIDE_DISTANCE }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="px-6 pb-6"
                    >
                      {current?.key === "category" && (
                        <PreferenceCategoryPicker
                          value={prefs.categoryName}
                          onChange={(categoryName) =>
                            setPrefs((prev) => ({ ...prev, categoryName }))
                          }
                        />
                      )}

                      {current?.key === "skills" && (
                        <PreferenceSkillPicker
                          selected={prefs.skillNames}
                          onToggle={(value) => toggleValue("skillNames", value)}
                        />
                      )}

                      {current?.key === "experience" && (
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-6">
                            <section>
                              <h4 className="font-medium mb-2 text-sm text-slate-700">
                                Experience Level
                              </h4>
                              <PreferenceMultiToggle
                                options={EXPERIENCE_LEVELS}
                                selected={prefs.experienceLevel}
                                onToggle={(value) => toggleValue("experienceLevel", value)}
                              />
                            </section>

                            <section>
                              <h4 className="font-medium mb-2 text-sm text-slate-700">
                                Employment Type
                              </h4>
                              <PreferenceMultiToggle
                                options={EMPLOYMENT_TYPES}
                                selected={prefs.employmentType}
                                onToggle={(value) => toggleValue("employmentType", value)}
                              />
                            </section>
                          </div>

                          <section>
                            <h4 className="font-medium mb-2 text-sm text-slate-700">
                              Salary Expectations
                            </h4>
                            <PreferenceSalaryField
                              salaryMin={prefs.salaryMin}
                              currency={prefs.currency}
                              onChange={handleSalaryChange}
                            />
                          </section>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-6 py-4">
              <div>
                {step > 0 && (
                  <Button variant="ghost" onClick={goBack} className="gap-1 text-slate-600">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={onClose} className="text-slate-400">
                  {isEditMode ? "Cancel" : "Skip"}
                </Button>

                <Button onClick={goNext} className="gap-1 bg-blue-600 hover:bg-blue-700">
                  {isLastStep ? (
                    <>
                      <Check className="h-4 w-4" />
                      {isEditMode ? "Save changes" : "Save & see jobs"}
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
