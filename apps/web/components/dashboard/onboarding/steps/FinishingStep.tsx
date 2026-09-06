import { Loader2 } from "lucide-react";

export function FinishingStep() {
  return (
    <div className="animate-in zoom-in-95 flex flex-col items-center justify-center flex-1 space-y-4 text-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <h2 className="text-xl font-semibold">Configuring your dashboard...</h2>
      <p className="text-muted-foreground">This will just take a second.</p>
    </div>
  );
}
