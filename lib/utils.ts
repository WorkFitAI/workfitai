import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPostedTime = (createdDate: string): string => {
  const now = new Date();
  const posted = new Date(createdDate);

  const diffMs = now.getTime() - posted.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // dưới 1 giờ
  if (diffMinutes < 60) {
    return `${diffMinutes}`;
  }

  // dưới 1 ngày
  if (diffHours < 24) {
    return `${diffHours}`;
  }

  // >= 1 ngày → hiển thị ngày đăng
  return `${posted.toLocaleDateString("vi-VN")}`;
};