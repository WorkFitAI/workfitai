import Image from "next/image";

const JobDetailThumb = ({ bannerUrl }: { bannerUrl: string | null }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl mb-6">
      <Image
        src={bannerUrl || "/imgs/page/job-single/thumb.png"}
        alt="Job Detail Thumbnail"
        width={1326}
        height={363}
        className="w-full h-auto object-cover"
        priority
      />
    </div>
  );
};

export default JobDetailThumb;
