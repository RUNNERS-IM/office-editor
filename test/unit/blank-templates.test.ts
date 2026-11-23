import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { inflateRawSync } from 'node:zlib';
import { blankTemplatePath, loadBlankTemplate } from '../../lib/onlyoffice/blank-templates';

vi.mock('@ranuts/shared/i18n', () => ({ getOnlyOfficeLang: () => 'ko' }));

describe('blankTemplatePath', () => {
  it('gives Korean visitors the Korean template and others the default one', () => {
    expect(blankTemplatePath('docx', 'ko')).toBe('/runners/templates/blank-ko.docx');
    expect(blankTemplatePath('.docx', 'en')).toBe('/runners/templates/blank-default.docx');
    expect(blankTemplatePath('docx', 'pt-PT')).toBe('/runners/templates/blank-default.docx');
  });

  it('keeps the SDK blank for Chinese visitors and for other formats', () => {
    expect(blankTemplatePath('docx', 'zh-CN')).toBeNull();
    expect(blankTemplatePath('docx', 'zh-TW')).toBeNull();
    expect(blankTemplatePath('pptx', 'ko')).toBeNull();
    expect(blankTemplatePath('xlsx', 'en')).toBeNull();
  });
});

describe('loadBlankTemplate', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns the fetched bytes', async () => {
    vi.stubGlobal('location', { href: 'https://office.example/editor' });
    const fetchMock = vi.fn(async () => new Response(new Uint8Array([1, 2, 3])));
    vi.stubGlobal('fetch', fetchMock);
    const bytes = await loadBlankTemplate('docx');
    expect(bytes?.byteLength).toBe(3);
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toBe('https://office.example/runners/templates/blank-ko.docx');
  });

  it('falls back to the SDK blank when the template cannot be fetched', async () => {
    vi.stubGlobal('location', { href: 'https://office.example/editor' });
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
    expect(await loadBlankTemplate('docx')).toBeUndefined();
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))));
    expect(await loadBlankTemplate('docx')).toBeUndefined();
  });
});

/** Entries of a zip written with sizes in its local headers (as the templates are). */
function unzip(buf: Buffer): Record<string, string> {
  const out: Record<string, string> = {};
  let at = 0;
  while (buf.readUInt32LE(at) === 0x04034b50) {
    const method = buf.readUInt16LE(at + 8);
    const size = buf.readUInt32LE(at + 18);
    const nameLength = buf.readUInt16LE(at + 26);
    const extraLength = buf.readUInt16LE(at + 28);
    const name = buf.toString('utf8', at + 30, at + 30 + nameLength);
    const start = at + 30 + nameLength + extraLength;
    const data = buf.subarray(start, start + size);
    out[name] = (method === 8 ? inflateRawSync(data) : data).toString('utf8');
    at = start + size;
  }
  return out;
}

describe('shipped templates', () => {
  const read = (name: string) => unzip(readFileSync(`public/runners/templates/${name}`));

  it('carry no Chinese theme font and the intended default size', () => {
    for (const [name, size, ea] of [
      ['blank-ko.docx', '20', '맑은 고딕'],
      ['blank-default.docx', '22', ''],
    ] as const) {
      const files = read(name);
      const theme = files['word/theme/theme1.xml'];
      const styles = files['word/styles.xml'];
      expect(theme).not.toContain('等线');
      expect(theme).toContain('<a:minorFont><a:latin typeface="Calibri"></a:latin><a:ea typeface="' + ea + '">');
      expect(styles).toContain(`<w:sz w:val="${size}" />`);
      expect(styles).not.toMatch(/<w:docDefaults>.*zh-CN.*<\/w:docDefaults>/s);
      expect(files['docProps/core.xml']).not.toContain('lastModifiedBy');
    }
  });
});
