import { TextAlignJustify, LayoutGrid } from "lucide-react";

const JobToolbar = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-2 bg-white">
      {/* Left */}
      <p className="text-gray-600 text-sm">
        Showing <span className="font-medium">41–60</span> of{" "}
        <span className="font-medium">944</span> jobs
      </p>

      {/* Right */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Show */}
        <select className="border rounded-sm px-3 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option>Show: 12</option>
          <option>Show: 24</option>
          <option>Show: 36</option>
        </select>

        {/* Sort */}
        <select className="border rounded-sm px-3 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option>Sort by: Newest Post</option>
          <option>Sort by: Salary</option>
          <option>Sort by: Relevance</option>
        </select>

        {/* View buttons */}
        <div className="flex gap-2">
          <button className="p-2 border rounded-md text-gray-600 hover:bg-gray-100">
            <TextAlignJustify className="w-4 h-4" />
          </button>

          <button className="p-2 bg-blue-500 rounded-md text-white">
            <LayoutGrid className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobToolbar;
