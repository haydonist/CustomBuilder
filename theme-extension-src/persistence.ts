import type { SavedBelt } from "./belt-wizard.ts";

/**
 * Bumped whenever the persisted shape changes incompatibly. Older payloads
 * are dropped on load rather than migrated — the catalog can always be
 * rebuilt from scratch.
 */
const VERSION = 1;
const STORAGE_KEY = `beltbuilder:wizard:v${VERSION}`;
/** Drafts older than this are discarded on load. */
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Debounce window for save-on-render. */
const DEBOUNCE_MS = 250;

export interface SerializedSavedBelt extends Omit<SavedBelt, "selection"> {
  selection: Record<string, string[]>;
}

export interface PersistedDraft {
  version: number;
  timestamp: number;
  stepId?: string;
  currentSelection?: Record<string, string[]>;
  currentBeltUid?: string;
  savedBelts?: SerializedSavedBelt[];
}

function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const s = window.localStorage;
    const probe = "__bb_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function clearPersistedDraft(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(STORAGE_KEY);
  } catch {
    // best-effort; ignore
  }
}

export function loadPersistedDraft(): PersistedDraft | null {
  const s = storage();
  if (!s) return null;
  let raw: string | null;
  try {
    raw = s.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: PersistedDraft;
  try {
    parsed = JSON.parse(raw);
  } catch {
    try { s.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return null;
  }

  if (parsed.version !== VERSION) {
    try { s.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return null;
  }
  if (typeof parsed.timestamp !== "number" || Date.now() - parsed.timestamp > TTL_MS) {
    try { s.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return null;
  }
  return parsed;
}

function isQuotaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const name = err.name;
  return (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    /quota/i.test(err.message)
  );
}

export function savePersistedDraft(
  draft: Omit<PersistedDraft, "version" | "timestamp">,
): void {
  const s = storage();
  if (!s) return;

  // Nothing meaningful to persist; clear instead so a stale draft doesn't
  // resurrect after the user empties everything.
  const hasCurrent = draft.currentSelection && Object.keys(draft.currentSelection).length > 0;
  const hasSaved = !!draft.savedBelts?.length;
  if (!hasCurrent && !hasSaved) {
    try { s.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return;
  }

  const payload: PersistedDraft = {
    ...draft,
    version: VERSION,
    timestamp: Date.now(),
  };

  const write = (body: PersistedDraft): boolean => {
    try {
      s.setItem(STORAGE_KEY, JSON.stringify(body));
      return true;
    } catch (err) {
      if (!isQuotaError(err)) {
        console.warn("[persistence] save failed:", err);
      }
      return false;
    }
  };

  if (write(payload)) return;

  // Composite previews are the dominant cost (base64 JPEGs). Drop them and
  // retry — selections survive, thumbnails will repopulate on next edit.
  const lighter: PersistedDraft = {
    ...payload,
    savedBelts: payload.savedBelts?.map(({ compositePreview: _drop, ...rest }) => rest),
  };
  if (write(lighter)) return;

  // Last resort: drop saved belts entirely so at least the current draft survives.
  const minimal: PersistedDraft = {
    ...payload,
    savedBelts: undefined,
  };
  write(minimal);
}

export function serializeSelection(selection: FormData | null): Record<string, string[]> | undefined {
  if (!selection) return undefined;
  const out: Record<string, string[]> = {};
  const seen = new Set<string>();
  for (const [key] of selection.entries()) {
    if (seen.has(key)) continue;
    seen.add(key);
    out[key] = selection.getAll(key) as string[];
  }
  return out;
}

export function deserializeSelection(obj: Record<string, string[]> | undefined): FormData | null {
  if (!obj || !Object.keys(obj).length) return null;
  const fd = new FormData();
  for (const [key, values] of Object.entries(obj)) {
    for (const v of values) fd.append(key, v);
  }
  return fd;
}

export function serializeSavedBelt(belt: SavedBelt): SerializedSavedBelt {
  const selection: Record<string, string[]> = {};
  for (const [key, values] of belt.selection.entries()) {
    selection[key] = [...values];
  }
  return { ...belt, selection };
}

export function deserializeSavedBelt(belt: SerializedSavedBelt): SavedBelt {
  const selection = new Map<string, string[]>();
  for (const [key, values] of Object.entries(belt.selection)) {
    selection.set(key, [...values]);
  }
  return { ...belt, selection };
}

export const DEBOUNCE_PERSIST_MS = DEBOUNCE_MS;
