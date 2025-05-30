import { Loader2 } from "lucide-react";

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}