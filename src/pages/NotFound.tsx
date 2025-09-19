import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Music, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg card-glass border border-border/40 rounded-3xl px-10 py-12 text-center space-y-8 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 220 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-xl"
        >
          <Music className="h-8 w-8 text-primary-foreground" />
        </motion.div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Error 404</p>
          <h1 className="text-3xl font-bold text-gradient">Page not found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you’re looking for doesn’t exist or may have been moved. Let’s bring you back to the Suno Prompt Engine home.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="btn-primary rounded-2xl px-6 py-3 shadow-xl hover:shadow-2xl">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-2xl px-6 py-3 hover-lift">
            <Link to="/">Explore Features</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
