"use client";

import Lottie from "lottie-react";
import loadingAnimation from "@/public/gifs/Loading.json";

interface LottieLoaderProps {
  size?: number;
  className?: string;
}

/** Shared full-section loading indicator. Use for section/page-level loading states, not inline button spinners. */
export function LottieLoader({ size = 96, className }: LottieLoaderProps) {
  return (
    <Lottie
      animationData={loadingAnimation}
      loop
      autoplay
      style={{ width: size, height: size }}
      className={className}
    />
  );
}
