import { Clock, MapPin, Briefcase } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
  logo?: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
};

export default function SimilarJobCard({
  id,
  logo,
  title,
  company,
  location,
  salary,
  type,
}: Props) {
  return (
    <Link href={`/jobs/${id}`}>
      <div className="flex gap-3 py-4 border-b last:border-none hover:bg-gray-50 cursor-pointer px-2 rounded-md transition">
        <Image
          src={logo || "/images/company-placeholder.png"}
          alt="logo"
          width={40}
          height={40}
          className="w-10 h-10 rounded-md object-cover"
        />

        <div className="flex-1">
          {/* Job title */}
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {title}
          </h4>

          {/* Company name */}
          <p className="text-xs text-gray-500">{company}</p>

          {/* Location */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <span>{location}</span>
            </div>
          </div>

          {/* Salary + type */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="text-blue-600 font-semibold">{salary}</span>

            <span className="flex items-center gap-1 text-gray-500">
              <Briefcase size={12} />
              {type}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
