import { MapPin, Clock } from "lucide-react";
import Image from "next/image";

type Props = {
  logo: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  description: string;
  skills: string[];
};

export default function FeaturedJobCard({
  logo,
  company,
  title,
  location,
  salary,
  description,
  skills
}: Props) {
  return (
    <div className="bg-white border rounded-xl p-5 hover:shadow-md transition mx-auto">
      {/* company */}
      <div className="flex items-center gap-3 mb-4">
        <Image
          src={logo}
          alt="logo"
          width={36}
          height={36}
          className="rounded-md"
        />
        <div>
          <p className="text-sm font-semibold">{company}</p>
          <div className="flex items-center text-xs text-gray-500 gap-1">
            <MapPin size={12} />
            {location}
          </div>
        </div>
      </div>

      {/* title */}
      <h3 className="font-semibold text-sm mb-4">{title}</h3>

      {/* description */}
      <p className="text-xs text-gray-500 mb-8 line-clamp-3">
        {description}
      </p>

      {/* tags */}
      <div className="flex gap-2 mb-8">
        {skills.map((skill, index) => (
          <span key={index} className="bg-gray-100 text-xs px-2 py-1 rounded">
            {skill}
          </span>
        ))}
      </div>

      {/* footer */}
      <div className="flex justify-between items-center">
        <span className="text-blue-600 font-semibold text-sm">
          {salary} 
        </span>

        <button className="text-xs bg-blue-100 text-blue-600 px-5 py-3 rounded-sm">
          Apply Now
        </button>
      </div>
    </div>
  );
}