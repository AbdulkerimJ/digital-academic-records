import { Loader2 } from "lucide-react"

export default function PageLoader({ message = "Loading content...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] w-full space-y-4 animate-in fade-in duration-500 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/10 rounded-full" />
        <Loader2 className="w-8 h-8 text-primary animate-spin absolute" />
      </div>
      <div className="flex flex-col items-center space-y-1">
        <p className="text-lg font-semibold tracking-tight text-foreground/80">{message}</p>
        <p className="text-sm text-muted-foreground animate-pulse">Please wait a moment</p>
      </div>
    </div>
  )
}
