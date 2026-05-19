export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="glass-panel overflow-hidden rounded-[2rem] p-5">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-slate-200/80" />
              <div className="space-y-2">
                <div className="h-4 w-28 rounded-full bg-slate-200/80" />
                <div className="h-3 w-20 rounded-full bg-slate-100" />
              </div>
            </div>
            <div className="h-72 rounded-[1.7rem] bg-slate-200/80" />
            <div className="h-4 w-2/3 rounded-full bg-slate-200/80" />
            <div className="h-4 w-1/2 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

