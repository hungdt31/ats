import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

function Spinner({ className, strokeWidth, ...props }: React.ComponentProps<"svg">) {
  const finalStroke = strokeWidth !== undefined ? (typeof strokeWidth === "number" ? strokeWidth : parseFloat(strokeWidth)) : 2;
  return (
    <HugeiconsIcon icon={Loading03Icon} strokeWidth={isNaN(finalStroke) ? 2 : finalStroke} role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
