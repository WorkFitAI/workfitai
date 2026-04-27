"use client";

/**
 * ProfileForm — now replaced in the main UI by ProfileEditModal.
 * Kept for backward compatibility; uses the updated field names.
 */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { userService } from "@/lib/user/user-service";
import { profileSchema, ProfileFormValues } from "@/lib/schemas/user-schemas";
import { CandidateProfile } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarUpload from "./avatar-upload";

interface Props {
  profile: CandidateProfile | null;
  loading: boolean;
  onProfileUpdated: (updated: CandidateProfile) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export default function ProfileForm({ profile, loading, onProfileUpdated }: Props) {
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
      summary: "",
      careerObjective: "",
      portfolioLink: "",
      linkedinUrl: "",
      githubUrl: "",
      expectedPosition: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        address: profile.address ?? "",
        summary: profile.summary ?? "",
        careerObjective: profile.careerObjective ?? "",
        portfolioLink: profile.portfolioLink ?? "",
        linkedinUrl: profile.linkedinUrl ?? "",
        githubUrl: profile.githubUrl ?? "",
        expectedPosition: profile.expectedPosition ?? "",
      });
      setAvatarUrl(profile.avatarUrl ?? null);
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setSaving(true);
      const res = await userService.updateCandidateProfile({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || undefined,
        address: values.address || undefined,
        summary: values.summary || undefined,
        careerObjective: values.careerObjective || undefined,
        portfolioLink: values.portfolioLink || undefined,
        linkedinUrl: values.linkedinUrl || undefined,
        githubUrl: values.githubUrl || undefined,
        expectedPosition: values.expectedPosition || undefined,
      });
      onProfileUpdated(res.data);
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Profile photo</h3>
        <AvatarUpload
          avatarUrl={avatarUrl}
          username={profile?.username ?? ""}
          onAvatarChange={setAvatarUrl}
        />
      </div>

      <Separator />

      {/* Read-only fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs text-muted-foreground">Username</Label>
          <Input value={profile?.username ?? ""} disabled className="mt-1 bg-muted/40" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input value={profile?.email ?? ""} disabled className="mt-1 bg-muted/40" />
        </div>
      </div>

      <Separator />

      {/* Editable fields */}
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
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="City, Country"
            className="mt-1"
          />
          <FieldError message={errors.address?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="summary">About Me</Label>
        <Textarea
          id="summary"
          {...register("summary")}
          rows={4}
          placeholder="Tell employers a bit about yourself…"
          className="mt-1 resize-none"
        />
        <FieldError message={errors.summary?.message} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving || !isDirty}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
