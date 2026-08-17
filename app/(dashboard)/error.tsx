"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[dashboard error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while loading the dashboard.
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground">
              Error: {error.digest}
            </p>
          )}
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.push("/login")}>
              Sign in again
            </Button>
            <Button onClick={reset}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
