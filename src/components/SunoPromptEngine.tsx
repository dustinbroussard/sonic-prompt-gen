import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  Moon, 
  SunMedium, 
  Settings, 
  Info, 
  Send, 
  Copy, 
  Check, 
  Download, 
  Database, 
  ChevronDown, 
  Loader2, 
  Trash2, 
  Save, 
  FolderOpen,
  Music,
  Sparkles,
  Zap,
  Download as DownloadIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem 
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { onInstallableChange, triggerInstall } from "@/pwa/install";

// Constants & Utilities
const LS_KEYS = {
  apiKey: "sunoPE_apiKey",
  model: "sunoPE_model",
  theme: "sunoPE_theme",
  presets: "sunoPE_presets",
  history: "sunoPE_history",
  pwaPromptDays: "sunoPE_pwaPromptDays",
};

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

// Dustin's system prompt preserved in full
const SYSTEM_PROMPT = `Your job is to write prompts for Suno.com.  You'll receive a request and output the prompt using the following guidelines:   
  
  
---  
  
Suno v4.5 Metatag & Prompt Reference (Master List)  
  
  
---  
  
I. Song Structure Tags  
  
Mark sections, arrangement, or transitions. Use at the start of a line.  
  
[Intro]  
[Verse]  
[Verse 1]  
[Verse 2]  
[Pre-Chorus]  
[Chorus]  
[Post-Chorus]  
[Bridge]  
[Break]  
[Drop]  
[Hook]  
[Instrumental]  
[Instrumental Break]  
[Outro]  
[Ending]  
[Fade Out]  
[Build-Up]  
[Refrain]  
[Guitar Solo]  
[Piano Solo]  
[Bass Solo]  
[Drum Solo]  
[Solo]  
  
Tip: These can be stacked or combined, e.g. [Chorus: High Energy] or [Bridge: Instrumental, Key Change].  
  
  
---  
  
II. Genre, Style & Era Tags  
  
Specify genre, subgenre, blend, and stylistic influences.  
  
[Genre: Pop]  
[Genre: Rock]  
[Genre: Blues]  
[Genre: Funk]  
[Genre: Soul]  
[Genre: Jazz]  
[Genre: EDM]  
[Genre: Hip-Hop]  
[Genre: Gospel]  
[Genre: Country]  
[Genre: Metal]  
[Genre: Folk]  
[Genre: Classical]  
[Genre: Synthwave]  
[Genre: Punk]  
[Genre: R&B]  
[Genre: Reggae]  
[Genre: House]  
[Genre: Orchestral Rock]  
[Genre: Lo-fi]  
[Genre: Indie]  
[Genre: Disco]  
[Genre: Afrobeat]  
[Genre: Bossa Nova]  
[Genre: Latin]  
[Genre: Prog Rock]  
[Genre: Grunge]  
[Genre: Trap]  
[Genre: Punk Rock]  
[Genre: Jazz House]  
[Style: 1970s]  
[Style: 1980s]  
[Style: 1990s]  
[Style: Vintage]  
[Style: Modern]  
[Style: Lo-fi]  
[Style: Synthwave]  
[Style: Orchestral]  
[Style: Cinematic]  
[Style: Acoustic]  
[Style: Ballad]  
[Style: Anthemic]  
[Style: Upbeat]  
[Style: Slow]  
[Style: Fast]  
[Style: Swing]  
[Style: Live]  
[Style: Analog]  
[Style: Raw]  
[Style: Studio]  
[Style: Dance]  
[Style: Epic]  
[Style: Minimal]  
[Style: Experimental]  
  
Tip: Blend by stacking genres/styles, e.g. [Genre: EDM] [Genre: Folk] [Style: Cinematic].  
  
  
---  
  
III. Instrumentation Tags  
  
Define which instruments are present, their role, or priority.  
  
[Instrument: Piano]  
[Instrument: Grand Piano]  
[Instrument: Felt Piano]  
[Instrument: Electric Guitar]  
[Instrument: Acoustic Guitar]  
[Instrument: Slide Guitar]  
[Instrument: Bass Guitar]  
[Instrument: Upright Bass]  
[Instrument: Synth]  
[Instrument: Synth Pad]  
[Instrument: Strings]  
[Instrument: Strings (Legato)]  
[Instrument: Strings (Staccato)]  
[Instrument: Brass]  
[Instrument: Horns]  
[Instrument: Trumpet]  
[Instrument: Saxophone]  
[Instrument: Harmonica]  
[Instrument: Organ]  
[Instrument: Hammond Organ]  
[Instrument: Clavinet]  
[Instrument: Drums]  
[Instrument: Drums (Heavy)]  
[Instrument: Drums (Soft)]  
[Instrument: Drum Machine]  
[Instrument: Percussion]  
[Instrument: Handclaps]  
[Instrument: Violin]  
[Instrument: Cello]  
[Instrument: Flute]  
[Instrument: Dobro]  
[Instrument: Banjo]  
[Instrument: Mandolin]  
[Instrument: Choir]  
[Instrumental]  
[Instrumental Chorus]  
[Instrumental Break]  
[Guitar Solo]  
[Piano Solo]  
[Bass Solo]  
[Drum Solo]  
[Riff]  
[Guitar Riff]  
[Bass Riff]  
[Piano Riff]  
[Synth Riff]  
[Layered Riff]  
[Solo Riff]  
[Call & Response Riff]  
[Melodic Interlude]  
  
Tip: Use "prominent," "background," or "subtle" in text to specify mix role. E.g. [Instrument: Electric Guitar (Prominent)].  
  
  
---  
  
IV. Mood, Emotion & Energy Tags  
  
Control the emotional tone, atmosphere, and intensity.  
  
[Mood: Uplifting]  
[Mood: Melancholic]  
[Mood: Somber]  
[Mood: Dark]  
[Mood: Joyful]  
[Mood: Happy]  
[Mood: Sad]  
[Mood: Hopeful]  
[Mood: Intense]  
[Mood: Cinematic]  
[Mood: Dreamy]  
[Mood: Reflective]  
[Mood: Aggressive]  
[Mood: Emotional]  
[Mood: Gritty]  
[Mood: Raw]  
[Mood: Nostalgic]  
[Mood: Triumphant]  
[Mood: Romantic]  
[Mood: Energetic]  
[Mood: Calm]  
[Mood: Mysterious]  
[Mood: Inspiring]  
[Mood: Playful]  
[Mood: Chill]  
[Mood: Epic]  
[Mood: Smooth]  
[Mood: Funky]  
[Mood: Dramatic]  
[Mood: Soulful]  
[Mood: Groovy]  
[Mood: Atmospheric]  
[Mood: Euphoric]  
[Atmosphere: Serene Ambience]  
[Atmosphere: Ghostly Echoes]  
[Energy: High]  
[Energy: Medium]  
[Energy: Low]  
[Dynamic]  
[Building Intensity]  
[Climactic]  
[Minimal]  
[Catchy Hook]  
[Catchy Melody]  
[Anthemic]  
[Slow Burn]  
[Raw]  
[Lo-fi]  
[Vintage]  
[Cinematic]  
[Analog]  
[Live]  
  
Tip: Mood tags are stackable and can be paired with energy/dynamic for nuanced results.  
  
  
---  
  
V. Tempo, Rhythm & Meter Tags  
  
Set speed, groove, and time signature.  
  
[Tempo: Slow]  
[Tempo: Medium]  
[Tempo: Mid]  
[Tempo: Fast]  
[Tempo: 120 BPM]      *(not always precise, but can work)*  
[Tempo: Uptempo]  
[Tempo: Downtempo]  
[Four-on-the-Floor]  
[Straight Beat]  
[Swing Feel]  
[Swing Rhythm]  
[Syncopated Rhythm]  
[Half-Time Beat]  
[Polyrhythm]  
[Groove: Funky]  
[Rhythm: Bossa Nova]  
[3/4 Time]  
[6/8 Time]  
  
Tip: BPM is not always obeyed, but slow/fast/uptempo are effective. Use explicit meter tags for waltz or shuffle.  
  
  
---  
  
VI. Vocalist, Harmony & Delivery Tags  
  
Shape the voice type, harmony, group vocals, and performance style.  
  
[Vocalist: Male]  
[Vocalist: Female]  
[Vocalist: Tenor]  
[Vocalist: Baritone]  
[Vocalist: Alto]  
[Vocalist: Bass]  
[Vocalist: Soprano]  
[Male Vocal]  
[Female Vocal]  
[Vocalist: Child]  
[Vocalist: Choir]  
[Vocalist: Group]  
[Vocalist: Duet]  
[Duet]  
[Lead Vocal]  
[Backing Vocals]  
[Harmony]  
[Harmony: Yes]  
[Harmonies]  
[Choir]  
[Vocal Style: Whisper]  
[Vocal Style: Raspy]  
[Vocal Style: Operatic]  
[Vocal Style: Soulful]  
[Vocal Style: Spoken]  
[Vocal Style: Emotional]  
[Vocal Style: Lounge]  
[Vocal Tone: Whisper]  
[Vocal Tone: Raw]  
[Vocal Tone: Smooth]  
[Rap Verse]  
[Spoken Word]  
[Spoken Word: "text"]  
[Primal Scream]  
[Vulnerable Vocals]  
[Shout]  
[Background Vocals]  
[Ad-lib]  
  
Tip: To force harmonies in a section, add [Harmony: Yes] or put harmony lines in parentheses in lyrics.  
  
  
---  
  
VII. Effects, Mixing & Production Tags  
  
Affect production, effects, and mix characteristics.  
  
[Vocal Effect: Reverb]  
[Vocal Effect: Delay]  
[Vocal Effect: Autotune]  
[Vocal Effect: Distortion]  
[Vocal Effect: Echo]  
[Vocal Effect: Dry]  
[Reverb Heavy]  
[Lo-fi]  
[Vintage]  
[Distorted Mix]  
[Clean Mix]  
[Analog]  
[Polished]  
[Raw]  
[Studio]  
[Surround Mix]  
[Bass Heavy]  
[Bass Boost]  
[Crisp Vocals]  
[Room Reverb]  
[Drum Machine]  
[Vinyl Crackle]  
[Tape Hiss]  
[Mono]  
[Stereo]  
[Enhanced Stereo]  
[Balanced]  
[Polished Mastering]  
[Radio Ready]  
  
Tip: Do not rely on "studio quality" or "Dolby Atmos" for higher fidelity—they're ignored or cause confusion.  
  
  
---  
  
VIII. Progression, Complexity & Advanced Arrangement Tags  
  
Influence harmony, chord changes, and arrangement.  
  
[Complex Progression]  
[Simple Progression]  
[Dynamic]  
[Epic]  
[Layered]  
[Pedal Tone]  
[Arpeggiated]  
[Polyphonic]  
[Key: C Major]  
[Key: A Minor]  
[Key: Dorian]  
[Chords: Em | C | G | D]  
[Blues Scale]  
[Modal]  
[12-bar Blues]  
[II-V-I]  
[Jazzy Chords]  
[Bluesy Progression]  
[Walking Bass]  
[Riff]  
[Melodic Riff]  
[Counterpoint]  
[Call & Response]  
  
Tip: Not all advanced tags are strictly recognized, but "Complex Progression," "Dynamic," "Epic," "Blues Scale," and "Jazzy Chords" are well documented. "Chords: ..." syntax is experimental but sometimes works.  
  
  
---  
  
IX. Sectional & Transitional Tags  
  
Control how song sections move or build.  
  
[Build]  
[Build-Up]  
[Breakdown]  
[Crescendo]  
[Sudden Drop]  
[Drop]  
[Climax]  
[Transition]  
[Pause]  
[Stop]  
[Restart]  
[Key Change]  
[Half-Time]  
[Double-Time]  
  
Tip: For transitions, describe them in prose if tags don't work: "after the chorus, sudden stop, then a big drop."  
  
  
---  
  
X. Miscellaneous & Special Tags  
  
Handle spoken parts, languages, or other special behaviors.  
  
[Spoken Word]  
[Spoken Word: "your text"]  
[Language: Spanish]         *(not always obeyed, but can help)*  
[No Vocals]  
[A Cappella]  
[Instrumental]  
[Instrumental Verse]  
[Instrumental Chorus]  
[Ad-lib]  
[Parenthetical (background/ad-lib) lyrics]  
  
Tip: Anything in parentheses in lyrics is often rendered as an ad-lib or background vocal.  
  
  
---  
  
Tag Formatting Rules  
  
Square brackets [ ... ] required for tags  
  
One tag per bracket is safest, but multi-item tags (e.g. [Chorus: High Energy, Anthemic]) work  
  
Stack tags above or before each section, or at the top for global  
  
Place most critical tags (genre, mood, instrument) early—first 20 words get extra weight  
  
Repeat key tags in new sections to reinforce (esp. genre, mood, harmony)  
  
  
---  
  
Usage Notes & Pro Tips  
  
Suno v4.5 understands both strict tag syntax and descriptive language. Combining both works best.  
  
Tags can be stacked for blends:  
[Genre: Funk] [Genre: Jazz] [Style: Cinematic] [Mood: Uplifting] [Instrument: Clavinet] [Harmony: Yes]  
  
For instruments not responding, try stacking instrument tag with arrangement:  
[Intro: Solo Piano] or [Verse: Prominent Saxophone]  
  
For vocals, "Duet," "Choir," "Harmony: Yes" and parentheticals are very effective.  
  
Exclusions (e.g. "no pop, no synth") should be given in plain language; not an official tag but very effective.  
  
If you want to force genre-hybrids or "rare" outputs, combine tags that rarely co-occur ("gospel metal ballad," "funk dirge").  
  
"Complex Progression," "Dynamic," "Epic," "Minimal" and "Anthemic" are powerful meta-tags for song arc.  
  
Experiment! Not all tags are 100% deterministic, but stacking and repeating in relevant sections increases compliance.  
  
  
---  
  
Copy-Paste Tag Blocks for Prompts  
  
[Genre: _____]  
[Style: _____]  
[Era: _____]  
[Mood: _____]  
[Energy: _____]  
[Tempo: _____]  
[Instrument: _____]  
[Vocalist: _____]  
[Harmony: Yes]  
[Chorus]  
[Bridge]  
[Solo]  
[Outro]  
  
Fill in, stack as needed, repeat per section for structure.  
  
  
---  
  
You output only the prompt using a mix of metatags and natural language. Include the requested elements and imply from the request what elements you need to include in the [Exclude: ] field`;

// Utility functions
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

function copy(text: string) {
  return navigator.clipboard.writeText(text || "");
}

function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Parse model output into three lanes
function parseOutputs(raw: string) {
  if (!raw) return { natural: "", tags: [], exclude: "" };
  
  const tagRegex = /\[[^\]]+\]/g;
  const allTags = raw.match(tagRegex) || [];
  const tags: string[] = [];
  let exclude = "";
  
  for (const t of allTags) {
    const inner = t.slice(1, -1).trim();
    if (/^exclude\s*:/i.test(inner)) {
      exclude += (exclude ? "\n" : "") + t;
    } else {
      tags.push(t);
    }
  }
  
  const natural = (raw || "").replace(tagRegex, "").replace(/\n{3,}/g, "\n\n").trim();
  return { natural, tags, exclude };
}

// Combine for export
function bundleTxt(natural: string, tags: string[], exclude: string) {
  const tagBlock = tags.length ? tags.join("\n") : "";
  return [
    "# Natural Language Description\n",
    natural,
    "\n\n# Style Meta Tags\n",
    tagBlock,
    "\n\n# Exclude Metatags\n",
    exclude || "",
  ].join("");
}

// Types
interface Model {
  id: string;
  name: string;
  context_length?: number;
  pricing?: any;
  top_provider?: string;
}

interface Preset {
  id: string;
  name: string;
  prompt: string;
}

interface HistoryItem {
  ts: number;
  prompt: string;
  model: string;
  output: string;
}

interface Outputs {
  natural: string;
  tags: string[];
  exclude: string;
}

// Main Component
export default function SunoPromptEngine() {
  const [theme, setTheme] = useLocalStorage(LS_KEYS.theme, "dark");
  const [apiKey, setApiKey] = useLocalStorage(LS_KEYS.apiKey, "");
  const [models, setModels] = useState<Model[]>([]);
  const [model, setModel] = useLocalStorage(LS_KEYS.model, "");
  const [openSettings, setOpenSettings] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<Outputs>({ natural: "", tags: [], exclude: "" });
  const [copied, setCopied] = useState({ n: false, t: false, e: false });
  const [presets, setPresets] = useLocalStorage<Preset[]>(LS_KEYS.presets, []);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(LS_KEYS.history, []);
  const [err, setErr] = useState("");
  const [installable, setInstallable] = useState(false);
  const [pwaDays, setPwaDays] = useLocalStorage<number>(LS_KEYS.pwaPromptDays, 0);

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    const unsub = onInstallableChange((v) => setInstallable(v));
    return unsub;
  }, []);

  async function fetchModels() {
    setLoadingModels(true);
    setErr("");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${OPENROUTER_BASE}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`Model fetch failed (${res.status})`);
      const json = await res.json();
      const list = (json?.data || []).map((m: any) => ({
        id: m.id,
        name: m.id,
        context_length: m?.context_length,
        pricing: m?.pricing,
        top_provider: m?.top_provider?.name,
      }));
      setModels(list);
      if (!model && list.length) setModel(list[0].id);
    } catch (e) {
      if ((e as any)?.name === 'AbortError') setErr("Model fetch timed out. Please try again.");
      else setErr((e as Error).message || "Unable to fetch models.");
    } finally {
      setLoadingModels(false);
    }
  }

  async function send() {
    setErr("");
    if (!apiKey) {
      setErr("Add your OpenRouter API key in Settings.");
      setOpenSettings(true);
      return;
    }
    if (!model) {
      setErr("Choose a model.");
      return;
    }
    if (!prompt.trim()) {
      setErr("Describe what you want Suno to create.");
      return;
    }
    
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Suno Prompt Engine",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt.trim() },
          ],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content || "";
      const parsed = parseOutputs(text);
      setOutputs(parsed);
      setHistory([
        { ts: Date.now(), prompt: prompt.trim(), model, output: text },
        ...history.slice(0, 49),
      ]);
    } catch (e) {
      if ((e as any)?.name === 'AbortError') setErr("Request timed out. Please try again.");
      else setErr((e as Error).message || "Request error.");
    } finally {
      setLoading(false);
    }
  }

  function exportAll() {
    const txt = bundleTxt(outputs.natural, outputs.tags, outputs.exclude);
    const safe = (prompt.slice(0, 40) || "suno-prompt").replace(/[^a-z0-9\-\_]+/gi, "-");
    downloadTxt(`${safe}.txt`, txt);
  }

  function savePreset() {
    if (!prompt.trim()) return;
    const name = prompt.split("\n")[0].slice(0, 40) || `Preset ${presets.length + 1}`;
    const item = { id: crypto.randomUUID(), name, prompt: prompt.trim() };
    setPresets([item, ...presets].slice(0, 30));
  }

  function loadPreset(p: Preset) {
    setPrompt(p.prompt);
  }

  function deletePreset(id: string) {
    setPresets(presets.filter((x) => x.id !== id));
  }

  function copyAndFlash(which: 'n' | 't' | 'e', text: string) {
    copy(text).then(() => {
      setCopied((c) => ({ ...c, [which]: true }));
      setTimeout(() => setCopied((c) => ({ ...c, [which]: false })), 1200);
    });
  }

  const modelLabel = useMemo(() => 
    models.find((m) => m.id === model)?.name || model || "Select a model", 
    [models, model]
  );

  return (
    <div ref={rootRef} className="min-h-screen w-full bg-background text-foreground antialiased">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Enhanced Top Bar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-gradient-glass border-b border-border/30 backdrop-blur-xl shadow-lg"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center gap-3 justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Music className="h-6 w-6 text-primary-foreground" />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <div className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent leading-tight">
                Suno Prompt Engine
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                OpenRouter • v2.0 PWA
                <Zap className="h-3 w-3 text-primary animate-pulse" />
              </div>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2">
            {/* Install App Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  const outcome = await triggerInstall();
                  if (outcome === 'dismissed') {
                    try { sessionStorage.setItem('pwa-prompt-dismissed', 'true'); } catch {}
                  }
                  try { localStorage.setItem('pwa-prompt-last', Date.now().toString()); } catch {}
                }}
                className="hover-lift hover-glow rounded-xl"
                aria-label="Install App"
                disabled={!installable}
                title={installable ? 'Install App' : 'Install not available'}
              >
                <DownloadIcon className="h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOpenAbout(true)} 
                className="hover-lift hover-glow rounded-xl"
                aria-label="About"
              >
                <Info className="h-5 w-5" />
              </Button>
            </motion.div>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { 
                  setOpenSettings(true); 
                  if (!models.length && apiKey) fetchModels(); 
                }} 
                className="hover-lift hover-glow rounded-xl relative"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
                {!apiKey && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Main Content */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        {/* Model & Presets Row */}
        <motion.div 
          className="flex flex-col lg:flex-row gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex-1">
            <ModelPicker
              value={model}
              display={modelLabel}
              options={models}
              loading={loadingModels}
              disabled={!apiKey}
              onOpen={() => { if (apiKey && !models.length) fetchModels(); }}
              onSelect={(id) => setModel(id)}
            />
          </div>
          <PresetControls 
            presets={presets} 
            onLoad={loadPreset} 
            onDelete={deletePreset} 
            onSave={savePreset} 
          />
        </motion.div>

        {/* Enhanced Prompt Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-glass hover-lift border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-0.5 rounded-3xl">
              <div className="bg-background rounded-3xl">
                <CardHeader className="pb-4 px-8 pt-8">
                  <CardTitle className="text-2xl flex items-center gap-3 font-bold">
                    <motion.div
                      className="p-2 rounded-xl bg-primary/10"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <Sparkles className="h-6 w-6 text-primary" />
                    </motion.div>
                    Describe your track
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 px-8 pb-8">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., gritty blues-rock anthem about starting over, big chorus, call-and-response guitars, [Tempo: Mid], [Vocalist: Male], exclude pop/synth"
                    className="min-h-[180px] text-base resize-none border-0 bg-muted/30 rounded-2xl focus:ring-2 focus:ring-primary/50 transition-all duration-300 placeholder:text-muted-foreground/70 shadow-inner"
                    rows={7}
                  />
                  <div className="flex items-center justify-between">
                    <motion.div 
                      className="text-sm text-muted-foreground flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      System prompt preloaded for Suno v4.5
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={send} 
                        disabled={loading} 
                        className="btn-primary gap-3 px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300" 
                        size="lg"
                        aria-label="Send"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                        {loading ? "Generating..." : "Generate Prompt"}
                      </Button>
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {err && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -10 }}
                        className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive"
                      >
                        <p className="text-sm font-medium">{err}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Outputs */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <OutputBox
            title="Natural Language"
            value={outputs.natural}
            onCopy={() => copyAndFlash("n", outputs.natural)}
            copied={copied.n}
            icon={<Music className="h-5 w-5" />}
            gradient="from-blue-500/20 to-cyan-500/20"
          />
          <OutputBox
            title="Style Meta Tags"
            value={(outputs.tags || []).join("\n")}
            onCopy={() => copyAndFlash("t", (outputs.tags || []).join("\n"))}
            copied={copied.t}
            icon={<Settings className="h-5 w-5" />}
            gradient="from-purple-500/20 to-pink-500/20"
          />
          <OutputBox
            title="Exclude Metatags"
            value={outputs.exclude}
            onCopy={() => copyAndFlash("e", outputs.exclude)}
            copied={copied.e}
            icon={<Trash2 className="h-5 w-5" />}
            gradient="from-red-500/20 to-orange-500/20"
          />
        </motion.div>

        {/* Enhanced Export Actions */}
        <motion.div 
          className="flex flex-wrap items-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="secondary" 
              className="btn-secondary gap-3 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300" 
              onClick={exportAll} 
              aria-label="Export all"
            >
              <Download className="h-5 w-5" />
              Export Complete .txt
            </Button>
          </motion.div>
        </motion.div>

        {/* Enhanced History */}
        {!!history.length && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="card-glass border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 px-8 pt-8">
                <CardTitle className="text-xl flex items-center gap-3 font-bold">
                  <motion.div
                    className="p-2 rounded-xl bg-accent/10"
                    whileHover={{ rotate: -5, scale: 1.1 }}
                  >
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </motion.div>
                  Recent Generations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-8 pb-8">
                {history.slice(0, 5).map((h, i) => (
                  <motion.div 
                    key={h.ts + "-" + i} 
                    className="rounded-2xl border border-border/30 p-6 space-y-4 hover-lift hover:bg-accent/20 transition-all duration-300 bg-gradient-to-r from-muted/30 to-transparent"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="font-medium">{new Date(h.ts).toLocaleString()}</div>
                      <div className="truncate max-w-[40%] bg-muted/50 px-2 py-1 rounded-lg">{h.model}</div>
                    </div>
                    <div className="text-sm line-clamp-3 whitespace-pre-wrap leading-relaxed">
                      {h.prompt}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setPrompt(h.prompt)}
                          className="hover-lift rounded-xl"
                        >
                          Reuse Prompt
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="gap-2 hover-lift rounded-xl" 
                          onClick={() => setOutputs(parseOutputs(h.output))}
                        >
                          <Sparkles className="w-4 h-4" />
                          View Output
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Enhanced Settings Modal */}
      <Dialog open={openSettings} onOpenChange={setOpenSettings}>
        <DialogContent className="sm:max-w-md bg-gradient-glass backdrop-blur-2xl border-border/30 rounded-3xl shadow-2xl">
          <DialogHeader className="space-y-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-xl"
            >
              <Settings className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <DialogTitle className="text-xl text-center">Settings</DialogTitle>
            <DialogDescription className="text-center">
              Configure your OpenRouter API key and select a model for AI generation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="api-key" className="text-sm font-medium">OpenRouter API Key</Label>
              <div className="flex items-center gap-3">
                <Input 
                  id="api-key" 
                  type="password" 
                  placeholder="sk-or-v1-..." 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 rounded-xl border-border/50 bg-muted/30"
                />
                <Button 
                  variant="outline" 
                  className="gap-2 hover-lift rounded-xl px-4" 
                  onClick={fetchModels} 
                  disabled={!apiKey || loadingModels} 
                  aria-label="Test & Fetch"
                >
                  {loadingModels ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  Fetch
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                🔒 Your API key is stored securely in your browser and only sent to OpenRouter.
              </p>
            </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">AI Model</Label>
            <ModelPicker
              value={model}
              display={modelLabel}
              options={models}
              loading={loadingModels}
              disabled={!apiKey}
              onOpen={() => { if (apiKey && !models.length) fetchModels(); }}
              onSelect={(id) => setModel(id)}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Install Prompt Frequency</Label>
            <div className="flex gap-2">
              <select
                value={pwaDays}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPwaDays(val);
                  try { localStorage.setItem('pwa-prompt-days', String(val)); } catch {}
                }}
                className="flex-1 rounded-xl border-border/50 bg-muted/30 h-10 px-3"
              >
                <option value={0}>Every session</option>
                <option value={1}>Daily</option>
                <option value={7}>Weekly</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">Controls how often the custom install banner appears.</p>
          </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setOpenSettings(false)} 
              className="btn-primary w-full rounded-xl py-3"
            >
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced About Modal */}
      <Dialog open={openAbout} onOpenChange={setOpenAbout}>
        <DialogContent className="sm:max-w-lg bg-gradient-glass backdrop-blur-2xl border-border/30 rounded-3xl shadow-2xl">
          <DialogHeader className="space-y-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-xl"
            >
              <Info className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <DialogTitle className="text-xl text-center">About Suno Prompt Engine</DialogTitle>
            <DialogDescription className="text-center">
              Professional AI-powered music prompt builder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-sm text-muted-foreground">
            <div className="bg-muted/30 p-4 rounded-2xl">
              <p className="leading-relaxed">
                Create precise Suno v4.5 prompts using our curated metatag system. Simply describe your concept, 
                choose an AI model, and get professionally formatted output ready for music generation.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Key Features
              </h4>
              <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                <li>Progressive Web App with offline support</li>
                <li>Mobile-optimized responsive design</li>
                <li>Searchable model picker with live fetch</li>
                <li>Individual copy buttons + complete export</li>
                <li>History tracking & preset management</li>
                <li>Dark/light theme with system sync</li>
              </ul>
            </div>
            <Separator className="bg-border/50" />
            <div className="text-xs text-center space-y-2">
              <p className="flex items-center justify-center gap-2">
                <span>Built with ❤️ for music creators</span>
                <Music className="w-4 h-4 text-primary" />
              </p>
              <p>
                💡 <strong>Pro tip:</strong> Place genre, mood, and key instruments in the first 20 words for best results.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setOpenAbout(false)} 
              className="btn-primary w-full rounded-xl py-3"
            >
              Get Started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced Supporting Components with modern styling
function ThemeToggle({ theme, setTheme }: { theme: string; setTheme: (theme: string) => void }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="hover-lift hover-glow rounded-xl relative overflow-hidden"
        aria-label="Toggle theme"
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === "dark" ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        >
          {theme === "dark" ? (
            <SunMedium className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </Button>
    </motion.div>
  );
}

function ModelPicker({ 
  value, 
  display, 
  options, 
  onSelect, 
  onOpen, 
  disabled, 
  loading 
}: {
  value: string;
  display: string;
  options: Model[];
  onSelect: (id: string) => void;
  onOpen?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  
  return (
    <Popover 
      open={open} 
      onOpenChange={(v) => { 
        setOpen(v); 
        if (v && onOpen) onOpen(); 
      }}
    >
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled} 
          className="w-full justify-between hover-lift rounded-2xl"
        >
          <div className="truncate text-left">{display}</div>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[400px] bg-gradient-glass backdrop-blur-lg border-border/50 rounded-2xl shadow-xl" align="start">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>
            {loading ? "Loading models..." : "No models found."}
          </CommandEmpty>
          <CommandGroup>
            {options.map((opt) => (
              <CommandItem 
                key={opt.id} 
                value={opt.id} 
                onSelect={() => { 
                  onSelect(opt.id); 
                  setOpen(false); 
                }} 
                className="flex items-center gap-2 hover:bg-accent/50 cursor-pointer rounded-lg px-3 py-2"
              >
                <span className="truncate">{opt.name}</span>
                {opt.top_provider && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {opt.top_provider}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PresetControls({ 
  presets, 
  onLoad, 
  onDelete, 
  onSave 
}: {
  presets: Preset[];
  onLoad: (preset: Preset) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
}) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        className="gap-2 hover-lift rounded-2xl px-4" 
        onClick={onSave}
      >
        <Save className="h-4 w-4" />
        Save Preset
      </Button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary" className="btn-secondary gap-2 rounded-2xl px-4">
            <FolderOpen className="h-4 w-4" />
            Presets
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-3 w-[320px] bg-gradient-glass backdrop-blur-lg border-border/50 rounded-2xl shadow-xl space-y-3 max-h-80 overflow-y-auto">
          {presets.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No presets yet.
            </div>
          ) : (
            presets.map((p) => (
              <motion.div 
                key={p.id} 
                className="flex items-center gap-2 justify-between rounded-lg border border-border/50 p-3 hover:bg-accent/30 transition-all rounded-xl"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <div className="truncate text-sm" title={p.name}>
                  {p.name}
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => { 
                      onLoad(p); 
                      setOpen(false); 
                    }} 
                    className="h-8 w-8 hover-lift rounded-xl"
                    aria-label="Load"
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onDelete(p.id)} 
                    className="h-8 w-8 hover-lift text-destructive hover:text-destructive rounded-xl"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function OutputBox({ 
  title, 
  value, 
  onCopy, 
  copied, 
  icon,
  gradient = "from-primary/10 to-accent/10"
}: {
  title: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  icon: React.ReactNode;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-glass hover-lift flex flex-col h-full border-0 shadow-xl rounded-2xl overflow-hidden">
        <div className={`bg-gradient-to-r ${gradient} p-0.5 rounded-2xl`}>
          <div className="bg-background rounded-2xl h-full">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 font-semibold">
                  <motion.div
                    className="p-1.5 rounded-lg bg-muted/30"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    {icon}
                  </motion.div>
                  {title}
                </CardTitle>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onCopy} 
                    className="hover-lift hover-glow rounded-xl"
                    aria-label={`Copy ${title}`}
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Copy className="h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-6 pb-6">
              <Textarea 
                readOnly 
                value={value} 
                className="min-h-[180px] text-sm resize-none bg-muted/30 border-0 rounded-xl focus:ring-0 shadow-inner" 
                placeholder="Generated output will appear here..."
              />
            </CardContent>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
