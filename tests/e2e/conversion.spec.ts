import { readFileSync } from 'node:fs';
import {
  BlobReader,
  TextWriter,
  ZipReader,
  configure,
} from '@zip.js/zip.js';
import { expect, test } from '@playwright/test';
import { convert, waitReady } from './_helpers';

configure({ useWebWorkers: false });

async function zipEntryText(blob: Blob, name: string): Promise<string> {
  const reader = new ZipReader(new BlobReader(blob));
  const entries = await reader.getEntries();
  const entry = entries.find((candidate) => candidate.filename === name);
  if (!entry || entry.directory) throw new Error(`Missing XLSX entry: ${name}`);
  const text = await entry.getData(new TextWriter());
  await reader.close();
  return text;
}

test.describe('XLSX protection removal', () => {
  test('removes protection, reports the sheet name, and downloads with no upload', async ({
    page,
  }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (
        !url.startsWith('http://localhost:4321') &&
        !url.startsWith('data:') &&
        !url.startsWith('blob:')
      ) {
        externalRequests.push(url);
      }
    });

    await page.goto('/unlock-xlsx/');
    await waitReady(page);
    const download = await convert(page);

    expect(download.suggestedFilename()).toBe(
      'protected-workbook-unlocked.xlsx'
    );
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const bytes = readFileSync(downloadPath as string);
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);

    const output = new Blob([bytes]);
    expect(
      await zipEntryText(output, 'xl/worksheets/sheet1.xml')
    ).not.toContain('sheetProtection');
    expect(await zipEntryText(output, 'xl/workbook.xml')).not.toContain(
      'workbookProtection'
    );

    await expect(page.getByTestId('protected-sheets')).toContainText('Budget');
    await expect(
      page.getByTestId('workbook-protection-result')
    ).toBeVisible();
    expect(
      externalRequests,
      `unexpected cross-origin requests: ${externalRequests.join(', ')}`
    ).toHaveLength(0);
  });
});
