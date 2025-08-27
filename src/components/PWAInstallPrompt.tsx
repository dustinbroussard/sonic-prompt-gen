
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const PROMPT_INTERVAL_DAYS = 0; // change to >0 to reduce prompt frequency

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isApple = (window.navigator as any).standalone;
      setIsInstalled(isStandalone || isApple);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const last = Number(localStorage.getItem('pwa-prompt-last') || '0');
      const interval = PROMPT_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
      const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
      const shouldShow = !isInstalled && !dismissed && (interval === 0 || Date.now() - last > interval);

      if (shouldShow) {
        setShowPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
      sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    }

    localStorage.setItem('pwa-prompt-last', Date.now().toString());
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    localStorage.setItem('pwa-prompt-last', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-lg shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">Install Suno Prompt Engine</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Get quick access and work offline. Install this app on your device.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="flex-1 gap-1.5 h-8 text-xs bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install App
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
