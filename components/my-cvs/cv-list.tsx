import { CVMetadata } from "@/types/cv";
import { Skeleton } from "@/components/ui/skeleton";
import CVCard from "./cv-card";

interface Props {
  cvs: CVMetadata[];
  loading: boolean;
  onDeleted: () => void;
}

function CVListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-[84px] w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function CVList({ cvs, loading, onDeleted }: Props) {
  if (loading) return <CVListSkeleton />;

  if (cvs.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        No CVs uploaded yet. Upload your first CV to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cvs.map((cv) => (
        <CVCard key={cv.cvId} cv={cv} onDeleted={onDeleted} />
      ))}
    </div>
  );
}
