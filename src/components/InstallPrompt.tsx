import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

const PROMPT_INTERVAL_DAYS = 0; // change to >0 to reduce prompt frequency

const InstallPrompt = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nav = window.navigator as NavigatorStandalone;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone;
    if (isStandalone) return;

    const dismissed = sessionStorage.getItem("pwa-install-dismissed");
    const last = Number(localStorage.getItem("pwa-install-last") || "0");
    const interval = PROMPT_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
    const shouldShow = !dismissed && (interval === 0 || Date.now() - last > interval);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (shouldShow) {
        setVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    setVisible(false);
    deferred.prompt();
    await deferred.userChoice;
    sessionStorage.setItem("pwa-install-dismissed", "true");
    localStorage.setItem("pwa-install-last", Date.now().toString());
    setDeferred(null);
  };

  const dismiss = () => {
    sessionStorage.setItem("pwa-install-dismissed", "true");
    localStorage.setItem("pwa-install-last", Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center">
      <div className="flex items-center gap-2 rounded-md border bg-background p-4 shadow-lg">
        <span className="text-sm">Install this app?</span>
        <Button onClick={install}>Install</Button>
        <Button variant="ghost" onClick={dismiss}>
          Not now
        </Button>
      </div>
    </div>
  );
};

export default InstallPrompt;
