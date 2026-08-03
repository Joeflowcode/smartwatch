import { SkeletonBlock } from "@/components/ui/states";

export default function MarketingLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-16" aria-busy="true">
      <SkeletonBlock className="h-12 w-2/3 max-w-md" />
      <SkeletonBlock className="h-6 w-full max-w-xl" />
      <SkeletonBlock className="h-6 w-5/6 max-w-lg" />
      <div className="flex gap-3">
        <SkeletonBlock className="h-11 w-36" />
        <SkeletonBlock className="h-11 w-36" />
      </div>
    </div>
  );
}
