import { SkeletonBlock } from "@/components/ui/states";

export default function AuthLoading() {
  return (
    <div className="w-full max-w-md space-y-4" aria-busy="true" aria-label="Loading">
      <SkeletonBlock className="h-8 w-40" />
      <SkeletonBlock className="h-4 w-64" />
      <SkeletonBlock className="h-10 w-full" />
      <SkeletonBlock className="h-10 w-full" />
      <SkeletonBlock className="h-10 w-full" />
    </div>
  );
}
