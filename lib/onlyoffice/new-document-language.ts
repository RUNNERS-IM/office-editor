/**
 * RUNNERS: give a blank document the visitor's language.
 *
 * The SDK builds blank documents from templates compiled into it, and those
 * carry a fixed default text language: en-US for a document, zh-CN for a
 * presentation. A Korean visitor who started a new presentation got text
 * tagged as Chinese (shown in the status bar, and used for hyphenation and
 * East Asian font choice). Files the visitor opens keep their own language;
 * only documents created here are changed.
 */

/** Region used for each site language when the tag has none. */
const DEFAULT_REGION: Record<string, string> = {
  ar: 'ar-SA',
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  fi: 'fi-FI',
  fr: 'fr-FR',
  hi: 'hi-IN',
  id: 'id-ID',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  nl: 'nl-NL',
  pl: 'pl-PL',
  pt: 'pt-BR',
  ru: 'ru-RU',
  th: 'th-TH',
  tr: 'tr-TR',
  vi: 'vi-VN',
  zh: 'zh-CN',
};

type LcidMap = Record<string, number>;

/** Windows language id for an editor locale (`ko`, `zh-TW`, `pt-PT`), or null when the SDK has none. */
export function lcidForLocale(locale: string, map: LcidMap): number | null {
  const tag = String(locale || '').trim();
  if (!tag) return null;
  const primary = tag.split(/[-_]/)[0].toLowerCase();
  // A regional name first: the SDK map also has bare names ('ko' -> 18, the
  // neutral Korean id), which the status bar and proofing do not treat as ko-KR.
  const candidates = tag.includes('-') ? [tag, DEFAULT_REGION[primary]] : [DEFAULT_REGION[primary], tag];
  for (const name of candidates) {
    if (name && Number.isInteger(map[name])) return map[name];
  }
  const regional = Object.keys(map).find((name) => name.toLowerCase().startsWith(`${primary}-`));
  return regional ? map[regional] : null;
}

interface EditorWindow {
  editor?: {
    WordControl?: {
      m_oLogicDocument?: { GetDefaultLanguage?(): number; SetDefaultLanguage?(lcid: number): void };
    };
  };
  Asc?: { g_oLcidNameToIdMap?: LcidMap };
  AscCommon?: { g_oLcidNameToIdMap?: LcidMap; History?: { TurnOff(): void; TurnOn(): void } };
}

/**
 * Set the default text language of the blank document in `win` (the editor
 * frame) to `locale`. History is off while it changes, so the document still
 * counts as unmodified and there is nothing to undo. Returns true when the
 * language is in place (or there was nothing to change), false when the SDK
 * pieces were missing.
 */
export function applyNewDocumentLanguage(win: EditorWindow, locale: string): boolean {
  const logic = win.editor?.WordControl?.m_oLogicDocument;
  const history = win.AscCommon?.History;
  const map = win.Asc?.g_oLcidNameToIdMap ?? win.AscCommon?.g_oLcidNameToIdMap;
  if (!logic?.SetDefaultLanguage || !logic.GetDefaultLanguage || !history || !map) return false;
  const lcid = lcidForLocale(locale, map);
  if (lcid == null) return true;
  if (logic.GetDefaultLanguage() === lcid) return true;
  history.TurnOff();
  try {
    logic.SetDefaultLanguage(lcid);
  } finally {
    history.TurnOn();
  }
  return true;
}

/** Find the editor frame among `host`'s frames and apply the language there. */
export function applyNewDocumentLanguageInFrames(host: Window, locale: string): boolean {
  for (let i = 0; i < host.frames.length; i++) {
    try {
      const win = host.frames[i] as unknown as EditorWindow;
      if (win.editor?.WordControl?.m_oLogicDocument) return applyNewDocumentLanguage(win, locale);
    } catch {
      // A cross-origin frame (analytics) throws on access; skip it.
    }
  }
  return false;
}
