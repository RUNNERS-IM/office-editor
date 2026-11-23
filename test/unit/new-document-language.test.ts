import { describe, expect, it, vi } from 'vitest';
import { applyNewDocumentLanguage, lcidForLocale } from '../../lib/onlyoffice/new-document-language';

const MAP = { ko: 18, pt: 22, 'en-US': 1033, 'ko-KR': 1042, 'ja-JP': 1041, 'zh-CN': 2052, 'zh-TW': 1028, 'pt-BR': 1046, 'pt-PT': 2070, 'es-AR': 11274, 'es-ES': 3082 };

describe('lcidForLocale', () => {
  it('maps a bare site language to its default region', () => {
    expect(lcidForLocale('ko', MAP)).toBe(1042);
    expect(lcidForLocale('pt', MAP)).toBe(1046);
    expect(lcidForLocale('es', MAP)).toBe(3082);
  });

  it('prefers the regional id over the neutral one the SDK also lists', () => {
    expect(lcidForLocale('ko', MAP)).toBe(1042);
    expect(lcidForLocale('pt', MAP)).toBe(1046);
  });

  it('keeps an explicit region', () => {
    expect(lcidForLocale('zh-TW', MAP)).toBe(1028);
    expect(lcidForLocale('pt-PT', MAP)).toBe(2070);
  });

  it('returns null when the SDK has no such language', () => {
    expect(lcidForLocale('xx', MAP)).toBeNull();
    expect(lcidForLocale('', MAP)).toBeNull();
  });
});

function fakeEditor(initial: number) {
  let lang = initial;
  const history = { off: false, TurnOff: vi.fn(() => (history.off = true)), TurnOn: vi.fn(() => (history.off = false)) };
  const setDuringOff: boolean[] = [];
  const win = {
    editor: {
      WordControl: {
        m_oLogicDocument: {
          GetDefaultLanguage: () => lang,
          SetDefaultLanguage: (v: number) => {
            setDuringOff.push(history.off);
            lang = v;
          },
        },
      },
    },
    Asc: { g_oLcidNameToIdMap: MAP },
    AscCommon: { History: history },
  };
  return { win, history, setDuringOff, lang: () => lang };
}

describe('applyNewDocumentLanguage', () => {
  it('sets a Chinese blank presentation to Korean with history off', () => {
    const e = fakeEditor(2052);
    expect(applyNewDocumentLanguage(e.win, 'ko')).toBe(true);
    expect(e.lang()).toBe(1042);
    expect(e.setDuringOff).toEqual([true]);
    expect(e.history.TurnOn).toHaveBeenCalledTimes(1);
  });

  it('leaves the document alone when the language already matches', () => {
    const e = fakeEditor(1033);
    expect(applyNewDocumentLanguage(e.win, 'en')).toBe(true);
    expect(e.history.TurnOff).not.toHaveBeenCalled();
  });

  it('reports false when the SDK pieces are missing', () => {
    expect(applyNewDocumentLanguage({}, 'ko')).toBe(false);
  });
});
