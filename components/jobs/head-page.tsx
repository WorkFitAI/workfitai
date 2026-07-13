import { HomeHeroSearch } from "@/components/home/home-hero-search";

const JobsHeadPage = ({ total }: { total: number }) => {
  return (
    <div className="h-[293px] px-3 py-16 bg-blue-100 flex justify-center border rounded-xl">
      <div className="w-[726px] h-[113px] flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-center">
          <span className="text-blue-500">{total} Jobs</span>
          <span className="ml-2">Available Now</span>
        </h1>
        <p className="text-md text-gray-600 text-center">
          Find your dream job right now and explore thousands of opportunities
          from top companies around the world. Start your journey toward a
          successful career today.
        </p>
        <HomeHeroSearch />
      </div>
    </div>
  );
};

export default JobsHeadPage;
