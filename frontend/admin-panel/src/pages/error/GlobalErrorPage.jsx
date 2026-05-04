import { useRouteError, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"

export default function GlobalErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  // Log to error reporting service in production
  console.error("Global Error Caught by Boundary:", error)

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/20 p-6">
      <div className="max-w-md w-full bg-background border border-destructive/20 shadow-lg rounded-2xl p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 shadow-sm">
          <AlertTriangle size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Oops! Application Error</h1>
        
        <div className="bg-destructive/5 p-4 rounded-lg w-full text-left mb-6 overflow-auto max-h-32 border border-destructive/10">
          <p className="text-sm font-mono text-destructive break-words">
            {error?.statusText || error?.message || "An unexpected error occurred while rendering this page."}
          </p>
        </div>

        <p className="text-muted-foreground mb-8 text-sm">
          Don't worry, your data is safe. You can try refreshing the page or navigating back to safety to continue your work.
        </p>

        <div className="flex gap-4 w-full">
          <Button 
            variant="outline" 
            className="flex-1 gap-2 shadow-sm" 
            onClick={() => window.location.reload()}
          >
            <RotateCcw size={16} /> Refresh
          </Button>
          <Button 
            className="flex-1 gap-2 shadow-sm" 
            onClick={() => navigate("/", { replace: true })}
          >
            <Home size={16} /> Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
