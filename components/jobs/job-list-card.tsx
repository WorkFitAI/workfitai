import Image from "next/image";

import { Briefcase, MapPin, Clock } from "lucide-react";

const JobListCard = () => {
  return (
    <div className="bg-white border rounded-xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition">
      {/* Top */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          {/* Logo */}
          <Image
            src="/imgs/brands/brand-3.png"
            alt="company logo"
            width={48}
            height={48}
            className="rounded-lg object-cover"
          />

          <div>
            <p className="font-bold text-gray-800">Dailymotion</p>
            <p className="flex items-center text-xs text-gray-500 gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              New York, US
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            Adobe XD
          </span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Figma</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800">Full Stack Engineer</h2>

      {/* Job info */}
      <div className="flex gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Briefcase className="w-3 h-3 text-gray-400" />
          Full time
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-gray-400" />3 mins ago
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed">
        The Tech Studio Design team has a vision to establish a trusted platform
        that enables productive and healthy enterprises in a world of digital
        and remote everything.
      </p>

      {/* Bottom */}
      <div className="flex justify-between items-center mt-1">
        <p className="text-blue-600 font-semibold text-md">
          $500 <span className="text-gray-400 text-sm">/Hour</span>
        </p>

        <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm hover:bg-blue-200">
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobListCard;
