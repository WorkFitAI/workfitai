"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { applicationService } from "@/lib/application/application-service";

interface Props {
  applicationId: string;
  jobTitle: string;
  /** Called after a successful withdrawal */
  onWithdrawn?: () => void;
  /** Render as icon-only button (default: false) */
  iconOnly?: boolean;
}

export default function ApplicationWithdrawDialog({
  applicationId,
  jobTitle,
  onWithdrawn,
  iconOnly = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      setWithdrawError(null);
      await applicationService.withdrawApplication(applicationId);
      if (onWithdrawn) {
        onWithdrawn();
      } else {
        router.push("/applied-jobs");
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      setWithdrawError("Failed to withdraw application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {iconOnly ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Withdraw application"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5">
            <Trash2 className="mr-2 h-4 w-4" />
            Withdraw Application
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Withdraw application?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to withdraw your application for{" "}
            <span className="font-semibold text-foreground">{jobTitle}</span>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {withdrawError && (
          <p className="px-1 text-sm text-destructive">{withdrawError}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleWithdraw}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Withdrawing…" : "Yes, withdraw"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
