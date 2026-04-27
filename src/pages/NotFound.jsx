import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { GraduationCap, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Unauthorized access attempt to non-existent registry route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background selection:bg-primary/30 relative overflow-hidden">
      {/* Institutional Background Element */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-secondary/30 border-b border-border pointer-events-none" />
      
      <div className="text-center relative z-10 px-4">
        <div className="h-20 w-20 bg-primary flex items-center justify-center rounded-sm mx-auto mb-8 shadow-2xl academic-border">
           <ShieldAlert className="h-10 w-10 text-primary-foreground" />
        </div>
        
        <h1 className="text-7xl font-display font-bold text-primary mb-2">404</h1>
        <p className="text-xs uppercase tracking-[0.5em] font-bold text-accent mb-8">Registry Route Not Found</p>
        
        <div className="max-w-md mx-auto mb-10">
          <p className="text-muted-foreground text-sm leading-relaxed">
            The requested resource is not indexed in the National Academic Registry. 
            Please verify the URL or return to the main portal.
          </p>
        </div>

        <Link to="/">
          <Button className="rounded-sm h-12 px-8 uppercase text-[10px] font-bold tracking-widest gap-2 shadow-lg">
            <ArrowLeft className="h-4 w-4" /> Return to Gateway
          </Button>
        </Link>

        <div className="mt-16 pt-8 border-t border-border/50">
           <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest font-bold text-muted-foreground/60">
              <GraduationCap className="h-3 w-3" /> NAR Security Protocol
           </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

