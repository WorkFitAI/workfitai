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

  // Self-uploaded CVs (deletable) vs CVs used in a job application (view-only).
  const ownCvs = cvs.filter((cv) => cv.applicationId === null);
  const applicationCvs = cvs.filter((cv) => cv.applicationId !== null);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">My CVs</h2>
        {ownCvs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No self-uploaded CVs yet.
          </p>
        ) : (
          <div className="space-y-3">
            {ownCvs.map((cv) => (
              <CVCard key={cv.cvId} cv={cv} onDeleted={onDeleted} />
            ))}
          </div>
        )}
      </section>

      {applicationCvs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Used in Applications
          </h2>
          <div className="space-y-3">
            {applicationCvs.map((cv) => (
              <CVCard key={cv.cvId} cv={cv} onDeleted={onDeleted} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
