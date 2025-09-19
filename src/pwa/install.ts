// Simple shared store for the deferred beforeinstallprompt event

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Listener = (installable: boolean) => void;

export const INSTALL_PROMPT_STORAGE = {
  frequency: "sunoPE_pwaPromptDays",
  last: "sunoPE_pwaPromptLast",
  dismissed: "sunoPE_pwaPromptDismissed",
} as const;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();

function accessStorage(type: "local" | "session"): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return type === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return undefined;
  }
}

function safeGet(storage: Storage, key: string, legacyKey?: string) {
  try {
    const value = storage.getItem(key);
    if (value !== null) return value;
    if (legacyKey) return storage.getItem(legacyKey);
  } catch {
    return null;
  }
  return null;
}

function safeSet(storage: Storage, key: string, value: string, legacyKey?: string) {
  try {
    storage.setItem(key, value);
    if (legacyKey) storage.removeItem(legacyKey);
  } catch {
    /* ignore quota errors */
  }
}

function readNumber(key: string, legacyKey?: string) {
  const storage = accessStorage("local");
  if (!storage) return 0;
  const raw = safeGet(storage, key, legacyKey);
  if (!raw) return 0;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function readPromptFrequencyDays() {
  return readNumber(INSTALL_PROMPT_STORAGE.frequency, "pwa-prompt-days");
}

export function readPromptLastShown() {
  return readNumber(INSTALL_PROMPT_STORAGE.last, "pwa-prompt-last");
}

export function wasPromptDismissedThisSession() {
  const storage = accessStorage("session");
  if (!storage) return false;
  const value = safeGet(storage, INSTALL_PROMPT_STORAGE.dismissed, "pwa-prompt-dismissed");
  return value === "true";
}

export function markPromptDismissedThisSession() {
  const storage = accessStorage("session");
  if (!storage) return;
  safeSet(storage, INSTALL_PROMPT_STORAGE.dismissed, "true", "pwa-prompt-dismissed");
}

export function stampPromptLastShown() {
  const storage = accessStorage("local");
  if (!storage) return;
  safeSet(storage, INSTALL_PROMPT_STORAGE.last, Date.now().toString(), "pwa-prompt-last");
}

export function setDeferredPrompt(ev: BeforeInstallPromptEvent | null) {
  deferredPrompt = ev;
  listeners.forEach((cb) => {
    try {
      cb(!!deferredPrompt);
    } catch {
      /* ignore listener errors */
    }
  });
}

export function clearDeferredPrompt() {
  setDeferredPrompt(null);
}

export function onInstallableChange(cb: Listener) {
  listeners.add(cb);
  // call immediately with current state
  try {
    cb(!!deferredPrompt);
  } catch {
    /* ignore listener errors */
  }
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

