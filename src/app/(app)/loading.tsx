import { SkeletonBlock } from "@/components/ui/states";

export default function AppLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonBlock className="h-64 w-full rounded-xl" />
        <SkeletonBlock className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
