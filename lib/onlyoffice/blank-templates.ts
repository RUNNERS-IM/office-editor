/**
 * RUNNERS: blank-document templates matched to the visitor's language.
 *
 * With no bytes, the SDK builds a new Word document or presentation from a
 * template compiled into it, and those templates are the Chinese edition's:
 * theme fonts 等线 (DengXian) / 等线 Light, text tagged zh-CN, and for Word
 * 10.5 pt on A4 with 3.17 cm side margins. A Korean visitor saw a Chinese font
 * name in the font box, and the file opened in another font on computers
 * without DengXian. The templates under public/runners/templates/ are those
 * same SDK files with only the theme fonts, default size, text language and
 * margins changed (see runners/README.md):
 *
 *   blank-ko.docx        Malgun Gothic 10 pt, ko-KR, Word (Korean) margins
 *   blank-default.docx   Calibri 11 pt, en-US, 2.54 cm margins
 *   blank-ko.pptx        Calibri Light / Calibri, Malgun Gothic for Korean, ko-KR
 *   blank-default.pptx   Calibri Light / Calibri, en-US
 *
 * Spreadsheets are left alone: the SDK blank workbook already uses Calibri 11.
 *
 * Chinese visitors keep the SDK blank, which already matches them. Any fetch
 * failure (offline before the file was cached, say) also falls back to it.
 */
import { getOnlyOfficeLang } from '@ranuts/shared/i18n';

/** Served path of the blank template for `ext` in `locale`, or null to keep the SDK blank. */
export function blankTemplatePath(ext: string, locale: string): string | null {
  const type = String(ext).replace(/^\./, '').toLowerCase();
  if (type !== 'docx' && type !== 'pptx') return null;
  const primary = String(locale || '').split(/[-_]/)[0].toLowerCase();
  if (primary === 'zh') return null;
  return `/runners/templates/blank-${primary === 'ko' ? 'ko' : 'default'}.${type}`;
}

/** Bytes of the blank template for a new `ext` document, or undefined to let the SDK build its own. */
export async function loadBlankTemplate(
  ext: string,
  signal?: AbortSignal,
  locale: string = getOnlyOfficeLang(),
): Promise<ArrayBuffer | undefined> {
  const path = blankTemplatePath(ext, locale);
  if (!path) return undefined;
  try {
    const response = await fetch(new URL(path, location.href), { signal });
    if (!response.ok) return undefined;
    const bytes = await response.arrayBuffer();
    return bytes.byteLength > 0 ? bytes : undefined;
  } catch (error) {
    if ((error as { name?: string } | null)?.name === 'AbortError') throw error;
    return undefined;
  }
}
