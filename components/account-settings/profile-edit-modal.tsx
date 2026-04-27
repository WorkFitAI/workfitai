"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import { userService } from "@/lib/user/user-service";
import { profileSchema, ProfileFormValues } from "@/lib/schemas/user-schemas";
import { CandidateProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  profile: CandidateProfile | null;
  onClose: () => void;
  onSaved: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export default function ProfileEditModal({ open, profile, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      expectedPosition: "",
      totalExperience: undefined,
      careerObjective: "",
      summary: "",
      certifications: "",
      education: "",
      portfolioLink: "",
      linkedinUrl: "",
      githubUrl: "",
    },
  });

  useEffect(() => {
    if (profile && open) {
      reset({
        fullName: profile.fullName ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        address: profile.address ?? "",
        expectedPosition: profile.expectedPosition ?? "",
        totalExperience: profile.totalExperience ?? undefined,
        careerObjective: profile.careerObjective ?? "",
        summary: profile.summary ?? "",
        certifications: profile.certifications ?? "",
        education: profile.education ?? "",
        portfolioLink: profile.portfolioLink ?? "",
        linkedinUrl: profile.linkedinUrl ?? "",
        githubUrl: profile.githubUrl ?? "",
      });
      setSkills(profile.skills ?? []);
      setSkillInput("");
    }
  }, [profile, open, reset]);

  const addSkill = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setSaving(true);
      await userService.updateCandidateProfile({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || undefined,
        expectedPosition: values.expectedPosition || undefined,
        totalExperience: values.totalExperience != null && values.totalExperience !== ("" as unknown as number)
          ? Number(values.totalExperience)
          : undefined,
        careerObjective: values.careerObjective || undefined,
        summary: values.summary || undefined,
        certifications: values.certifications || undefined,
        education: values.education || undefined,
        portfolioLink: values.portfolioLink || undefined,
        linkedinUrl: values.linkedinUrl || undefined,
        githubUrl: values.githubUrl || undefined,
        skills,
      });
      toast.success("Profile updated successfully.");
      onSaved();
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          "relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
          {/* Read-only */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Username</Label>
              <Input value={profile?.username ?? ""} disabled className="mt-1 bg-muted/40" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input value={profile?.email ?? ""} disabled className="mt-1 bg-muted/40" />
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
          </div>

          {/* Full name */}
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Your full name"
              className="mt-1"
            />
            <FieldError message={errors.fullName?.message} />
          </div>

          {/* Phone + Position */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                {...register("phoneNumber")}
                placeholder="+84 XXX XXX XXXX"
                className="mt-1"
              />
              <FieldError message={errors.phoneNumber?.message} />
            </div>
            <div>
              <Label htmlFor="expectedPosition">Current Position</Label>
              <Input
                id="expectedPosition"
                {...register("expectedPosition")}
                placeholder="e.g. Backend Engineer"
                className="mt-1"
              />
              <FieldError message={errors.expectedPosition?.message} />
            </div>
          </div>

          {/* Years of experience */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="totalExperience">Years of Experience</Label>
              <Input
                id="totalExperience"
                type="number"
                min={0}
                max={50}
                {...register("totalExperience", { valueAsNumber: true })}
                placeholder="e.g. 3"
                className="mt-1"
              />
              <FieldError message={errors.totalExperience?.message} />
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label>Skills</Label>
            <p className="text-xs text-muted-foreground mb-2">Press Enter or comma to add a skill</p>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] rounded-md border border-input bg-background px-3 py-2 mb-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-0.5 hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                onBlur={() => skillInput.trim() && addSkill(skillInput)}
                placeholder={skills.length === 0 ? "React, Node.js, TypeScript…" : ""}
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <Label htmlFor="summary">Summary / About Me</Label>
            <Textarea
              id="summary"
              {...register("summary")}
              rows={4}
              placeholder="Tell employers a bit about yourself…"
              className="mt-1 resize-none"
            />
            <FieldError message={errors.summary?.message} />
          </div>

          {/* Career Objective */}
          <div>
            <Label htmlFor="careerObjective">Career Objective</Label>
            <Textarea
              id="careerObjective"
              {...register("careerObjective")}
              rows={3}
              placeholder="Your career goals and aspirations…"
              className="mt-1 resize-none"
            />
            <FieldError message={errors.careerObjective?.message} />
          </div>

          {/* Certifications */}
          <div>
            <Label htmlFor="certifications">Certifications</Label>
            <Textarea
              id="certifications"
              {...register("certifications")}
              rows={3}
              placeholder="e.g. AWS Certified Developer, Google Cloud Professional…"
              className="mt-1 resize-none"
            />
            <FieldError message={errors.certifications?.message} />
          </div>

          {/* Education */}
          <div>
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              {...register("education")}
              rows={2}
              placeholder="e.g. B.Sc. Computer Science, University of Technology"
              className="mt-1 resize-none"
            />
            <FieldError message={errors.education?.message} />
          </div>

          {/* Social links */}
          <div className="space-y-1">
            <p className="text-sm font-medium">Social Links</p>
            <p className="text-xs text-muted-foreground mb-3">Add your professional profiles</p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="linkedinUrl" className="text-xs">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  {...register("linkedinUrl")}
                  placeholder="https://linkedin.com/in/yourname"
                  className="mt-1"
                />
                <FieldError message={errors.linkedinUrl?.message} />
              </div>
              <div>
                <Label htmlFor="githubUrl" className="text-xs">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  {...register("githubUrl")}
                  placeholder="https://github.com/yourname"
                  className="mt-1"
                />
                <FieldError message={errors.githubUrl?.message} />
              </div>
              <div>
                <Label htmlFor="portfolioLink" className="text-xs">Portfolio URL</Label>
                <Input
                  id="portfolioLink"
                  type="url"
                  {...register("portfolioLink")}
                  placeholder="https://yourportfolio.com"
                  className="mt-1"
                />
                <FieldError message={errors.portfolioLink?.message} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
