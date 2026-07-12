import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ApplyNowButton from "@/components/applications/apply-now-button";
import { cleanText, cn } from "@/lib/utils";

type Props = {
  postId: string;
  logo: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  description: string;
  skills: string[];
  /** Tighter spacing/padding — used by the homepage's non-AI "latest jobs" grid. Defaults to the standard, roomier layout. */
  compact?: boolean;
};

export default function FeaturedJobCard({
  postId,
  logo,
  company,
  title,
  location,
  salary,
  description,
  skills,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        "bg-white border rounded-xl hover:shadow-md transition mx-auto h-full flex flex-col",
        compact ? "p-4" : "p-5",
      )}
    >
      {/* company */}
      <div className={cn("flex items-center gap-3", compact ? "mb-3" : "mb-4")}>
        <Image
          src={logo || "/placeholder-logo.png"}
          alt="logo"
          width={36}
          height={36}
          className="rounded-md"
        />
        <div>
          <p className="text-sm font-semibold">{cleanText(company)}</p>
          <div className="flex items-center text-xs text-gray-500 gap-1">
            <MapPin size={12} />
            {cleanText(location)}
          </div>
        </div>
      </div>

      {/* title */}
      <Link href={`/jobs/${postId}`}>
        <h3 className={cn("font-semibold text-sm line-clamp-2 hover:text-blue-600 hover:underline", compact ? "mb-2" : "mb-4")}>
          {cleanText(title)}
        </h3>
      </Link>

      {/* description */}
      <p className={cn("text-xs text-gray-500 line-clamp-2 whitespace-pre-line", compact ? "mb-3" : "mb-8")}>
        {cleanText(description)}
      </p>

      {/* tags */}
      <div className={cn("flex gap-2 items-center", compact ? "mb-3" : "mb-8")}>
        {skills.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className={`text-xs px-2 py-1 line-clamp-2 rounded ${
              index === 0
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {skill}
          </span>
        ))}

        {skills.length > 3 && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[8px] rounded-full border text-gray-600">
            +{skills.length - 4}
          </span>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-blue-600 font-semibold text-sm whitespace-nowrap flex-shrink-0">
          {salary}
        </span>

        <ApplyNowButton jobId={postId} jobTitle={title} iconOnly />
      </div>
    </div>
  );
}