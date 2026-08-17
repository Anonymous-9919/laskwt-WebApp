export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="mt-2 h-4 w-32 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
            <div className="h-11 w-11 rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-6 w-12 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-4">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-muted/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
