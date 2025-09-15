// Simple shared store for the deferred beforeinstallprompt event

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Listener = (installable: boolean) => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();

export function setDeferredPrompt(ev: BeforeInstallPromptEvent | null) {
  deferredPrompt = ev;
  listeners.forEach((cb) => {
    try { cb(!!deferredPrompt); } catch {}
  });
}

export function clearDeferredPrompt() {
  setDeferredPrompt(null);
}

export function onInstallableChange(cb: Listener) {
  listeners.add(cb);
  // call immediately with current state
  try { cb(!!deferredPrompt); } catch {}
  return () => listeners.delete(cb);
}

export function isInstallable() {
  return !!deferredPrompt;
}

export async function triggerInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  const ev = deferredPrompt;
  try {
    await ev.prompt();
    const { outcome } = await ev.userChoice;
    // clear after a decision
    setDeferredPrompt(null);
    return outcome;
  } catch {
    return 'unavailable';
  }
}

