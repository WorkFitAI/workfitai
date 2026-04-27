"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/lib/user/user-service";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Props {
  avatarUrl?: string | null;
  username: string;
  onAvatarChange: (url: string | null) => void;
  /** Compact mode: shows only the circular avatar with camera button; no action buttons below */
  compact?: boolean;
}

export default function AvatarUpload({
  avatarUrl,
  username,
  onAvatarChange,
  compact = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const initials = username.charAt(0).toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }

    try {
      setUploading(true);
      const res = await userService.uploadAvatar(file);
      onAvatarChange(res.data?.avatarUrl ?? null);
      toast.success("Avatar updated.");
    } catch {
      toast.error("Failed to upload avatar.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    try {
      setRemoving(true);
      await userService.deleteAvatar();
      onAvatarChange(null);
      toast.success("Avatar removed.");
    } catch {
      toast.error("Failed to remove avatar.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className={compact ? "relative shrink-0" : "flex items-center gap-5"}>
      {/* Avatar circle */}
      <div className="relative shrink-0">
        <div className="h-20 w-20 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={username}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-muted-foreground">
              {initials || <User className="h-8 w-8" />}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          title="Change avatar"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Action buttons — only shown in full (non-compact) mode */}
      {!compact && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Change photo"}
          </Button>
          {avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={removing}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {removing ? "Removing…" : "Remove"}
            </Button>
          )}
          <p className="text-xs text-muted-foreground">JPEG, PNG or WebP · max 5 MB</p>
        </div>
      )}
    </div>
  );
}
