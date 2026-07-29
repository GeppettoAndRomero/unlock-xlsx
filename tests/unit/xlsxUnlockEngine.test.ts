import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  BlobReader,
  TextWriter,
  ZipReader,
  configure,
} from '@zip.js/zip.js';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { AppError } from '@/utils/appError';
import {
  unlockXlsx,
  unlockedFileName,
} from '@/utils/xlsxUnlockEngine';

configure({ useWebWorkers: false });

const xmlWindow = new JSDOM().window;
Object.defineProperty(globalThis, 'DOMParser', {
  value: xmlWindow.DOMParser,
  configurable: true,
});
Object.defineProperty(globalThis, 'XMLSerializer', {
  value: xmlWindow.XMLSerializer,
  configurable: true,
});

const fixtureBytes = readFileSync(
  resolve('tests/fixtures/xlsx/protected-workbook.xlsx')
);

function fixtureFile(): File {
  return new File([fixtureBytes], 'protected-workbook.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

async function entryText(blob: Blob, name: string): Promise<string> {
  const reader = new ZipReader(new BlobReader(blob));
  const entries = await reader.getEntries();
  const entry = entries.find((candidate) => candidate.filename === name);
  if (!entry || entry.directory) throw new Error(`Missing fixture entry: ${name}`);
  const text = await entry.getData(new TextWriter());
  await reader.close();
  return text;
}

describe('unlockXlsx', () => {
  it('removes sheet and workbook protection and reports the sheet name', async () => {
    const result = await unlockXlsx(fixtureFile());

    expect(result.protectedSheetNames).toEqual(['Budget']);
    expect(result.sheetProtectionCount).toBe(1);
    expect(result.workbookProtectionRemoved).toBe(true);
    expect(result.protectionsRemoved).toBe(2);
    expect(
      await entryText(result.blob, 'xl/worksheets/sheet1.xml')
    ).not.toContain('sheetProtection');
    expect(await entryText(result.blob, 'xl/workbook.xml')).not.toContain(
      'workbookProtection'
    );
  });

  it('keeps unrelated worksheet content unchanged', async () => {
    const original = await entryText(
      fixtureFile(),
      'xl/worksheets/sheet2.xml'
    );
    const result = await unlockXlsx(fixtureFile());
    expect(await entryText(result.blob, 'xl/worksheets/sheet2.xml')).toBe(
      original
    );
  });

  it('reports no protection when processing an already unlocked result', async () => {
    const first = await unlockXlsx(fixtureFile());
    const second = await unlockXlsx(
      new File([first.blob], 'already-unlocked.xlsx', {
        type: first.blob.type,
      })
    );
    expect(second.protectionsRemoved).toBe(0);
    expect(second.protectedSheetNames).toEqual([]);
    expect(second.workbookProtectionRemoved).toBe(false);
  });

  it('reports final progress', async () => {
    const updates: Array<{ completed: number; total: number }> = [];
    await unlockXlsx(fixtureFile(), (update) => updates.push(update));
    expect(updates.at(-1)?.completed).toBe(updates.at(-1)?.total);
    expect(updates.at(-1)?.total).toBeGreaterThan(0);
  });

  it('identifies an encrypted CFB container as an opening-password file', async () => {
    const cfbHeader = new Uint8Array([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
    ]);
    await expect(
      unlockXlsx(new File([cfbHeader], 'encrypted.xlsx'))
    ).rejects.toMatchObject<AppError>({ code: 'errOpenPasswordProtected' });
  });

  it('creates the specified output filename', () => {
    expect(unlockedFileName('quarterly.report.xlsx')).toBe(
      'quarterly.report-unlocked.xlsx'
    );
    expect(unlockedFileName('macro.xlsm')).toBe('macro-unlocked.xlsx');
  });
});
