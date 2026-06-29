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

export const getCoordinates = async (address: string) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json`
  );

  const data = await res.json();

  if (data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
};

export const getPagination = (page: number, totalPages: number) => {
  const delta = 1; // số trang 2 bên current page
  const range = [];

  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  range.push(1);

  if (left > 2) {
    range.push("...");
  }

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < totalPages - 1) {
    range.push("...");
  }

  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
};

export const formatSalary = (salary: number) => {
  if (salary >= 1_000_000) {
    const value = salary / 1_000_000;
    return `${value.toLocaleString("vi-VN", {
      minimumFractionDigits: value % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    })}tr`;
  }

  return salary.toLocaleString("vi-VN");
};