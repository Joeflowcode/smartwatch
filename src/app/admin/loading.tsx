import { SkeletonBlock } from "@/components/ui/states";

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10" aria-busy="true">
      <SkeletonBlock className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        <SkeletonBlock className="h-28 w-full rounded-xl" />
        <SkeletonBlock className="h-28 w-full rounded-xl" />
        <SkeletonBlock className="h-28 w-full rounded-xl" />
      </div>
    </div>
  );
}
