"use client";

const JobLocationMap = ({ address }: { address: string }) => {
  if (!address) {
    return <p className="mt-5">No location available</p>;
  }

  return (
    <div className="mt-5 rounded-lg overflow-hidden border">
      <iframe
        src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`}
        width="100%"
        height="300"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-[300px] border-0"
      />
    </div>
  );
};

export default JobLocationMap;