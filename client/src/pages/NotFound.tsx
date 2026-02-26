import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Ghost } from "lucide-react";
import { Button } from "../components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Animated Icon Container */}
        <div className="relative inline-block">
          <div className="w-32 h-32 bg-spa-teal/10 rounded-[2.5rem] flex items-center justify-center text-spa-teal animate-bounce duration-[2000ms]">
            <Ghost size={64} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg shadow-red-500/20">
            404
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black text-foreground tracking-tight">
            Lost at Sea?
          </h1>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed">
            The page you are looking for has drifted away or never existed in our sanctuary. Let's get you back to tranquility.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            onClick={() => navigate("/")}
            className="flex-1 h-14 bg-spa-teal hover:bg-spa-teal-dark text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-spa-teal/20 transition-all hover:-translate-y-1 group"
          >
            <Home className="mr-2 group-hover:scale-110 transition-transform" size={20} />
            Return Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 h-14 rounded-2xl border-border hover:bg-muted font-black uppercase tracking-widest transition-all hover:border-spa-teal/50"
          >
            <ArrowLeft className="mr-2" size={20} />
            Go Back
          </Button>
        </div>

        <div className="pt-12">
          <p className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
            Comftay - EST 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
