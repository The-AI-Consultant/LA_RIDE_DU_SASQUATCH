
import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="relative">
      <div className={cn("animate-spin rounded-full h-6 w-6 border-4 border-[#f4c542]/20 border-t-[#f4c542]", className)} />
      <div className="absolute inset-0 animate-pulse opacity-50" />
    </div>
  )
}
