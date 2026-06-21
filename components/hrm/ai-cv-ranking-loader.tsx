"use client";

import Lottie from "lottie-react";
import searchForEmployeeAnimation from "@/public/gifs/search_for_employee.json";

/** Lottie animation shown while AI CV ranking is in progress. */
export function AiCvRankingLoader() {
  return (
    <Lottie
      animationData={searchForEmployeeAnimation}
      loop
      autoplay
      style={{ width: 220, height: 220 }}
    />
  );
}
