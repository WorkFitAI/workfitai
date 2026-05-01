interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center gap-1 px-3 py-2 bg-white border rounded-full shadow-sm">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1 text-sm text-gray-500 disabled:opacity-50"
        >
          ← Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-full text-sm ${
              p === page
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1 text-sm text-gray-500 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}