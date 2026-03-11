"use client";
type Props = {
  title: string;
  action?: string;
};

const FilterHeader = ({ title, action }: Props) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {action && (
        <button className="text-sm text-blue-500 hover:underline">
          {action}
        </button>
      )}
    </div>
  );
};

export default FilterHeader;
